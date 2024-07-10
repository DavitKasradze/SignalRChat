using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class RoomExists() : ActionErrors(RoomExistsMessage)
{
    private const string RoomExistsMessage = "Room name already exists. Please choose a different room name.";
}