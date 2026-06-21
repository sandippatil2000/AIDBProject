using AIDbAPI.Data;
using AIDbAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AIDbAPI.Repositories
{
    public class QueryReportRepository : IQueryReportRepository
    {
        private readonly AIDbContext _context;

        public QueryReportRepository(AIDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<QueryReport>> GetAllAsync()
        {
            return await _context.QueryReports.ToListAsync();
        }

        public async Task<QueryReport?> GetByIdAsync(int id)
        {
            return await _context.QueryReports.FindAsync(id);
        }

        public async Task<QueryReport> AddAsync(QueryReport queryReport)
        {
            _context.QueryReports.Add(queryReport);
            await _context.SaveChangesAsync();
            return queryReport;
        }

        public async Task<QueryReport> UpdateAsync(QueryReport queryReport)
        {
            var local = _context.QueryReports.Local.FirstOrDefault(entry => entry.Id == queryReport.Id);
            if (local != null)
            {
                _context.Entry(local).State = EntityState.Detached;
            }
            _context.Entry(queryReport).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return queryReport;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var queryReport = await _context.QueryReports.FindAsync(id);
            if (queryReport == null)
            {
                return false;
            }

            _context.QueryReports.Remove(queryReport);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
