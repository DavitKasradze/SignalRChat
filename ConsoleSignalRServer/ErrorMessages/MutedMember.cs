using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class MutedMember() : ActionErrors(MutedMemberMessage)
{
    private const string MutedMemberMessage = "You are muted in this room and cannot send messages.";
}