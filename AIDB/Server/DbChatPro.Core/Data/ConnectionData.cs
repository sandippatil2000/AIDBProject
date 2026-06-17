using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AIDb.Core;

namespace AIDb.Core.Data
{
    public class ConnectionData
    {
        public static List<AIConnection> GetConnectionData()
        {
            return new List<AIConnection>
            {
                new AIConnection
                {
                    id = 1,
                    Name = "Adventure Works",
                    databaseType = "MSSQL",
                    host = "localhost",
                    port = 5432,
                    database = "AdventureWorks2025",
                    status = "connected",
                    lastPing = "2 mins ago",
                    connectionString = "Data Source=ADMIN;Initial Catalog=AdventureWorks2025;Persist Security Info=True;User ID=sa;Password=sa123;Encrypt=True;Trust Server Certificate=True"
                },
                new AIConnection
                {
                    id = 2,
                    Name = "MY SQL",
                    databaseType = "MYSQL",
                    host = "analytics.snowflakecomputing.com",
                    port = 443,
                    database = "ANALYTICS_DB",
                    status = "offline",
                    lastPing = "1 hr ago",
                    connectionString = ""
                },
                new AIConnection
                {
                    id = 3,
                    Name = "dvd Rental",
                    databaseType = "POSTGRESQL",
                    host = "10.0.1.45",
                    port = 3306,
                    database = "dvdrental",
                    status = "connected",
                    lastPing = "2 days ago",
                    connectionString = "Host=localhost;Port=5432;Database=dvdrental;Username=postgres;Password=Pune@123;"
                },
                new AIConnection
                {
                    id = 4,
                    Name = "ORACLE",
                    databaseType = "ORACLE",
                    host = "mongo-dev.aidb.internal",
                    port = 27017,
                    database = "aidb_dev",
                    status = "error",
                    lastPing = "5 mins ago",
                    connectionString = ""
                }
            };
        }
    }
}
