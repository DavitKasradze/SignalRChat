﻿using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.Timers;
using ConsoleSignalRServer.HubServices;
using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer
{
    public class MessageHub : Hub
    {
        private readonly RoomDeletionService _roomDeletionService;
        private static readonly ConcurrentDictionary<string, RoomData> RoomData = new();
        
        // List to store all active rooms
        private static readonly List<string> Rooms = new();

        //(user -> List<MutedMembers>)
        private static readonly ConcurrentDictionary<string, List<string>> UserMutedMembers = new();

        //(user -> connectionId)
        private static readonly ConcurrentDictionary<string, string> Users = new();
        
        public MessageHub(RoomDeletionService roomDeletionService)
        {
            _roomDeletionService = roomDeletionService;
        }

        public override async Task OnConnectedAsync()
        {
            var connectionId = Context.ConnectionId;
            var user = Users.FirstOrDefault(u => u.Value == connectionId).Key;

            if (!string.IsNullOrEmpty(user))
            {
                await Clients.Caller.SendAsync("UserAlreadyRegistered", user);
                await Clients.Caller.SendAsync("AllRooms", Rooms);
            }

            await base.OnConnectedAsync();
        }

        public async Task GetAllRooms()
        {
            await Clients.Caller.SendAsync("AllRooms", Rooms);
        }

        public async Task BroadcastRoomCreated(string roomName, string user)
        {
            await Clients.All.SendAsync("RoomCreated", roomName, user);
        }


        public async Task SendMessageToRoom(string roomName, string user, string message)
        {
            if (!RoomData.TryGetValue(roomName, out var roomData) || !roomData.Members.Contains(user))
            {
                await Clients.Caller.SendAsync("ErrorMessage", "You are not a member of this room.");
                return;
            }
    
            if (roomData.MutedMembers.Contains(user))
            {
                await Clients.Caller.SendAsync("ErrorMessage", "You are muted in this room and cannot send messages.");
                return;
            }
    
            var fullMessage = $"{user}: {message}";
            
            if (roomData.Messages == null)
            {
                roomData.Messages = new List<string>();
            }

            roomData.Messages.Add(fullMessage);
    
            await Clients.Group(roomName).SendAsync("ReceiveMessage", new { RoomName = roomName, Content = fullMessage });
        }

        public async Task JoinRoom(string user, string roomName)
        {
            var connectionId = Context.ConnectionId;
            
            if (!RoomData.TryGetValue(roomName, out var roomData))
            {
                roomData = new RoomData
                {
                    Owner = user,
                    Messages = new List<string>(),
                    Members = new List<string>()
                };
                RoomData.TryAdd(roomName, roomData);
            }
            
            if (!Rooms.Contains(roomName))
            {
                Rooms.Add(roomName);
            }
            
            if (!roomData.Members.Contains(user))
            {
                roomData.Members.Add(user);
                
                var systemMessage = $"{user} has joined the room.";
                roomData.Messages.Add(systemMessage);
                await Clients.Group(roomName).SendAsync("ReceiveMessage", new { RoomName = roomName, Content = systemMessage });
            }
            
            await Groups.AddToGroupAsync(connectionId, roomName);
            
            await Clients.Group(roomName).SendAsync("ReceiveRoomMember", roomName, roomData.Members);
            
            await Clients.Caller.SendAsync("ReceiveExistingMessages", roomName, roomData.Messages);
        }
        
        public async Task CreateRoom(string user, string roomName)
        {
            if (RoomData.ContainsKey(roomName))
            {
                await Clients.Caller.SendAsync("ErrorMessage",
                    "Room name already exists. Please choose a different room name.");
                return;
            }

            Rooms.Add(roomName);
            var roomData = new RoomData
            {
                Owner = user,
                Messages = new List<string>(),
                Members = new List<string> { user }
            };
            RoomData.TryAdd(roomName, roomData);

            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            await Clients.Caller.SendAsync("RoomJoined", roomName, user);
            await Clients.Caller.SendAsync("ReceiveExistingMessages", roomName, roomData.Messages);
            await Clients.Group(roomName).SendAsync("ReceiveRoomMember", roomName, roomData.Members);

            await BroadcastRoomCreated(roomName, user);
        }

        public async Task DeleteRoom(string user, string roomName)
        {
            if (RoomData.TryGetValue(roomName, out var roomData) && roomData.Owner == user)
            {
                await RemoveRoomData(roomName);

                await Clients.All.SendAsync("RoomDeleted", roomName);
            }
            else
            {
                await Clients.Caller.SendAsync("ErrorMessage", "You are not the owner of this room.");
            }
        }

        public async Task ScheduledRoomRemoval(string user, string roomName, int durationInMinutes)
        {
            if (RoomData.TryGetValue(roomName, out var roomData) && roomData.Owner == user)
            {
                var timer = new Timer(TimeSpan.FromMinutes(durationInMinutes).TotalMilliseconds);
                timer.Elapsed += async (_, _) =>
                {
                    await RemoveRoomData(roomName);
                    await _roomDeletionService.TimedRemoveMessage(roomName);
                };
                timer.AutoReset = false;
                timer.Start();
            }
        }
        
        private async Task RemoveRoomData(string roomName)
        {
            Rooms.Remove(roomName);
            if (RoomData.TryGetValue(roomName, out var roomData))
            {
                RoomData.TryRemove(roomName, out _);
                
                foreach (var member in roomData.Members)
                {
                    if (Users.TryGetValue(member, out var connectionId))
                    {
                        await _roomDeletionService.RemoveGroupData(connectionId, roomName);
                    }
                }
            }
        }
        
        public async Task RemoveMember(string owner, string roomName, string memberToRemove)
        {
            if (memberToRemove == owner)
            {
                await Clients.Caller.SendAsync("ErrorMessage", "You cannot remove yourself as a member.");
                return;
            }

            if (RoomData.TryGetValue(roomName, out var roomData) && roomData.Owner == owner)
            {
                if (roomData.Members.Contains(memberToRemove))
                {
                    roomData.Members.Remove(memberToRemove);
                    await Clients.Group(roomName).SendAsync("ReceiveRoomMember", roomName, roomData.Members);
                    
                    roomData.Messages.RemoveAll(msg => msg.StartsWith(memberToRemove));

                    var systemMessage = $"{memberToRemove} has been removed from the room.";
                    roomData.Messages.Add(systemMessage);
                    await Clients.Group(roomName).SendAsync("ReceiveMessage",
                        new { RoomName = roomName, Content = systemMessage });

                    if (Users.TryGetValue(memberToRemove, out var memberConnectionId))
                    {
                        await Groups.RemoveFromGroupAsync(memberConnectionId, roomName);
                    }
                    else
                    {
                        await Clients.Caller.SendAsync("ErrorMessage",
                            $"{memberToRemove} is not connected to the server.");
                    }
                    
                }
                else
                {
                    await Clients.Caller.SendAsync("ErrorMessage", $"{memberToRemove} is not a member of this room.");
                }
            }
            else
            {
                await Clients.Caller.SendAsync("ErrorMessage", "You are not the owner of this room.");
            }
        }

        public List<string> GetRoomMembers(string roomName)
        {
            if (RoomData.TryGetValue(roomName, out var roomData))
            {
                return roomData.Members;
            }
            return new List<string>();
        }

        public async Task MuteMember(string user, string roomName, string memberToMute)
        {
            if (user == memberToMute)
            {
                await Clients.Caller.SendAsync("ErrorMessage", "You cannot mute yourself as a member.");
                return;
            }

            if (RoomData.TryGetValue(roomName, out var roomData))
            {
                if (roomData.Owner == user)
                {
                    if (roomData.MutedMembers == null)
                    {
                        roomData.MutedMembers = new List<string>();
                    }

                    roomData.MutedMembers.Add(memberToMute);

                    await Clients.Group(roomName).SendAsync("MemberMutedByOwner", user, roomName, memberToMute);
                }
                else
                {
                    if (!UserMutedMembers.ContainsKey(user))
                    {
                        UserMutedMembers[user] = new List<string>();
                    }

                    UserMutedMembers[user].Add(memberToMute);

                    var mutedMembers = UserMutedMembers[user];
                    await Clients.Caller.SendAsync("MemberMutedByUser", mutedMembers);
                }
            }
        }

        public async Task<bool> RegisterUser(string user)
        {
            if (string.IsNullOrEmpty(user))
            {
                await Clients.Caller.SendAsync("ErrorMessage", "Username cannot be empty.");
                return false;
            }

            if (Users.ContainsKey(user))
            {
                await Clients.Caller.SendAsync("UserAlreadyRegistered", user);
                return false;
            }

            Users.TryAdd(user, Context.ConnectionId);
            await Clients.Caller.SendAsync("UserRegistered", user);
            return true;
        }


        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var connectionId = Context.ConnectionId;
            var user = Users.FirstOrDefault(u => u.Value == connectionId).Key;

            if (!string.IsNullOrEmpty(user))
            {
                foreach (var roomDataEntry in RoomData)
                {
                    var roomName = roomDataEntry.Key;
                    var roomData = roomDataEntry.Value;
                    
                    if (roomData.Members.Contains(user))
                    {
                        roomData.Members.Remove(user);
                        
                        var systemMessage = $"{user} has left the room.";
                        roomData.Messages.Add(systemMessage);

                        await Clients.Group(roomName).SendAsync("ReceiveMessage",
                            new { RoomName = roomName, Content = systemMessage });

                        await Clients.Group(roomName).SendAsync("ReceiveRoomMember", roomName, roomData.Members);
                    }
                }
                
                Users.TryRemove(user, out _);
                
                await Clients.All.SendAsync("UserDisconnected", user);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}