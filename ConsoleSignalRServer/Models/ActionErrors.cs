using System;

namespace ConsoleSignalRServer.Models;

public abstract class ActionErrors(string message) : Exception(message);