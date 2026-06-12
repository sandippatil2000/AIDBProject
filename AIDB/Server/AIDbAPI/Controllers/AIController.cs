using Microsoft.AspNetCore.Mvc;
using DBChatPro;
using DBChatPro.Services;
using DBChatPro.Models;
using Microsoft.Extensions.AI;
using AIDbAPI.Models;


namespace AIDbAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;
        private readonly IDatabaseService _databaseService;
        private readonly IConnectionService _connectionService;

        public AIController(
            IAIService aiService,
            IDatabaseService databaseService,
            IConnectionService connectionService)
        {
            _aiService = aiService;
            _databaseService = databaseService;
            _connectionService = connectionService;
        }

        /// <summary>
        /// Generates an AI-powered SQL query for a given connection and user prompt.
        /// </summary>
        /// <remarks>
        /// POST /api/AI/query
        /// </remarks>
        [HttpPost("AISqlQuery")]
        public async Task<IActionResult> GetAISQLQuery([FromBody] AIQueryRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.UserPrompt))
                return BadRequest("User prompt cannot be empty.");

            if (string.IsNullOrWhiteSpace(request.ConnectionName))
                return BadRequest("Connection name cannot be empty.");

            // Resolve the connection
            var connections = await _connectionService.GetAIConnections();
            var connection = connections.FirstOrDefault(c => c.Name == request.ConnectionName);

            if (connection == null)
                return NotFound($"Connection '{request.ConnectionName}' not found.");

            // Fetch the current schema for the connection
            DatabaseSchema schema;
            try
            {
                schema = await _databaseService.GenerateSchema(connection);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to retrieve database schema: {ex.Message}");
            }

            // Ask the AI service for a SQL query
            try
            {
                var aiQuery = await _aiService.GetAISQLQuery(
                    request.AiModel,
                    request.AiService,
                    request.UserPrompt,
                    schema,
                    connection.databaseType);

                return Ok(aiQuery);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"AI service error: {ex.Message}");
            }
        }

        /// <summary>
        /// Sends a free-form chat prompt to the AI service and returns the response.
        /// </summary>
        /// <remarks>
        /// POST /api/AI/chat
        /// </remarks>
        [HttpPost("chat")]
        public async Task<IActionResult> ChatPrompt([FromBody] AIChatRequest request)
        {
            if (request?.Messages == null || request.Messages.Count == 0)
                return BadRequest("At least one chat message is required.");

            try
            {
                var chatMessages = request.Messages
                    .Select(m => new ChatMessage(
                        m.Role.Equals("user", StringComparison.OrdinalIgnoreCase)
                            ? ChatRole.User
                            : ChatRole.Assistant,
                        m.Content))
                    .ToList();

                var response = await _aiService.ChatPrompt(chatMessages, request.AiModel, request.AiService);
                return Ok(new { reply = response.Messages[0].Text });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"AI service error: {ex.Message}");
            }
        }
    

    /// <summary>
        /// Sends a free-form chat prompt to the AI service and returns the response.
        /// </summary>
        /// <remarks>
        /// POST /api/AI/chat
        /// </remarks>
        [HttpPost("RecommendCharts")]
        public async Task<IActionResult> RecommendCharts([FromBody] AIRecommendChartsRequest request)
        {
            if (request == null )
                return BadRequest("At least one chat message is required.");

            try
            {
            
                var response = await _aiService.RecommendChartsAI(request.AiModel,request.AiService, request.Schema, request.Title);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"AI service error: {ex.Message}");
            }
        }
    }

}
