using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class NotARoomMemberException(string user) : ExceptionMessages(user + NotARoomMemberMessage)
{
    private const string NotARoomMemberMessage = " is not a member of this room.";
}