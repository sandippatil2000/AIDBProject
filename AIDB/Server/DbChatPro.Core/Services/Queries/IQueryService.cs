using AIDb.Core.Models;

namespace AIDb.Core
{
    public interface IQueryService
    {
        Task<List<HistoryItem>> GetQueries(string connectionName, QueryType queryType);
        Task SaveQuery(string query, string connectionName, QueryType queryType);
    }
}