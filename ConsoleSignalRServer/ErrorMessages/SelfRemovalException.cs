using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class SelfRemovalException() : ChatAppException(SelfRemovalMessage)
{
    private const string SelfRemovalMessage = "You cannot remove yourself as a member.";
}