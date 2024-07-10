using System;

namespace ConsoleSignalRServer.Models;

public static class ExceptionMessages
{
    private const string NotMemberMessage = "You are not a member of this room.";
    private const string MutedMemberMessage = "You are muted in this room and cannot send messages.";
    private const string RoomExistsMessage = "Room name already exists. Please choose a different room name.";
    private const string NotRoomOwner = "You are not the owner of this room.";
    private const string SelfRemoval = "You cannot remove yourself as a member.";
    private const string SelfMute = "You cannot mute yourself as a member.";
    private const string EmptyUsername = "Username cannot be empty.";
    private const string NotARoomMember = " is not a member of this room.";

    public class MembershipValidationException() : Exception(NotMemberMessage);
    public class MutedMemberException() : Exception(MutedMemberMessage);

    public class RoomExistsException() : Exception(RoomExistsMessage);
    public class RoomOwnerValidationException() : Exception(NotRoomOwner);
    public class SelfRemovalException() : Exception(SelfRemoval);
    public class SelfMuteException() : Exception(SelfMute);
    public class EmptyUsernameException() : Exception(EmptyUsername);
    public class NotARoomMemberException(string user) : Exception(user + NotARoomMember);
}