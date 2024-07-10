using System;
using System.Threading.Tasks;
using ConsoleSignalRServer.Models;
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
        catch (ExceptionMessages.MembershipValidationException ex)
        {
            await invocationContext.Hub.Clients.Caller.SendAsync(errorMessage, ex.Message);
            return null;
        }
        catch (ExceptionMessages.MutedMemberException ex)
        {
            await invocationContext.Hub.Clients.Caller.SendAsync(errorMessage, ex.Message);
            return null;
        }
        catch (ExceptionMessages.RoomExistsException ex)
        {
            await invocationContext.Hub.Clients.Caller.SendAsync(errorMessage, ex.Message);
            return null;
        }
        catch (ExceptionMessages.RoomOwnerValidationException ex)
        {
            await invocationContext.Hub.Clients.Caller.SendAsync(errorMessage, ex.Message);
            return null;
        }
        catch (ExceptionMessages.SelfRemovalException ex)
        {
            await invocationContext.Hub.Clients.Caller.SendAsync(errorMessage, ex.Message);
            return null;
        }
        catch (ExceptionMessages.SelfMuteException ex)
        {
            await invocationContext.Hub.Clients.Caller.SendAsync(errorMessage, ex.Message);
            return null;
        }
        catch (ExceptionMessages.EmptyUsernameException ex)
        {
            await invocationContext.Hub.Clients.Caller.SendAsync(errorMessage, ex.Message);
            return null;
        }
        catch (ExceptionMessages.NotARoomMemberException ex)
        {
            await invocationContext.Hub.Clients.Caller.SendAsync(errorMessage, ex.Message);
            return null;
        }
    }
}