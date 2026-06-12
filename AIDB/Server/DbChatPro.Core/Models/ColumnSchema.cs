namespace DBChatPro.Models
{
    public class ColumnSchema
    {
        public string Key { get; set; }
        public string Type { get; set; } // "string", "number", "date", "boolean"
        public bool IsString { get; set; }
        public bool IsNumeric { get; set; }
        public bool IsDate { get; set; }
        public bool IsCategorical { get; set; }
    }
}
