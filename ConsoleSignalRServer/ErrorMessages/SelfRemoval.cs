using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class SelfRemoval() : ActionErrors(SelfRemovalMessage)
{
    private const string SelfRemovalMessage = "You cannot remove yourself as a member.";
}