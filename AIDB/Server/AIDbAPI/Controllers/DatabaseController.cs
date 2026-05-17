using Microsoft.AspNetCore.Mvc;
using DBChatPro.Services;
using DBChatPro;

namespace AIDbAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseController : ControllerBase
    {
        private readonly IDatabaseService _databaseService;
        private readonly IConnectionService _connectionService;

        public DatabaseController(IDatabaseService databaseService, IConnectionService connectionService)
        {
            _databaseService = databaseService;
            _connectionService = connectionService;
        }

        [HttpPost("datatable/{connectionName}")]
        public async Task<IActionResult> GetDataTable(string connectionName, [FromBody] QueryRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.SqlQuery))
            {
                return BadRequest("SQL query cannot be empty.");
            }

            var connections = await _connectionService.GetAIConnections();
            var connection = connections.FirstOrDefault(c => c.Name == connectionName);

            if (connection == null)
            {
                return NotFound($"Connection '{connectionName}' not found.");
            }

            try
            {
                var result = await _databaseService.GetDataTable(connection, request.SqlQuery);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("schema/{connectionName}")]
        public async Task<IActionResult> GenerateSchema(string connectionName)
        {
            var connections = await _connectionService.GetAIConnections();
            var connection = connections.FirstOrDefault(c => c.Name == connectionName);

            if (connection == null)
            {
                return NotFound($"Connection '{connectionName}' not found.");
            }

            try
            {
                var schema = await _databaseService.GenerateSchema(connection);
                return Ok(schema);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class QueryRequest
    {
        public string SqlQuery { get; set; }
    }
}
