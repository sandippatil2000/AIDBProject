namespace AIDbAPI.Models
{
    public interface AIReport
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Prompt { get; set; }
        public string ResultSummary { get; set; }
        public string AISQLQuqey{ get; set; }
    }
}
