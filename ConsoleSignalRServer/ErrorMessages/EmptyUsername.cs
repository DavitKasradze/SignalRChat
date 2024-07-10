using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class EmptyUsername() : ActionErrors(EmptyUsernameMessage)
{
    private const string EmptyUsernameMessage = "Username cannot be empty.";
}