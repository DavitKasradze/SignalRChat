using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class SelfMute() : ActionErrors(SelfMuteMessage)
{
    private const string SelfMuteMessage = "You cannot mute yourself as a member.";
}