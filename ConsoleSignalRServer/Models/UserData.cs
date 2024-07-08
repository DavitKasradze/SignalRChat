using System.Collections.Generic;

namespace ConsoleSignalRServer.Models;

public class UserData
{
    public string ConnectionId { get; set; }
    public List<string> MutedMembers { get; set; }
    
    public UserData()
    {
        MutedMembers = new List<string>();
    }
}
