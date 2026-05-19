namespace AIDbAPI.Models
{
    /// <summary>Request body for POST /api/AI/query.</summary>
    public class AIQueryRequest
    {
        /// <summary>Name of the saved database connection to use.</summary>
        public string ConnectionName { get; set; } = string.Empty;

        /// <summary>Natural-language question the user wants answered with SQL.</summary>
        public string UserPrompt { get; set; } = string.Empty;

        /// <summary>AI model identifier (e.g. "gpt-4o", "claude-3-5-sonnet").</summary>
        public string AiModel { get; set; } = string.Empty;

        /// <summary>AI service provider key (e.g. "AzureOpenAI", "OpenAI", "Ollama", "GitHubModels", "AWSBedrock").</summary>
        public string AiService { get; set; } = string.Empty;
    }
}
