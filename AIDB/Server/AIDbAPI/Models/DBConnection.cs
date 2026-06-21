namespace AIDbAPI.Models
{
    public class DBConnection
    {
        public int Id { get; set; }
        public string ConnectionString { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string DatabaseType { get; set; } = string.Empty;
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public string Database { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string LastPing { get; set; } = string.Empty;
    }
}
