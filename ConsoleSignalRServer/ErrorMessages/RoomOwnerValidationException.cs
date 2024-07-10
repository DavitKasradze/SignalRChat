using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class RoomOwnerValidationException() : ExceptionMessages(NotRoomOwnerMessage)
{
    private const string NotRoomOwnerMessage = "You are not the owner of this room.";
}