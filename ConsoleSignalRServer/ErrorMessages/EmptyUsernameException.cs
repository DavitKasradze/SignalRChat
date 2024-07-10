using ConsoleSignalRServer.Models;

namespace ConsoleSignalRServer.ErrorMessages;

public class EmptyUsernameException() : ChatAppException(EmptyUsernameMessage)
{
    private const string EmptyUsernameMessage = "Username cannot be empty.";
}