using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Timers;

namespace ConsoleSignalRServer.HubServices;

public class RoomDeletionService
{
    private readonly IHubContext<MessageHub> _hubContext;

    public RoomDeletionService(IHubContext<MessageHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task TimedRoomRemoval(string user, string roomName, int durationInMinutes)
    {
        var timer = new Timer(TimeSpan.FromMinutes(durationInMinutes).TotalMilliseconds);
        timer.Elapsed += async (_, _) => await OnTimedEvent(roomName);
        timer.AutoReset = false;
        timer.Start();

        return Task.CompletedTask;
    }

    private async Task OnTimedEvent(string roomName)
    {
        if (!MessageHub.RoomExists(roomName))
        {
            return;
        }
        
        await _hubContext.Clients.All.SendAsync("RoomDeleted", roomName);
    }
}