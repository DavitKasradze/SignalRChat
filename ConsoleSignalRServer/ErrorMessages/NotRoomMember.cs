using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class NotRoomMember(string user) : ActionErrors(user + NotARoomMemberMessage)
{
    private const string NotARoomMemberMessage = " is not a member of this room.";
}