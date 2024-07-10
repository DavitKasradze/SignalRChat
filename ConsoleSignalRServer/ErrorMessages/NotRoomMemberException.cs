using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class NotRoomMemberException(string user) : ChatAppException(user + NotARoomMemberMessage)
{
    private const string NotARoomMemberMessage = " is not a member of this room.";
}