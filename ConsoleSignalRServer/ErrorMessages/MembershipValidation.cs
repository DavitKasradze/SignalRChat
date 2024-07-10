using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class MembershipValidation() : ActionErrors(NotMemberMessage)
{
    private const string NotMemberMessage = "You are not a member of this room.";
}