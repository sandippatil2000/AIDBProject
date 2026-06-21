using AIDbAPI.Models;
using AIDbAPI.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace AIDbAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DBConnectionController : ControllerBase
    {
        private readonly IDBConnectionRepository _repository;

        public DBConnectionController(IDBConnectionRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DBConnection>>> GetAll()
        {
            var connections = await _repository.GetAllAsync();
            return Ok(connections);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DBConnection>> GetById(int id)
        {
            var connection = await _repository.GetByIdAsync(id);
            if (connection == null)
            {
                return NotFound();
            }
            return Ok(connection);
        }

        [HttpPost]
        public async Task<ActionResult<DBConnection>> Create(DBConnection dbConnection)
        {
            var created = await _repository.AddAsync(dbConnection);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DBConnection dbConnection)
        {
            if (id != dbConnection.Id)
            {
                return BadRequest("ID mismatch");
            }

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            var updated = await _repository.UpdateAsync(dbConnection);
            return Ok(new { id = updated.Id });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _repository.DeleteAsync(id);
            if (!deleted)
            {
                return Ok();
            }
            return Ok();
        }
    }
}
