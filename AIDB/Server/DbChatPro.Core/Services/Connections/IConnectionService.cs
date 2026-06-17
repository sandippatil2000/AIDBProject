using System.Text.Json;

namespace AIDb.Core.Services
{
    public interface IConnectionService
    {
        Task AddConnection(AIConnection connection);
        Task DeleteConnection(string name);
        Task<List<AIConnection>> GetAIConnections();
    }
}