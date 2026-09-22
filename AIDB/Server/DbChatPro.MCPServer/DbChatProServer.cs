using AIDb.Core;
using AIDb.Core.Models;
using AIDb.Core.Services;
using Microsoft.Extensions.Configuration;
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace DbChatBOT.MCPServer
{
    [McpServerToolType]
    public class DbChatBOTServer
    {
        private readonly IDatabaseService _dataService;
        private readonly AIService _aiService;

        public DbChatBOTServer(IDatabaseService dataService, AIService aiService)
        {
            _dataService = dataService;
            _aiService = aiService;
        }

        // Tool: Converts user prompt to SQL, runs it, returns results
        [McpServerTool, Description("Translates the user prompt into a SQL query, runs the query and returns the results.")]
        public async Task<List<List<string>>> GetSqlDataForUserPrompt(
                IServiceProvider serviceProvider,
                IConfiguration config,
                [Description("The prompt from the user to convert to SQL.")] string prompt,
                [Description("The AI model name or Azure OpenAI model deployment name to use to convert the user prompt to SQL. (Examples:gpt-4.1)")] string aiModel,
                [Description("The AI platform to use. (Must be OpenAI, AzureOpenAI, GitHubModels)")] string aiPlatform
            )
        {
            var databaseType = config.GetValue<string>("DATABASETYPE");
            var databaseConnectionString = config.GetValue<string>("DATABASECONNECTIONSTRING");

            // Validate required config
            if (string.IsNullOrEmpty(databaseConnectionString))
            {
                throw new ArgumentException("DATABASECONNECTIONSTRING is not set in the configuration.");
            }
            if(string.IsNullOrEmpty(databaseType))
            {
                throw new ArgumentException("DATABASETYPE is not set in the configuration.");
            }
            if (string.IsNullOrEmpty(aiModel))
            {
                throw new ArgumentException("aiModel is required.");
            }
            if(string.IsNullOrEmpty(aiPlatform))
            {
                throw new ArgumentException("aiPlatform is required.");
            }
            if(string.IsNullOrEmpty(prompt))
            {
                throw new ArgumentException("prompt is required.");
            }

            var connection = new AIConnection() { connectionString = databaseConnectionString };
            var dbSchema = await _dataService.GenerateSchema(connection);

            var aiResponse = await _aiService.GetAISQLQuery(aiModel, aiPlatform, prompt, dbSchema, databaseType);
            var RowData = await _dataService.GetDataTable(connection, aiResponse.query);
            return RowData;
        }

        // Tool: Returns the database schema
        //[McpServerTool, Description("Gets the schema of the configured database.")]
        public async Task<DatabaseSchema> GetDatabaseSchema(
                IServiceProvider serviceProvider,
                IConfiguration config
            )
        {
            var databaseConnectionString = config.GetValue<string>("DATABASECONNECTIONSTRING");
            if (string.IsNullOrEmpty(databaseConnectionString))
            {
                throw new ArgumentException("DATABASECONNECTIONSTRING is not set in the configuration.");
            }

            var connection = new AIConnection() { connectionString = databaseConnectionString };
            var dbSchema = await _dataService.GenerateSchema(connection);
            return dbSchema;
        }

        // Tool: Returns an AI-generated SQL query for a prompt
        //[McpServerTool, Description("Gets an AI generated SQL query based on the user's prompt and configured database schema.")]
        public async Task<string> GetAIGeneratedSQLQuery(
                IServiceProvider serviceProvider,
                IConfiguration config,
                [Description("The prompt from the user to convert to SQL.")] string prompt,
                [Description("The AI model name or Azure OpenAI model deployment name to use to convert the user prompt to SQL. (Examples: gpt-4o, gpt-4.1)")] string aiModel,
                [Description("The AI platform to use. (Must be AzureOpenAI, OpenAI, GitHubModels, or AWSBedrock)")] string aiPlatform
            )
        {
            var databaseType = config.GetValue<string>("DATABASETYPE");
            var databaseConnectionString = config.GetValue<string>("DATABASECONNECTIONSTRING");
            if (string.IsNullOrEmpty(databaseConnectionString))
            {
                throw new ArgumentException("DATABASECONNECTIONSTRING is not set in the configuration.");
            }
            if(string.IsNullOrEmpty(databaseType))
            {
                throw new ArgumentException("DATABASETYPE is not set in the configuration.");
            }
            if (string.IsNullOrEmpty(aiModel))
            {
                throw new ArgumentException("aiModel is required.");
            }
            if(string.IsNullOrEmpty(aiPlatform))
            {
                throw new ArgumentException("aiPlatform is required.");
            }
            if(string.IsNullOrEmpty(prompt))
            {
                throw new ArgumentException("prompt is required.");
            }

            var connection = new AIConnection() { connectionString = databaseConnectionString };
            var dbSchema = await _dataService.GenerateSchema(connection);

            var aiResponse = await _aiService.GetAISQLQuery(aiModel, aiPlatform, prompt, dbSchema, databaseType);
            return aiResponse.query;
        }
    }
}
