using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.Timers;
using ConsoleSignalRServer.HubServices;

namespace ConsoleSignalRServer
{
    public class MessageHub : Hub
    {
        private readonly RoomDeletionService _roomDeletionService;
        private static readonly ConcurrentDictionary<string, List<string>> RoomMessages = new();
        private static readonly ConcurrentDictionary<string, string> RoomOwners = new();
        private static readonly ConcurrentDictionary<string, List<string>> RoomMembers = new();
        private static readonly List<string> Rooms = new();
        private static readonly ConcurrentDictionary<string, string> Users = new();
        private static readonly ConcurrentDictionary<string, List<string>> RoomMutedMembers = new();
        private static readonly ConcurrentDictionary<string, List<string>> UserMutedMembers = new();
        
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
            if (!RoomMembers.TryGetValue(roomName, out var members) || !members.Contains(user))
            {
                await Clients.Caller.SendAsync("ErrorMessage", "You are not a member of this room.");
                return;
            }
            
            if (RoomMutedMembers.TryGetValue(roomName, out var roomMutedMembers) && roomMutedMembers.Contains(user))
            {
                await Clients.Caller.SendAsync("ErrorMessage", "You are muted in this room and cannot send messages.");
                return;
            }
            
            var fullMessage = $"{user}: {message}";

            if (!RoomMessages.TryGetValue(roomName, out var messages))
            {
                messages = new List<string>();
                RoomMessages.TryAdd(roomName, messages);
            }

            messages.Add(fullMessage);
            
            await Clients.Group(roomName).SendAsync("ReceiveMessage", new { RoomName = roomName, Content = fullMessage });
        }

        public async Task JoinRoom(string user, string roomName)
        {
            var connectionId = Context.ConnectionId;

            if (!Users.ContainsKey(user))
            {
                await Clients.Caller.SendAsync("ErrorMessage",
                    "Username does not exist. Please choose a different username.");
                return;
            }

            if (!Rooms.Contains(roomName))
            {
                Rooms.Add(roomName);
                RoomOwners.TryAdd(roomName, user);
                RoomMessages.TryAdd(roomName, new List<string>());
                RoomMembers.TryAdd(roomName, new List<string>());
            }

            if (RoomMembers.TryGetValue(roomName, out var members) && !members.Contains(user))
            {
                members.Add(user);
                var systemMessage = $"{user} has joined the room.";
                RoomMessages[roomName].Add(systemMessage);
                await Clients.Group(roomName).SendAsync("ReceiveMessage", new { RoomName = roomName, Content = systemMessage });
            }
            
            await Groups.AddToGroupAsync(connectionId, roomName);
            await Clients.Group(roomName).SendAsync("ReceiveRoomMember", roomName, members);
            await Clients.Caller.SendAsync("ReceiveExistingMessages", roomName, RoomMessages[roomName]);
        }
        
        public async Task CreateRoom(string user, string roomName)
        {
            if (!Users.ContainsKey(user))
            {
                await Clients.Caller.SendAsync("ErrorMessage",
                    "You must register your username before creating a room.");
                return;
            }

            if (Rooms.Contains(roomName))
            {
                await Clients.Caller.SendAsync("ErrorMessage",
                    "Room name already exists. Please choose a different room name.");
                return;
            }

            Rooms.Add(roomName);
            RoomOwners.TryAdd(roomName, user);
            RoomMessages.TryAdd(roomName, new List<string>());
            RoomMembers.TryAdd(roomName, new List<string> { user });

            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            await Clients.Caller.SendAsync("RoomJoined", roomName, user);
            await Clients.Caller.SendAsync("ReceiveExistingMessages", roomName, RoomMessages[roomName]);
            await Clients.Group(roomName).SendAsync("ReceiveRoomMember", roomName, RoomMembers[roomName]);

            await BroadcastRoomCreated(roomName, user);
        }

        public async Task DeleteRoom(string user, string roomName)
        {
            if (RoomOwners.TryGetValue(roomName, out var owner) && owner == user)
            {
                await RemoveRoomData(user, roomName);

                await Clients.All.SendAsync("RoomDeleted", roomName);
            }
            else
            {
                await Clients.Caller.SendAsync("ErrorMessage", "You are not the owner of this room.");
            }
        }

        public async Task ScheduledRoomRemoval(string user, string roomName, int durationInMinutes)
        {
            if (RoomOwners.TryGetValue(roomName, out var owner) && owner == user)
            {
                await _roomDeletionService.ScheduledRoomRemoval(user, roomName, durationInMinutes);
                
                var timer = new Timer(TimeSpan.FromMinutes(durationInMinutes).TotalMilliseconds);
                timer.Elapsed += async (_, _) => await RemoveRoomData(user, roomName);
                timer.AutoReset = false;
                timer.Start();
            }
        }
        
        private async Task RemoveRoomData(string user, string roomName)
        {
            Rooms.Remove(roomName);
            RoomOwners.TryRemove(roomName, out _);
            RoomMessages.TryRemove(roomName, out _);
            RoomMembers.TryRemove(roomName, out _);

            foreach (var connectionId in RoomMembers.Keys.ToList())
            {
                if (RoomMembers.TryGetValue(roomName, out var members) && members.Contains(user))
                {
                    members.Remove(user);
                    await Groups.RemoveFromGroupAsync(connectionId, roomName);
                }
            }
        }
        
        public static bool RoomExists(string roomName)
        {
            return Rooms.Contains(roomName);
        }
        
        public async Task RemoveMember(string owner, string roomName, string memberToRemove)
        {
            if (memberToRemove == owner)
            {
                await Clients.Caller.SendAsync("ErrorMessage", "You cannot remove yourself as a member.");
                return;
            }

            if (RoomOwners.TryGetValue(roomName, out var roomOwner) && roomOwner == owner)
            {
                if (RoomMembers.TryGetValue(roomName, out var members) && members.Contains(memberToRemove))
                {
                    members.Remove(memberToRemove);
                    await Clients.Group(roomName).SendAsync("ReceiveRoomMember", roomName, members);

                    if (RoomMessages.TryGetValue(roomName, out var messages))
                    {
                        messages.RemoveAll(msg => msg.StartsWith(memberToRemove));
                    }

                    var systemMessage = $"{memberToRemove} has been removed from the room.";
                    RoomMessages[roomName].Add(systemMessage);
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
            if (RoomMembers.TryGetValue(roomName, out var members))
            {
                return members;
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

            if (RoomOwners.TryGetValue(roomName, out var roomOwner) && roomOwner == user)
            {
                if (!RoomMutedMembers.ContainsKey(roomName))
                {
                    RoomMutedMembers[roomName] = new List<string>();
                }
                RoomMutedMembers[roomName].Add(memberToMute);

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
                foreach (var roomName in RoomMembers.Keys.ToList())
                {
                    if (RoomMembers.TryGetValue(roomName, out var members) && members.Contains(user))
                    {
                        members.Remove(user);
                        await Clients.Group(roomName).SendAsync("ReceiveMessage",
                            new { RoomName = roomName, Content = $"{user} has left the room." });
                        await Clients.Group(roomName).SendAsync("ReceiveRoomMember", roomName, members);
                    }
                }
                
                Users.TryRemove(user, out _);
                
                await Clients.All.SendAsync("UserDisconnected", user);
            }

            await base.OnDisconnectedAsync(exception);
        }

    }
}