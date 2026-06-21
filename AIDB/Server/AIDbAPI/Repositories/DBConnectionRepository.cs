using AIDbAPI.Data;
using AIDbAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AIDbAPI.Repositories
{
    public class DBConnectionRepository : IDBConnectionRepository
    {
        private readonly AIDbContext _context;

        public DBConnectionRepository(AIDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DBConnection>> GetAllAsync()
        {
            return await _context.DBConnections.ToListAsync();
        }

        public async Task<DBConnection?> GetByIdAsync(int id)
        {
            return await _context.DBConnections.FindAsync(id);
        }

        public async Task<DBConnection> AddAsync(DBConnection dbConnection)
        {
            _context.DBConnections.Add(dbConnection);
            await _context.SaveChangesAsync();
            return dbConnection;
        }

        public async Task<DBConnection> UpdateAsync(DBConnection dbConnection)
        {
            var local = _context.DBConnections.Local.FirstOrDefault(entry => entry.Id == dbConnection.Id);
            if (local != null)
            {
                _context.Entry(local).State = EntityState.Detached;
            }
            _context.Entry(dbConnection).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return dbConnection;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var dbConnection = await _context.DBConnections.FindAsync(id);
            if (dbConnection == null)
            {
                return false;
            }

            _context.DBConnections.Remove(dbConnection);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
