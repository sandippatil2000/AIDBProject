namespace AIDb.Core
{
    public class AIConnection
    {
        public string connectionString { get; set; }
        public string Name { get; set; }
        public string databaseType { get; set; }
        public int id { get; set; }
        public string host { get; set; }
        public int port { get; set; }
        public string database { get; set; }
        public string status { get; set; }
        public string lastPing { get; set; }
    }

}
