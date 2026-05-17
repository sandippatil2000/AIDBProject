using System.Runtime.CompilerServices;
using System.Text.Json;
using DbChatPro.Core.Data;

namespace DBChatPro.Services
{
    public class InMemoryConnectionService : IConnectionService
    {
        private List<AIConnection> connections = ConnectionData.GetConnectionData();

        public async Task<List<AIConnection>> GetAIConnections()
        {
            return connections;
        }

        public async Task AddConnection(AIConnection connection)
        {
            connections.Add(connection);
        }

        public async Task DeleteConnection(string name)
        {
            var connection = connections.FirstOrDefault(x => x.Name == name);
            if (connection != null)
            {
                connections.Remove(connection);
            }
        }
    }
}
