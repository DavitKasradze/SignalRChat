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

    public async Task TimedRemoveMessage(string roomName)
    {
        await _hubContext.Clients.All.SendAsync("RoomDeleted", roomName);
    }

    public async Task RemoveGroupData(string connectionId ,string roomName)
    {
        await _hubContext.Groups.RemoveFromGroupAsync(connectionId, roomName);
    }
}