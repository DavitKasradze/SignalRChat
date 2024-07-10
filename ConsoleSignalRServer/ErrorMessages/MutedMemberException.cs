using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class MutedMemberException() : ChatAppException(MutedMemberMessage)
{
    private const string MutedMemberMessage = "You are muted in this room and cannot send messages.";
}