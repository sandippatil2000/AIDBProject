using AIDb.Core.Models;

namespace AIDbAPI.Models
{
    public class AIRecommendChartsRequest
    {
        public string AiModel { get; set; } = string.Empty;
        public string AiService { get; set; } = string.Empty;

        public List<ColumnSchema> Schema { get; set; } = [];

        public string Title { get; set; } = string.Empty;
    }
}
