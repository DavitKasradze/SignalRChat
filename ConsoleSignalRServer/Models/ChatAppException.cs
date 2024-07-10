using System;

namespace ConsoleSignalRServer.Models;

public abstract class ChatAppException(string message) : Exception(message);