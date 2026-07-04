using DbChatBOT;
using DbChatBOT.MCPServer;
using AIDb.Core.Models;
using AIDb.Core.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ModelContextProtocol;
using ModelContextProtocol.AspNetCore;
using ModelContextProtocol.AspNetCore.Authentication;
using ModelContextProtocol.Client;
using ModelContextProtocol.Server;
using System.ComponentModel;
using AIDb.Core;
var serverUrl = "http://localhost:7071/";
var inMemoryOAuthServerUrl = "https://localhost:7029";
// Create a generic host builder for
// dependency injection, logging, and configuration.
var builder = WebApplication.CreateBuilder(args);

// Configure logging for better integration with MCP clients.
builder.Logging.AddConsole(consoleLogOptions =>
{
    consoleLogOptions.LogToStandardErrorThreshold = LogLevel.Trace;
});

builder.Services.AddMcpServer(options =>
 {
     //options.ResourceMetadata = new()
     //{
     //    ResourceDocumentation = "https://docs.example.com/api/weather",
     //    AuthorizationServers = { inMemoryOAuthServerUrl },
     //    ScopesSupported = ["mcp:tools"],
     //};
 }).WithHttpTransport();

// Register the MCP server and configure it to use stdio transport.
// Scan the assembly for tool definitions.
builder.Services.AddScoped<IDatabaseService,SqlServerDatabaseService>();
builder.Services.AddScoped<AIService>();
builder.Services
    .AddMcpServer()
    .WithHttpTransport()
    .WithToolsFromAssembly()
    .WithTools<DbChatBOTServer>();

var host = builder.Build();
host.MapMcp("/mcp");
// Build and run the host. This starts the MCP server.
await host.RunAsync();