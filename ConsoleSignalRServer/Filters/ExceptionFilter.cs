using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace ConsoleSignalRServer.Filters;

public class ExceptionFilter : IHubFilter
{
    public async ValueTask<object> InvokeMethodAsync(
        HubInvocationContext invocationContext, Func<HubInvocationContext, ValueTask<object>> next)
    {
        var errorMessage = "ErrorMessage";
        try
        {
            return await next(invocationContext);
        }
        catch (Models.ExceptionMessages ex)
        {
            await invocationContext.Hub.Clients.Caller.SendAsync(errorMessage, ex.Message);
            return null;
        }
    }
}