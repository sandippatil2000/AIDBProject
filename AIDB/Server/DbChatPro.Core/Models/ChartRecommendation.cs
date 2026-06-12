namespace DBChatPro.Models
{
    public class ChartRecommendation
    {
        public string ChartType { get; set; }
        public string LabelField { get; set; }
        public List<string> ValueFields { get; set; }
        public string Title { get; set; }
        public string Reasoning { get; set; }
    }
}
