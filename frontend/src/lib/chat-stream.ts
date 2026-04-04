import { API_BASE_URL } from './apiBase';

const getToken = () => localStorage.getItem('empowerai-token');
const USE_DEMO_MODE = import.meta.env.VITE_USE_DEMO_MODE === 'true';

export type ChatMsg = { role: "user" | "assistant"; content: string };

export type TwinChatMeta = {
  reply?: string;
  options?: string[];
  isComplete?: boolean;
  profile?: Record<string, unknown> | null;
};

export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: ChatMsg[];
  onDelta: (text: string) => void;
  onDone: (meta?: TwinChatMeta) => void;
  onError: (error: string) => void;
}) {
  try {
    console.log('Sending twin chat:', API_BASE_URL);

    const token = getToken();
    if (!token) {
      onError("Please log in to use Digital Twin chat.");
      onDone({ reply: "", options: [], isComplete: false, profile: null });
      return;
    }

    // Extract CV context to ensure the AI knows who it's talking to
    let cvContext = null;
    try {
      const stored = localStorage.getItem('comprehensiveCVAnalysis') || localStorage.getItem('cvAnalysisData');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure cv_context is a plain object, as Pydantic Dict expects this
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) cvContext = parsed;
      }
    } catch (e) {
      console.warn('Failed to parse CV context');
    }

    // Sanitize focus value to match backend expectations
    let focusValue = localStorage.getItem('careerFocus') || 'growth';
    const validFocus = ['growth', 'switch', 'startup', 'corporate'];
    const focus = validFocus.includes(focusValue) ? focusValue : 'growth';
    
    const response = await fetch(`${API_BASE_URL}/chat/twin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        messages: messages
          .map(m => {
            const role = m.role || (m as any).sender || 'user';
            const content = m.content || (m as any).text || '';
            return { role, content };
          })
          .filter(m => m.content.trim() !== ''),
        cvData: cvContext || {}, // Standardize on cvData to satisfy Node proxy validation
        focus: focus
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        onError("Rate limited — please wait a moment and try again.");
        onDone({ reply: "", options: [], isComplete: false, profile: null });
        return;
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error('AI service error:', response.status, errorData);
      
      const serverMessage =
        errorData?.message ||
        errorData?.detail ||
        errorData?.data?.message ||
        `Request failed (status ${response.status})`;

      if (response.status === 401) {
        onError("Your session expired. Please log in again.");
        onDone({ reply: "", options: [], isComplete: false, profile: null });
        return;
      }

      if (USE_DEMO_MODE) {
        console.log('Falling back to demo mode');
        simulateChat(messages, onDelta, () => onDone(), onError);
        return;
      }

      onError(serverMessage);
      onDone({ reply: "", options: [], isComplete: false, profile: null });
      return;
    }

    // Check if response is JSON or stream
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Handle JSON response
      const data = await response.json();
      const payload = data?.data || data;
      if (payload.reply) {
        // Send the entire reply at once
        onDelta(payload.reply);
        onDone({
          reply: payload.reply,
          options: Array.isArray(payload.options) ? payload.options : [],
          isComplete: !!payload.isComplete,
          profile: payload.profile || null,
        });
      } else {
        onError("Invalid response format from AI service");
        onDone({ reply: "", options: [], isComplete: false, profile: null });
      }
    } else if (response.body) {
      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        textBuffer += chunk;

        // Process SSE format if present
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.trim() === "") continue;
          
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }
            
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content || parsed.content || parsed.reply;
              if (content) onDelta(content);
            } catch (e) {
              // If not JSON, treat as plain text
              onDelta(line);
            }
          } else {
            // Plain text chunk
            onDelta(line);
          }
        }
      }
      
      // Send any remaining text
      if (textBuffer.trim()) {
        onDelta(textBuffer);
      }
      
      onDone();
    } else {
      onError("No response body from AI service");
      onDone({ reply: "", options: [], isComplete: false, profile: null });
    }
  } catch (e) {
    console.error("Stream error:", e);
    
    if (USE_DEMO_MODE) {
      console.log('Falling back to demo mode due to connection error');
      simulateChat(messages, onDelta, () => onDone(), onError);
      return;
    }

    onError("Network error connecting to the AI service. Please try again.");
    onDone({ reply: "", options: [], isComplete: false, profile: null });
  }
}

// Demo mode simulation for development
function simulateChat(
  messages: ChatMsg[],
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
) {
  try {
    // Count user messages to determine conversation stage
    const userMessages = messages.filter(m => m.role === 'user').length;
    
    let response = '';
    
    if (userMessages === 0) {
      response = "Sharp shooter! It's great to have you here. Did you know that the green economy is booming in South Africa right now, with thousands of new roles opening up in renewable energy across the Northern and Western Cape?\n\nI'm the Digital Twin AI, and I'm here to help you navigate the local job market. To get us started, what is your name?";
    } else if (userMessages === 1) {
      // After name is given
      const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
      const name = lastUserMsg.split(' ')[0] || 'there';
      
      response = `It's great to meet you, ${name}! I'm excited to help you map out your journey in the Mzansi job market.\n\nTo get started, which of these best describes where you are right now in your career?\n\n[OPTIONS: "Early Career (0-3 yrs)", "Mid Career (3-7 yrs)", "Established (7+ yrs)"]`;
    } else if (userMessages === 2) {
      response = "Great! Which province are you currently based in? This helps me track regional growth hubs and SETA-funded opportunities near you.\n\n[OPTIONS: \"Gauteng\", \"Western Cape\", \"KwaZulu-Natal\", \"Other\"]";
    } else if (userMessages === 3) {
      response = "Excellent choice! The tech scene is buzzing in Sandton and Midrand with demand for developers.\n\nWhat field or industry interests you the most?\n\n[OPTIONS: \"Information Technology (IT)\", \"Finance & Accounting\", \"Engineering\", \"Healthcare\", \"Retail & Sales\", \"Administration\"]";
    } else if (userMessages === 4) {
      response = "To see where you fit on the NQF scale, what is your highest qualification?\n\n[OPTIONS: \"Matric\", \"Diploma\", \"Bachelor's Degree\", \"Postgraduate Degree\", \"Certificate\"]";
    } else if (userMessages === 5) {
      response = "Which of these skills do you already have or feel confident in?\n\n[OPTIONS: \"Basic Coding (HTML/CSS/Python)\", \"Customer Service\", \"Sales\", \"Administration\", \"Data Analysis\", \"Project Management\", \"Communication\", \"Leadership\"]";
    } else if (userMessages === 6) {
      response = "What would you say is your biggest career challenge right now?\n\n[OPTIONS: \"Finding entry-level roles\", \"Lack of experience\", \"Need more qualifications\", \"Competition is too high\", \"Don't know where to start\"]";
    } else if (userMessages === 7) {
      response = "Lastly, what is your main career goal for the next year?\n\n[OPTIONS: \"Find a full-time job\", \"Get a learnership/internship\", \"Study further\", \"Start my own business\", \"Get certified in my field\"]";
    } else {
      // Extract data from conversation to build profile
      const allMsgs = messages.map(m => m.content);
      const name = allMsgs[1] || 'User';
      const careerStage = allMsgs[2]?.includes('Early') ? 'Early Career' : allMsgs[2]?.includes('Mid') ? 'Mid Career' : 'Established';
      const province = allMsgs[3]?.includes('Gauteng') ? 'Gauteng' : allMsgs[3]?.includes('Cape') ? 'Western Cape' : allMsgs[3]?.includes('Natal') ? 'KwaZulu-Natal' : 'Other';
      const industry = allMsgs[4]?.includes('IT') ? 'IT' : allMsgs[4]?.includes('Finance') ? 'Finance' : allMsgs[4]?.includes('Engineering') ? 'Engineering' : 'Other';
      const education = allMsgs[5]?.includes('Degree') ? 'Degree' : allMsgs[5]?.includes('Diploma') ? 'Diploma' : 'Matric';
      const skills = ['Communication', 'Problem Solving']; // Default skills
      const challenges = allMsgs[7] || 'Finding opportunities';
      const goals = allMsgs[8] || 'Career growth';
      
      // Calculate empowerment score
      let score = 50; // Base score
      if (education === 'Degree') score += 20;
      else if (education === 'Diploma') score += 15;
      else score += 10;
      
      if (careerStage === 'Established') score += 15;
      else if (careerStage === 'Mid Career') score += 10;
      
      score = Math.min(score, 100);
      
      response = `I've put together your profile. Your empowerment score reflects your potential in the South African job market.\n\n[COMPLETE]\n[PROFILE: ${JSON.stringify({
        name,
        careerStage,
        province,
        industry,
        education,
        skills,
        challenges,
        goals,
        empowermentScore: score
      })}]`;
    }
    
    // Simulate streaming with slight delay between characters
    let i = 0;
    const interval = setInterval(() => {
      if (i < response.length) {
        const chunk = response.charAt(i);
        onDelta(chunk);
        i++;
      } else {
        clearInterval(interval);
        onDone();
      }
    }, 20); // 20ms delay between characters for natural typing effect
    
  } catch (e) {
    console.error('Demo mode error:', e);
    onError("Demo mode error: " + (e instanceof Error ? e.message : String(e)));
  }
}

// Parse AI response for options and profile completion
export function parseAIResponse(text: string): {
  cleanText: string;
  options: string[];
  isComplete: boolean;
  profile: Record<string, unknown> | null;
} {
  let cleanText = text;
  let options: string[] = [];
  let isComplete = false;
  let profile: Record<string, unknown> | null = null;

  // Extract options: [OPTIONS: "A", "B", "C"]
  const optionsMatch = cleanText.match(/\[OPTIONS:\s*(.+?)\]/);
  if (optionsMatch) {
    try {
      const raw = optionsMatch[1];
      // Match quoted strings
      const matches = raw.match(/"([^"]+)"/g);
      if (matches) {
        options = matches.map(s => s.replace(/"/g, ''));
      } else {
        // Try comma-separated without quotes
        options = raw.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      }
    } catch (e) {
      console.warn('Failed to parse options:', e);
    }
    cleanText = cleanText.replace(/\[OPTIONS:\s*.+?\]/, '').trim();
  }

  // Check for completion
  if (cleanText.includes("[COMPLETE]")) {
    isComplete = true;
    cleanText = cleanText.replace("[COMPLETE]", "").trim();
  }

  // Extract profile - handle both with and without quotes around field names
  const profileMatch = cleanText.match(/\[PROFILE:\s*(\{.+?\})\]/s);
  if (profileMatch) {
    try {
      // Try to parse as JSON
      let profileStr = profileMatch[1];
      // Replace single quotes with double quotes if needed
      profileStr = profileStr.replace(/'/g, '"');
      // Ensure property names are quoted
      profileStr = profileStr.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
      
      profile = JSON.parse(profileStr);
    } catch (e) {
      console.warn('Failed to parse profile JSON:', e);
      
      // Fallback: try to extract fields manually
      try {
        const profileText = profileMatch[1];
        const extracted: Record<string, unknown> = {};
        
        const nameMatch = profileText.match(/name["']?\s*:\s*["']([^"']+)["']/i);
        if (nameMatch) extracted.name = nameMatch[1];
        
        const scoreMatch = profileText.match(/empowermentScore["']?\s*:\s*(\d+)/i);
        if (scoreMatch) extracted.empowermentScore = parseInt(scoreMatch[1]);
        
        if (Object.keys(extracted).length > 0) {
          profile = extracted;
        }
      } catch (e2) {
        // Ignore fallback errors
      }
    }
    cleanText = cleanText.replace(/\[PROFILE:\s*\{.+?\}\]/s, '').trim();
  }

  return { cleanText, options, isComplete, profile };
}
