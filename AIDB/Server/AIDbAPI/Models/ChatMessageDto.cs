namespace AIDbAPI.Models
{ // ---------------------------------------------------------------------------
    // Request DTOs
    // ---------------------------------------------------------------------------

    /// <summary>Simplified chat message transfer object.</summary>
    public class ChatMessageDto
    {
        /// <summary>"user" or "assistant".</summary>
        public string Role { get; set; } = "user";
        public string Content { get; set; } = string.Empty;
    }
}
