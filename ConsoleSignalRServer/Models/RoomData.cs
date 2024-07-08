using System.Collections.Generic;

namespace ConsoleSignalRServer.Models;

public class RoomData
{
    public List<string> Messages { get; set; }
    public string Owner { get; set; }
    public List<string> Members { get; set; }
    public List<string> MutedMembers { get; set; }

    public RoomData()
    {
        Messages = new List<string>();
        Members = new List<string>();
        MutedMembers = new List<string>();
    }
}