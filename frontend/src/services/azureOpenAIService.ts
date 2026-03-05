// frontend/src/services/azureOpenAIService.ts
class AzureOpenAIService {
  private endpoint: string;
  private apiKey: string;
  private deployment: string;
  private isInitialized = false;

  constructor() {
    this.endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    this.apiKey = import.meta.env.VITE_AZURE_OPENAI_KEY;
    this.deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
    
    this.isInitialized = !!(this.endpoint && this.apiKey && this.deployment);
    
    if (!this.isInitialized) {
      console.warn('Azure OpenAI credentials not found. Using fallback responses.');
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  async generateResponse(
    userMessage: string,
    cvContext: any,
    conversationHistory: string[]
  ): Promise<string> {
    // If not initialized, use fallback responses
    if (!this.isReady()) {
      return this.getFallbackResponse(userMessage, cvContext);
    }

    try {
      // Prepare context from CV
      const skills = cvContext?.sections?.skills?.slice(0, 5).join(', ') || 'various technologies';
      const experience = cvContext?.sections?.experience?.slice(0, 1).join(' ') || 'your experience';
      
      // Build system prompt
      const systemPrompt = `You are an expert interview coach conducting a mock interview.
      
CANDIDATE'S BACKGROUND:
- Skills: ${skills}
- Key Experience: ${experience}
- Readiness Level: ${cvContext?.readinessLevel || 'Not assessed'}

YOUR ROLE:
1. Ask challenging interview questions based on their actual skills
2. Listen to their answers and provide constructive feedback
3. Keep the conversation natural and professional
4. Focus on helping them improve their interview skills

Guidelines:
- Start with a warm greeting
- Ask one question at a time
- After they answer, ask a follow-up question
- Be encouraging but honest
- Use STAR method in your questions`;

      // Build conversation
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6).map(msg => {
          const role = msg.startsWith('You:') ? 'user' : 'assistant';
          const content = msg.replace(/^(You:|Twin:)/, '').trim();
          return { role, content };
        }),
        { role: 'user', content: userMessage }
      ];

      // Call Azure OpenAI
      const response = await fetch(
        `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-02-15-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey
          },
          body: JSON.stringify({
            messages,
            max_tokens: 300,
            temperature: 0.7,
            frequency_penalty: 0.5,
            presence_penalty: 0.5
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Azure OpenAI API error:', error);
        return this.getFallbackResponse(userMessage, cvContext);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('Error generating response:', error);
      return this.getFallbackResponse(userMessage, cvContext);
    }
  }

  private getFallbackResponse(userMessage: string, cvContext: any): string {
    const skills = cvContext?.sections?.skills || [];
    const input = userMessage.toLowerCase();

    if (input.includes('hello') || input.includes('hi') || input === '') {
      return `Hello! I'm your interview coach. I see you have experience with ${skills.slice(0, 3).join(', ') || 'various technologies'}. Tell me about your most recent project.`;
    }
    
    if (input.includes('project') || input.includes('built') || input.includes('developed')) {
      return `That's interesting! What specific challenges did you face in that project, and how did you overcome them?`;
    }
    
    if (input.includes('challenge') || input.includes('problem')) {
      return "How did you approach solving that problem? Walk me through your thought process.";
    }
    
    if (input.includes('team') || input.includes('work with')) {
      return "Tell me about a time you had to collaborate with a difficult team member. How did you handle it?";
    }
    
    return "That's helpful. Can you give me a more specific example from your experience?";
  }

  async analyzePerformance(conversation: string[]): Promise<any> {
    if (!this.isReady()) {
      return this.getFallbackAnalysis();
    }

    try {
      const transcript = conversation.join('\n');
      
      const response = await fetch(
        `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-02-15-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: `You are an interview performance analyzer. Analyze this interview transcript and provide scores (0-100) for:
                - confidence (based on clarity, hesitation)
                - language (grammar, vocabulary, sentence structure)
                - tone (professionalism, enthusiasm)
                
                Also provide overall feedback and 3 key improvements.
                
                Return JSON only with format:
                {
                  "confidence": number,
                  "language": number,
                  "tone": number,
                  "overallFeedback": "string",
                  "keyImprovements": ["string1", "string2", "string3"]
                }`
              },
              { role: 'user', content: transcript }
            ],
            max_tokens: 500,
            temperature: 0.3,
            response_format: { type: 'json_object' }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);

    } catch (error) {
      console.error('Error analyzing performance:', error);
      return this.getFallbackAnalysis();
    }
  }

  private getFallbackAnalysis() {
    return {
      confidence: 65,
      language: 65,
      tone: 65,
      overallFeedback: "Great effort! Keep practicing to improve your interview skills.",
      keyImprovements: [
        "Use more specific examples from your experience",
        "Structure answers with the STAR method",
        "Practice speaking clearly and confidently"
      ]
    };
  }
}

export const azureOpenAIService = new AzureOpenAIService();