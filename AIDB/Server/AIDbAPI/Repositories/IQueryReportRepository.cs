using AIDbAPI.Models;

namespace AIDbAPI.Repositories
{
    public interface IQueryReportRepository
    {
        Task<IEnumerable<QueryReport>> GetAllAsync();
        Task<QueryReport?> GetByIdAsync(int id);
        Task<QueryReport> AddAsync(QueryReport queryReport);
        Task<QueryReport> UpdateAsync(QueryReport queryReport);
        Task<bool> DeleteAsync(int id);
    }
}
