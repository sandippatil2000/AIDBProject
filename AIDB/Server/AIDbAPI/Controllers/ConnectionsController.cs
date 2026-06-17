using Microsoft.AspNetCore.Mvc;
using AIDb.Core.Services;
using AIDb.Core;
using AIDb;

namespace AIDbAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConnectionsController : ControllerBase
    {
        private readonly IConnectionService _connectionService;

        public ConnectionsController(IConnectionService connectionService)
        {
            _connectionService = connectionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetConnections()
        {
            var connections = await _connectionService.GetAIConnections();
            return Ok(connections);
        }

        [HttpPost]
        public async Task<IActionResult> AddConnection([FromBody] AIConnection connection)
        {
            if (connection == null)
            {
                return BadRequest("Connection data is null.");
            }

            await _connectionService.AddConnection(connection);
            return Ok();
        }

        [HttpDelete("{name}")]
        public async Task<IActionResult> DeleteConnection(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Connection name cannot be empty.");
            }

            await _connectionService.DeleteConnection(name);
            return Ok();
        }
    }
}
