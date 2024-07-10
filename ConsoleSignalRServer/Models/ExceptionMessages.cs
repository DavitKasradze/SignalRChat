using System;

namespace ConsoleSignalRServer.Models;

public abstract class ExceptionMessages(string message) : Exception(message);