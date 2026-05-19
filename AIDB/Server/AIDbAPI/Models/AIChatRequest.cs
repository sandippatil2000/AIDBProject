using AIDbAPI.Controllers;

namespace AIDbAPI.Models
{
    /// <summary>Request body for POST /api/AI/chat.</summary>
    public class AIChatRequest
    {
        public List<ChatMessageDto> Messages { get; set; } = new();

        /// <summary>AI model identifier.</summary>
        public string AiModel { get; set; } = string.Empty;

        /// <summary>AI service provider key.</summary>
        public string AiService { get; set; } = string.Empty;
    }
}
