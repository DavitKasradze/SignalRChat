using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using ScoreboardSignalR.Models;

namespace ScoreboardSignalR;

public class ScoreboardHub : Hub
{
    public async Task UpdateScoreboard(ScoreboardInput input)
    {
        await Clients.All.SendAsync("ReceiveScoreboardUpdate", input);
    }
}