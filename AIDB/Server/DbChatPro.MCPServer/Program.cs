using AIDb.Core;
using AIDb.Core.Services;
using DbChatBOT.MCPServer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddConsole(consoleLogOptions =>
{
    consoleLogOptions.LogToStandardErrorThreshold = LogLevel.Trace;
});

builder.Services.AddMcpServer(options =>
 {
 }).WithHttpTransport();

builder.Services.AddScoped<IDatabaseService,SqlServerDatabaseService>();
builder.Services.AddScoped<AIService>();
builder.Services
    .AddMcpServer()
    .WithHttpTransport()
    .WithToolsFromAssembly()
    .WithTools<DbChatBOTServer>();

var host = builder.Build();
host.MapMcp("/mcp");
await host.RunAsync();