namespace AIDbAPI.Models
{
    public class QueryReport
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Prompt { get; set; } = string.Empty;
        public string ResultSummary { get; set; } = string.Empty;
        public string AISQLQuqey { get; set; } = string.Empty;
    }
}
