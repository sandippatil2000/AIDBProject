using AIDbAPI.Models;
using AIDbAPI.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace AIDbAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QueryReportController : ControllerBase
    {
        private readonly IQueryReportRepository _repository;

        public QueryReportController(IQueryReportRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<QueryReport>>> GetAll()
        {
            var reports = await _repository.GetAllAsync();
            return Ok(reports);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<QueryReport>> GetById(int id)
        {
            var report = await _repository.GetByIdAsync(id);
            if (report == null)
            {
                return NotFound();
            }
            return Ok(report);
        }

        [HttpPost]
        public async Task<ActionResult<QueryReport>> Create(QueryReport queryReport)
        {
            var created = await _repository.AddAsync(queryReport);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, QueryReport queryReport)
        {
            if (id != queryReport.Id)
            {
                return BadRequest("ID mismatch");
            }

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            await _repository.UpdateAsync(queryReport);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _repository.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}
