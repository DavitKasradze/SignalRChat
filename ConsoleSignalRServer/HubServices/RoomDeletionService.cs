using Microsoft.AspNetCore.SignalR;
using System;
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

    public Task ScheduledRoomRemoval(string user, string roomName, int durationInMinutes)
    {
        var timer = new Timer(TimeSpan.FromMinutes(durationInMinutes).TotalMilliseconds);
        timer.Elapsed += async (_, _) => await OnTimedEvent(user, roomName, timer);
        timer.AutoReset = false;
        timer.Start();

        return Task.CompletedTask;
    }

    private async Task OnTimedEvent(string user, string roomName, Timer timer)
    {
        if (!await MessageHub.RoomExists(roomName))
        {
            timer.Stop();
            return;
        }
        
        await _hubContext.Clients.All.SendAsync("ReceiveMessage", $"{user} triggered room deletion for {roomName}");
        
        await _hubContext.Clients.All.SendAsync("RoomDeleted", roomName);

        timer.Stop();
    }
}