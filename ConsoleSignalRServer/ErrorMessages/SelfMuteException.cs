using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class SelfMuteException() : ChatAppException(SelfMuteMessage)
{
    private const string SelfMuteMessage = "You cannot mute yourself as a member.";
}