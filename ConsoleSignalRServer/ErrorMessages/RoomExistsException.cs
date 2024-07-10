using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class RoomExistsException() : ChatAppException(RoomExistsMessage)
{
    private const string RoomExistsMessage = "Room name already exists. Please choose a different room name.";
}