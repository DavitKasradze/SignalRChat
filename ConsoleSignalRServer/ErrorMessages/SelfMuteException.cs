using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class SelfMuteException() : ExceptionMessages(SelfMuteMessage)
{
    private const string SelfMuteMessage = "You cannot mute yourself as a member.";
}