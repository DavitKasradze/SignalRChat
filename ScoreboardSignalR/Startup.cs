using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ScoreboardSignalR;

public class Startup
{
    public static void ConfigureServices(IServiceCollection services)
    {
        services.AddSignalR();
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder.WithOrigins("http://localhost:63342")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
    }

    public static void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseRouting();
        app.UseStaticFiles();
        app.UseCors();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapHub<ScoreboardHub>("/scoreboardHub");
        });
    }
}