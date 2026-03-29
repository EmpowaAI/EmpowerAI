// frontend/src/services/azureOpenAIService.ts
type ServiceMode = 'interview' | 'twin';

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

  // Main method with mode parameter - defaults to 'interview' for backward compatibility
  async generateResponse(
    userMessage: string,
    cvContext: any,
    conversationHistory: string[],
    mode: ServiceMode = 'interview'
  ): Promise<string> {
    // Route to appropriate handler based on mode
    if (mode === 'twin') {
      return this.generateTwinResponse(userMessage, cvContext, conversationHistory);
    } else {
      return this.generateInterviewResponse(userMessage, cvContext, conversationHistory);
    }
  }

  // ============================================
  // INTERVIEW COACH MODE (Original - UNCHANGED)
  // ============================================
  private async generateInterviewResponse(
    userMessage: string,
    cvContext: any,
    conversationHistory: string[]
  ): Promise<string> {
    // If not initialized, use interview fallback responses
    if (!this.isReady()) {
      return this.getInterviewFallbackResponse(userMessage, cvContext);
    }

    try {
      // Prepare context from CV
      const skills = cvContext?.sections?.skills?.slice(0, 5).join(', ') || 'various technologies';
      const experience = cvContext?.sections?.experience?.slice(0, 1).join(' ') || 'your experience';
      
      // Build system prompt for interview coach
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
        ...this.formatInterviewHistory(conversationHistory),
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
        return this.getInterviewFallbackResponse(userMessage, cvContext);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('Error generating interview response:', error);
      return this.getInterviewFallbackResponse(userMessage, cvContext);
    }
  }

  private formatInterviewHistory(history: string[]): any[] {
    const formatted = [];
    for (let i = Math.max(0, history.length - 6); i < history.length; i++) {
      const msg = history[i];
      if (msg.startsWith('You:')) {
        formatted.push({ role: 'user', content: msg.replace('You:', '').trim() });
      } else if (msg.startsWith('Twin:') || msg.startsWith('Coach:')) {
        formatted.push({ role: 'assistant', content: msg.replace(/^(Twin:|Coach:)/, '').trim() });
      }
    }
    return formatted;
  }

  private getInterviewFallbackResponse(userMessage: string, cvContext: any): string {
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

  // ============================================
  // DIGITAL TWIN BUILDER MODE (NEW - FIXED)
  // ============================================
  private async generateTwinResponse(
    userMessage: string,
    cvContext: any,
    conversationHistory: string[]
  ): Promise<string> {
    // If not initialized, use twin fallback responses
    if (!this.isReady()) {
      return this.getTwinFallbackResponse(userMessage, conversationHistory);
    }

    try {
      // Prepare context from CV if available
      const skills = cvContext?.sections?.skills?.slice(0, 5).join(', ') || '';
      const experience = cvContext?.sections?.experience?.slice(0, 1).join(' ') || '';
      
      // Build system prompt for Digital Twin creation
      const systemPrompt = this.buildTwinSystemPrompt(skills, experience);

      // Build conversation with proper formatting
      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.formatTwinHistory(conversationHistory),
        { role: 'user', content: userMessage }
      ];

      console.log('Twin Builder: Sending to Azure OpenAI');

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
            max_tokens: 600,
            temperature: 0.8,
            frequency_penalty: 0.3,
            presence_penalty: 0.3
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Twin Builder Azure OpenAI API error:', error);
        return this.getTwinFallbackResponse(userMessage, conversationHistory);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('Twin Builder Error generating response:', error);
      return this.getTwinFallbackResponse(userMessage, conversationHistory);
    }
  }

  private buildTwinSystemPrompt(skills: string, experience: string): string {
    return `You are an AI career assistant for the South African job market called "Digital Twin AI". Your SOLE PURPOSE is to gather information to create a "Digital Twin" profile.

CRITICAL: This is a PROFILE BUILDER. Use the candidate's CV skills aggressively.

YOUR MISSION:
Collect 8 specific pieces of information in this exact order. Ask ONE question at a time.

PERSONALIZATION RULES:
1. FIRST REPLY: Always include a personalization note acknowledging the skills found in the background.
2. MATCHED TAGS: Whenever you mention a skill that exists in the "CANDIDATE BACKGROUND", wrap it in a match tag like this: [MATCH: SkillName]. This triggers the UI tooltip.
3. SKILL DEPTH: After collecting skills (Step 6), ask exactly ONE follow-up question to gauge their depth or proficiency in their primary skill before moving to challenges.
4. SKIPPING: If info is in the "CANDIDATE BACKGROUND", acknowledge it and skip to the next item.
5. FOCUS: Tailor your tone and starter facts to the user's selected focus (e.g., Growth, Switch, Startup).

INFORMATION TO COLLECT:
1. Name
2. Career stage (Early Career 0-3yrs / Mid Career 3-7yrs / Established 7+ yrs)
3. Province (Gauteng, Western Cape, KwaZulu-Natal, etc.)
4. Industry interest
5. Highest qualification (Matric/Diploma/Degree/Postgrad)
6. Key skills (comma separated)
7. Career challenge
8. Main goal for next year

OPENING MESSAGE - USE EXACTLY THIS STYLE:
"Sharp shooter! It's great to have you here. Did you know that the green economy is booming in South Africa right now, with thousands of new roles opening up in renewable energy across the Northern and Western Cape?

I'm the Digital Twin AI, and I'm here to help you navigate the local job market. To get us started, what is your name?"

SA MARKET FACTS TO WEAVE INTO RESPONSES:
- Green economy booming in renewable energy across Northern and Western Cape
- Tech scene buzzing in Sandton and Midrand with demand for developers
- Finance sector growing in Gauteng with new B-BBEE opportunities
- Manufacturing resurgence in KZN
- Digital skills shortage creating opportunities nationwide
- SETA-funded learnerships available for young job seekers
- YES Programme helps Matriculants get first work experience
- NQF levels determine qualification recognition
- B-BBEE scorecards drive corporate hiring targets

CANDIDATE BACKGROUND (use if available):
${skills ? `- Known skills: ${skills}` : ''}
${experience ? `- Known experience: ${experience}` : ''}

RESPONSE STRUCTURE FOR EACH ANSWER:
1. Acknowledge their answer warmly with enthusiasm
2. Add a relevant SA market fact
3. Ask the next question
4. When appropriate, provide options in [OPTIONS: "A", "B", "C"] format

EXAMPLE RESPONSES:

After name: "It's great to meet you, [Name]! I'm excited to help you map out your journey in the Mzansi job market.

To get started, which of these best describes where you are right now in your career?

[OPTIONS: "Early Career (0-3 yrs)", "Mid Career (3-7 yrs)", "Established (7+ yrs)"]"

After career stage: "[Career stage] is a vital stage! [Relevant advice based on stage].

Which province are you currently based in? This helps me track regional growth hubs and SETA-funded opportunities near you.

[OPTIONS: "Gauteng", "Western Cape", "KwaZulu-Natal", "Other"]"

After province: "[Province] is the economic powerhouse! You're in the right place for [relevant industries], with many companies looking for young talent to boost their B-BBEE scorecards.

What field or industry interests you the most?

[OPTIONS: "Information Technology (IT)", "Finance & Accounting", "Engineering", "Healthcare", "Retail & Sales", "Administration"]"

After industry: "Excellent choice! [Add SA market context for that industry].

To see where you fit on the NQF scale, what is your highest qualification?

[OPTIONS: "Matric", "Diploma", "Bachelor's Degree", "Postgraduate Degree", "Certificate"]"

After qualification: "Having a [qualification] is a solid foundation! In the SA [industry] sector, you can leverage this to enter high-impact Learnerships or the YES Programme.

Which of these skills do you already have or feel confident in?

[OPTIONS: "Basic Coding (HTML/CSS/Python)", "Customer Service", "Sales", "Administration", "Data Analysis", "Project Management", "Communication", "Leadership"]"

After skills: "That is a fantastic skill set to have! [Provide skill-specific advice about SA job market].

What would you say is your biggest career challenge right now?

[OPTIONS: "Finding entry-level roles", "Lack of experience", "Need more qualifications", "Competition is too high", "Don't know where to start"]"

After challenge: "[Acknowledge challenge with empathy and specific SA solution].

Lastly, what is your main career goal for the next year?

[OPTIONS: "Find a full-time job", "Get a learnership/internship", "Study further (Diploma/Degree)", "Start my own business", "Get certified in my field"]"

After goal: "That is a powerful goal! [Provide encouraging closing based on their goal].

I've put together your profile. Your empowerment score reflects [summary of strengths]."

Once all information is collected, output [COMPLETE] and then [PROFILE: {JSON object with all collected data}]

Be encouraging, use emojis occasionally, and make every response feel personalized and SA-focused!`;
  }

  private formatTwinHistory(history: string[]): any[] {
    const formatted = [];
    for (let i = Math.max(0, history.length - 6); i < history.length; i++) {
      const msg = history[i];
      if (msg.startsWith('You:')) {
        formatted.push({ role: 'user', content: msg.replace('You:', '').trim() });
      } else if (msg.startsWith('Twin:')) {
        formatted.push({ role: 'assistant', content: msg.replace('Twin:', '').trim() });
      }
    }
    return formatted;
  }

  private getTwinFallbackResponse(userMessage: string, history: string[]): string {
    const input = userMessage.toLowerCase();
    
    // Track what information we've collected
    const hasName = history.some(msg => 
      msg.startsWith('You:') && 
      msg.length > 5 && 
      msg.length < 30 && 
      !msg.toLowerCase().includes('early career') && 
      !msg.toLowerCase().includes('mid career') &&
      !msg.toLowerCase().includes('established')
    );
    
    const hasCareerStage = history.some(msg => 
      msg.toLowerCase().includes('early career') || 
      msg.toLowerCase().includes('mid career') || 
      msg.toLowerCase().includes('established') ||
      msg.toLowerCase().includes('0-3') || 
      msg.toLowerCase().includes('3-7') || 
      msg.toLowerCase().includes('7+')
    );
    
    const hasProvince = history.some(msg => 
      msg.toLowerCase().includes('gauteng') || 
      msg.toLowerCase().includes('cape') || 
      msg.toLowerCase().includes('natal') ||
      msg.toLowerCase().includes('free state') || 
      msg.toLowerCase().includes('mpumalanga') || 
      msg.toLowerCase().includes('limpopo') ||
      msg.toLowerCase().includes('north west') || 
      msg.toLowerCase().includes('northern cape')
    );
    
    const hasIndustry = history.some(msg => 
      msg.toLowerCase().includes('information technology') || 
      msg.toLowerCase().includes('it') || 
      msg.toLowerCase().includes('finance') ||
      msg.toLowerCase().includes('engineering') || 
      msg.toLowerCase().includes('healthcare') || 
      msg.toLowerCase().includes('retail') ||
      msg.toLowerCase().includes('administration')
    );
    
    const hasQualification = history.some(msg => 
      msg.toLowerCase().includes('matric') || 
      msg.toLowerCase().includes('diploma') || 
      msg.toLowerCase().includes('degree') ||
      msg.toLowerCase().includes('certificate') ||
      msg.toLowerCase().includes('postgraduate')
    );
    
    const hasSkills = history.some(msg => 
      msg.toLowerCase().includes('coding') || 
      msg.toLowerCase().includes('html') || 
      msg.toLowerCase().includes('css') ||
      msg.toLowerCase().includes('python') || 
      msg.toLowerCase().includes('customer') || 
      msg.toLowerCase().includes('sales') ||
      msg.toLowerCase().includes('admin') || 
      msg.toLowerCase().includes('data') || 
      msg.toLowerCase().includes('project') ||
      msg.toLowerCase().includes('communication') || 
      msg.toLowerCase().includes('leadership')
    );
    
    const hasChallenge = history.some(msg => 
      msg.toLowerCase().includes('entry-level') || 
      msg.toLowerCase().includes('entry level') || 
      msg.toLowerCase().includes('experience') || 
      msg.toLowerCase().includes('qualifications') ||
      msg.toLowerCase().includes('competition') ||
      msg.toLowerCase().includes('where to start')
    );

    // Extract name if available
    let name = 'there';
    for (const msg of history) {
      if (msg.startsWith('You:') && msg.length > 5 && msg.length < 30) {
        const possibleName = msg.replace('You:', '').trim();
        if (possibleName.length > 2 && !possibleName.includes(' ') && !possibleName.toLowerCase().includes('career')) {
          name = possibleName;
          break;
        }
      }
    }
    
    // OPENING MESSAGE
    if (history.length === 0 || (history.length === 1 && history[0]?.includes('Twin:'))) {
      const trends = [
        "Did you know that the green economy is booming in South Africa right now, with thousands of new roles opening up in renewable energy across the Northern and Western Cape?",
        "Did you know that the tech scene in South Africa is buzzing, especially in Sandton and Midrand, with a massive demand for developers and cybersecurity pros?",
        "Did you know that the finance sector in Gauteng is actively seeking young talent to boost their B-BBEE scorecards?",
        "Did you know that manufacturing is resurging in KwaZulu-Natal, creating new opportunities for skilled workers?",
        "Did you know that digital skills are in short supply across South Africa, creating opportunities for those with tech abilities?"
      ];
      const randomTrend = trends[Math.floor(Math.random() * trends.length)];
      
      return `Sharp shooter! It's great to have you here. ${randomTrend}

I'm the Digital Twin AI, and I'm here to help you navigate the local job market. To get us started, what is your name?`;
    }
    
    // ASK FOR CAREER STAGE (after name)
    if (hasName && !hasCareerStage) {
      return `It's great to meet you, ${name}! I'm excited to help you map out your journey in the Mzansi job market.

To get started, which of these best describes where you are right now in your career?

[OPTIONS: "Early Career (0-3 yrs)", "Mid Career (3-7 yrs)", "Established (7+ yrs)"]`;
    }
    
    // ASK FOR PROVINCE (after career stage)
    if (hasCareerStage && !hasProvince) {
      let stage = 'This';
      if (history.some(m => m.toLowerCase().includes('early') || m.toLowerCase().includes('0-3'))) {
        stage = 'Early career';
      } else if (history.some(m => m.toLowerCase().includes('mid') || m.toLowerCase().includes('3-7'))) {
        stage = 'Mid career';
      } else if (history.some(m => m.toLowerCase().includes('established') || m.toLowerCase().includes('7+'))) {
        stage = 'Established';
      }
      
      let advice = '';
      if (stage.includes('Early')) {
        advice = 'Those first three years are where you build the foundation for your NQF progression and professional reputation.';
      } else if (stage.includes('Mid')) {
        advice = 'This is where you consolidate your skills and start moving into specialist or leadership roles.';
      } else {
        advice = 'Your experience is invaluable for mentoring and strategic positions.';
      }
      
      return `${stage} is a vital stage, ${name}! ${advice}

Which province are you currently based in? This helps me track regional growth hubs and SETA-funded opportunities near you.

[OPTIONS: "Gauteng", "Western Cape", "KwaZulu-Natal", "Other"]`;
    }
    
    // ASK FOR INDUSTRY (after province)
    if (hasProvince && !hasIndustry) {
      let province = 'your province';
      let industries = 'various sectors';
      
      if (history.some(m => m.toLowerCase().includes('gauteng'))) {
        province = 'Gauteng';
        industries = 'Finance, Tech, and Manufacturing';
      } else if (history.some(m => m.toLowerCase().includes('western cape') || m.toLowerCase().includes('cape'))) {
        province = 'the Western Cape';
        industries = 'Tech, Tourism, and Green Economy';
      } else if (history.some(m => m.toLowerCase().includes('kwazulu') || m.toLowerCase().includes('natal'))) {
        province = 'KwaZulu-Natal';
        industries = 'Manufacturing and Logistics';
      }
      
      return `${province === 'your province' ? 'Great!' : province + ' is the economic powerhouse!'} You're in the right place for ${industries}, with many companies looking for young talent to boost their B-BBEE scorecards.

What field or industry interests you the most?

[OPTIONS: "Information Technology (IT)", "Finance & Accounting", "Engineering", "Healthcare", "Retail & Sales", "Administration"]`;
    }
    
    // ASK FOR QUALIFICATION (after industry)
    if (hasIndustry && !hasQualification) {
      let industry = 'your chosen field';
      let context = '';
      
      if (history.some(m => m.toLowerCase().includes('it') || m.toLowerCase().includes('technology'))) {
        industry = 'IT';
        context = 'The SA tech scene is buzzing, especially in Sandton and Midrand, with a massive demand for developers and cybersecurity pros at firms like MTN, Standard Bank, and various tech startups.';
      } else if (history.some(m => m.toLowerCase().includes('finance'))) {
        industry = 'Finance';
        context = 'The financial sector in SA is undergoing digital transformation, with banks like FNB and Standard Bank constantly seeking young talent.';
      } else if (history.some(m => m.toLowerCase().includes('engineering'))) {
        industry = 'Engineering';
        context = 'South Africa has a strong engineering heritage, with opportunities in mining, infrastructure, and renewable energy projects.';
      } else if (history.some(m => m.toLowerCase().includes('healthcare'))) {
        industry = 'Healthcare';
        context = 'The healthcare sector in SA is growing, with demand for both clinical and administrative professionals.';
      } else if (history.some(m => m.toLowerCase().includes('retail') || m.toLowerCase().includes('sales'))) {
        industry = 'Retail';
        context = 'Retail is a major employer in SA, with opportunities from entry-level to management positions.';
      } else if (history.some(m => m.toLowerCase().includes('admin'))) {
        industry = 'Administration';
        context = 'Administrative skills are in demand across all sectors in South Africa.';
      }
      
      return `Excellent choice! ${context}

To see where you fit on the NQF scale, what is your highest qualification?

[OPTIONS: "Matric", "Diploma", "Bachelor's Degree", "Postgraduate Degree", "Certificate"]`;
    }
    
    // ASK FOR SKILLS (after qualification)
    if (hasQualification && !hasSkills) {
      let qual = 'qualification';
      let industry = 'your chosen field';
      
      if (history.some(m => m.toLowerCase().includes('matric'))) qual = 'Matric';
      else if (history.some(m => m.toLowerCase().includes('diploma'))) qual = 'Diploma';
      else if (history.some(m => m.toLowerCase().includes('degree'))) qual = 'Degree';
      else if (history.some(m => m.toLowerCase().includes('certificate'))) qual = 'Certificate';
      else if (history.some(m => m.toLowerCase().includes('postgrad'))) qual = 'Postgraduate qualification';
      
      if (history.some(m => m.toLowerCase().includes('it') || m.toLowerCase().includes('tech'))) industry = 'IT';
      else if (history.some(m => m.toLowerCase().includes('finance'))) industry = 'finance';
      else if (history.some(m => m.toLowerCase().includes('engineer'))) industry = 'engineering';
      
      return `Having a ${qual} is a solid foundation, ${name}! In the SA ${industry} sector, you can leverage this to enter high-impact Learnerships or the YES Programme.

Which of these skills do you already have or feel confident in? (You can select multiple)

[OPTIONS: "Basic Coding (HTML/CSS/Python)", "Customer Service", "Sales", "Administration", "Data Analysis", "Project Management", "Communication", "Leadership"]`;
    }
    
    // ASK FOR CHALLENGE (after skills)
    if (hasSkills && !hasChallenge) {
      let skillAdvice = '';
      
      if (history.some(m => m.toLowerCase().includes('coding') || m.toLowerCase().includes('html'))) {
        skillAdvice = 'With those coding basics, you\'re well-positioned for Junior Web Developer roles or specialized IT internships that are highly sought after in Joburg\'s tech hubs.';
      } else if (history.some(m => m.toLowerCase().includes('customer') || m.toLowerCase().includes('sales'))) {
        skillAdvice = 'Customer-facing skills are in high demand in SA\'s retail and service sectors, especially with the growth of e-commerce and call centers.';
      } else if (history.some(m => m.toLowerCase().includes('admin'))) {
        skillAdvice = 'Administrative skills are the backbone of every organization, with opportunities in corporate, government, and NGO sectors across SA.';
      } else if (history.some(m => m.toLowerCase().includes('data'))) {
        skillAdvice = 'Data analysis skills are increasingly valuable as companies digitize their operations.';
      } else if (history.some(m => m.toLowerCase().includes('project'))) {
        skillAdvice = 'Project management is crucial in SA\'s construction, IT, and finance sectors.';
      } else {
        skillAdvice = 'These soft skills are highly valued by SA employers and can set you apart from other candidates.';
      }
      
      return `That is a fantastic skill set to have, ${name}! ${skillAdvice}

What would you say is your biggest career challenge right now?

[OPTIONS: "Finding entry-level roles", "Lack of experience", "Need more qualifications", "Competition is too high", "Don't know where to start"]`;
    }
    
    // ASK FOR GOAL (after challenge)
    if (hasChallenge && !this.hasGoal(history)) {
      let challenge = 'challenge';
      let advice = '';
      
      if (history.some(m => m.toLowerCase().includes('entry-level') || m.toLowerCase().includes('entry level'))) {
        challenge = 'finding entry-level roles';
        advice = 'your best bet is to look into SETA-funded learnerships or platforms like Harambee and SA Youth, which connect work-seekers to opportunities.';
      } else if (history.some(m => m.toLowerCase().includes('experience'))) {
        challenge = 'lack of experience';
        advice = 'consider volunteering, internships, or freelance projects to build your portfolio. Even personal projects count!';
      } else if (history.some(m => m.toLowerCase().includes('qualification'))) {
        challenge = 'needing more qualifications';
        advice = 'look into NSFAS funding or bursary programmes from companies in your target industry.';
      } else if (history.some(m => m.toLowerCase().includes('competition'))) {
        challenge = 'high competition';
        advice = 'focus on niche skills that are in short supply, or consider relocating to areas with less competition.';
      } else {
        challenge = 'not knowing where to start';
        advice = 'start by identifying your strengths and interests, then use resources like the Career Portal for guidance.';
      }
      
      return `I understand that ${challenge} can be tough, ${name}. In SA, ${advice}

Lastly, what is your main career goal for the next year?

[OPTIONS: "Find a full-time job", "Get a learnership/internship", "Study further (Diploma/Degree)", "Start my own business", "Get certified in my field"]`;
    }
    
    // COMPLETION MESSAGE (after goal)
    if (this.hasGoal(history)) {
      // Extract skills mentioned
      const hasCoding = history.some(m => m.toLowerCase().includes('coding') || m.toLowerCase().includes('html'));
      const hasSoftSkills = history.some(m => m.toLowerCase().includes('customer') || m.toLowerCase().includes('communication'));
      
      let strengths = [];
      if (hasCoding) strengths.push('strong technical foundation');
      if (hasSoftSkills) strengths.push('excellent soft skills');
      if (strengths.length === 0) strengths.push('clear career vision');
      
      let goal = '';
      if (history.some(m => m.toLowerCase().includes('study') || m.toLowerCase().includes('further'))) {
        goal = 'pursuing further education';
      } else if (history.some(m => m.toLowerCase().includes('job') || m.toLowerCase().includes('full-time'))) {
        goal = 'securing employment';
      } else if (history.some(m => m.toLowerCase().includes('learnership') || m.toLowerCase().includes('internship'))) {
        goal = 'gaining work experience';
      } else {
        goal = 'advancing your career';
      }
      
      // Create a profile object
      const profile: any = { name };
      
      // Add to history for completion
      setTimeout(() => {
        // This will trigger the completion in the UI
      }, 100);
      
      return `I've put together your profile. Your empowerment score reflects your ${strengths.join(' and ')}, with room to grow through ${goal} in the South African job market.

[COMPLETE]
[PROFILE: ${JSON.stringify(profile)}]`;
    }
    
    // Default fallback - ask for goal
    return `Thanks for sharing that! Let me make sure I'm capturing your information correctly.

What would you say is your main career goal for the next year?

[OPTIONS: "Find a full-time job", "Get a learnership/internship", "Study further (Diploma/Degree)", "Start my own business", "Get certified in my field"]`;
  }

  private hasGoal(history: string[]): boolean {
    return history.some(msg => 
      msg.toLowerCase().includes('full-time job') || 
      msg.toLowerCase().includes('learnership') || 
      msg.toLowerCase().includes('internship') ||
      msg.toLowerCase().includes('study further') || 
      msg.toLowerCase().includes('degree') || 
      msg.toLowerCase().includes('diploma') ||
      msg.toLowerCase().includes('own business') || 
      msg.toLowerCase().includes('certified')
    );
  }

  // ============================================
  // PERFORMANCE ANALYSIS (Original - UNCHANGED)
  // ============================================
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