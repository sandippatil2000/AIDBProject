using AIDb.Core.Models;

namespace AIDb.Core
{
    public interface IDatabaseService
    {
        Task<List<List<string>>> GetDataTable(AIConnection conn, string sqlQuery);
        Task<DatabaseSchema> GenerateSchema(AIConnection conn);
    }
}