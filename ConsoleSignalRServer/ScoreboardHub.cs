using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace ConsoleSignalRServer
{
    public class ScoreboardHub : Hub
    {
        public async Task UpdateScoreboard(string fieldName, string newValue)
        {
            // Broadcast the updated field to all clients
            await Clients.All.SendAsync("ReceiveScoreboardUpdate", fieldName, newValue);
        }
    }
}