using AIDb.Core.Models;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIDb.Core.Services
{
    public interface IAIService
    {
        public  Task<AIQuery> GetAISQLQuery(string aiModel, string aiService, string userPrompt, DatabaseSchema dbSchema, string databaseType);
        public Task<ChatResponse> ChatPrompt(List<ChatMessage> prompt, string aiModel, string aiService);
        public  Task<List<ChartRecommendation>> RecommendChartsAI(string aiModel, string aiService, List<ColumnSchema> schema, string title);
    }
}
