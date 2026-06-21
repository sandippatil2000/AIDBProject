using AIDbAPI.Models;

namespace AIDbAPI.Repositories
{
    public interface IDBConnectionRepository
    {
        Task<IEnumerable<DBConnection>> GetAllAsync();
        Task<DBConnection?> GetByIdAsync(int id);
        Task<DBConnection> AddAsync(DBConnection dbConnection);
        Task<DBConnection> UpdateAsync(DBConnection dbConnection);
        Task<bool> DeleteAsync(int id);
    }
}
