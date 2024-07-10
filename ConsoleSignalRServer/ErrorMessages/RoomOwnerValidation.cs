using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class RoomOwnerValidation() : ActionErrors(NotRoomOwnerMessage)
{
    private const string NotRoomOwnerMessage = "You are not the owner of this room.";
}