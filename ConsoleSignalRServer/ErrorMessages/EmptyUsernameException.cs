using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class EmptyUsernameException() : ExceptionMessages(EmptyUsernameMessage)
{
    private const string EmptyUsernameMessage = "Username cannot be empty.";
}