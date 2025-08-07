// Gemini AI Service for Chatbot Integration

interface GeminiResponse {
  text: string;
  error?: string;
}

class GeminiService {
  private apiKey: string | null = null;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    // Your Gemini API key - replace with your actual key
    this.apiKey = 'AIzaSyCyz39WK44TUkx1aS5X5sM_7nHl2aQk8bo';
  }

  async generateResponse(userMessage: string, context: string = ''): Promise<string> {
    if (!this.apiKey) {
      console.warn('Gemini API key not configured. Using fallback responses.');
      return this.getFallbackResponse(userMessage);
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: this.buildPrompt(userMessage, context)
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  private buildPrompt(userMessage: string, context: string): string {
    const basePrompt = `You are an inspiring and motivational AI mentor for software engineering freshers. Your role is to:

1. MOTIVATE and ENCOURAGE freshers in their learning journey
2. Provide SPECIFIC, ACTIONABLE advice for skill development
3. Share PRACTICAL tips and best practices
4. Help them understand their progress and next steps
5. Give CONFIDENCE-BUILDING responses

Context: ${context || 'Training and skill development'}

User message: ${userMessage}

IMPORTANT: Always be:
- ENCOURAGING and POSITIVE
- SPECIFIC with actionable advice
- MOTIVATIONAL about their progress
- PRACTICAL with real-world examples
- CONFIDENCE-BUILDING

Focus on:
- SPECIFIC ways to improve coding skills (daily practice, projects, resources)
- DETAILED learning paths for different technologies (JavaScript, React, Python, etc.)
- PRACTICAL project ideas they can build immediately
- STEP-BY-STEP guidance for skill development
- RESOURCES and tools for learning (platforms, courses, books)
- ALGORITHM and problem-solving strategies
- PORTFOLIO building and career preparation
- REAL-WORLD application of skills
- PROGRESS tracking and goal setting

Make your response INSPIRING, MOTIVATIONAL, and SPECIFIC to help them grow as developers.

Response:`;

    return basePrompt;
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! 🌟 Welcome to your exciting journey in software engineering! You're taking amazing steps toward your future. What would you like to work on today? I'm here to motivate and guide you every step of the way!";
    } else if (lowerMessage.includes('help')) {
      return "I'm your personal mentor and biggest cheerleader! 🚀 Let's tackle this together. What specific area would you like to focus on? Whether it's coding challenges, understanding concepts, or building confidence - I'm here to inspire and guide you to success!";
    } else if (lowerMessage.includes('progress')) {
      return "Your progress is incredible! 🎯 Every step you take is building your future. Remember, every expert was once a beginner. Focus on consistent daily practice - even 30 minutes of coding daily will transform your skills. What's your next goal?";
    } else if (lowerMessage.includes('quiz')) {
      return "Daily quizzes are your secret weapon! 💪 They're not just tests - they're your confidence builders. Each quiz strengthens your foundation. Pro tip: Review wrong answers, they're your biggest learning opportunities. Ready to ace the next one?";
    } else if (lowerMessage.includes('assignment')) {
      return "Assignments are your playground for creativity! 🎨 Don't just complete them - own them! Break down complex problems into smaller pieces. Start early, test often, and remember: every bug you fix makes you stronger. What assignment excites you most?";
    } else if (lowerMessage.includes('certification')) {
      return "Certifications are your badges of honor! 🏆 They prove your dedication and skills. Study smart: focus on understanding concepts, not just memorizing. Practice with real projects, and remember - you're building a portfolio that will open doors!";
    } else if (lowerMessage.includes('dashboard')) {
      return "Your dashboard is your command center! 🎮 It shows your incredible journey. Every completed module is a victory. Use it to track your growth and celebrate your wins. What milestone are you most proud of?";
    } else if (lowerMessage.includes('module')) {
      return "Each module is a stepping stone to greatness! 🌟 Daily Quiz builds your foundation, Coding Challenges sharpen your problem-solving, Assignments develop your creativity, and Certifications validate your expertise. Which module excites you most?";
    } else if (lowerMessage.includes('skill') || lowerMessage.includes('develop') || lowerMessage.includes('improve')) {
      return "Skill development is your superpower! 💫 Here's your comprehensive action plan:\n\n🎯 **Daily Practice (30-60 minutes):**\n• Code every single day - consistency beats intensity\n• Work on small projects that excite you\n• Practice on platforms like LeetCode, HackerRank\n\n🚀 **Project-Based Learning:**\n• Build a personal portfolio website\n• Create a to-do app with React\n• Develop a weather app using APIs\n• Build a simple e-commerce site\n\n📚 **Learning Resources:**\n• FreeCodeCamp for structured learning\n• YouTube channels: Traversy Media, The Net Ninja\n• Books: 'Eloquent JavaScript', 'Clean Code'\n• Online courses: Udemy, Coursera\n\n💡 **Advanced Skills:**\n• Learn Git & GitHub for version control\n• Practice debugging and problem-solving\n• Study data structures & algorithms\n• Learn testing (Jest, React Testing Library)\n\n🌟 **Soft Skills:**\n• Join coding communities (Discord, Reddit)\n• Contribute to open source projects\n• Practice explaining code to others\n• Build a network of fellow developers\n\nWhat specific skill would you like to focus on first?";
    } else if (lowerMessage.includes('coding') || lowerMessage.includes('programming')) {
      return "Coding is your creative superpower! 🎨 Here's how to level up:\n\n🔥 **Daily Coding Habits:**\n• Code for at least 1 hour daily\n• Solve 2-3 coding problems on LeetCode\n• Build something new every week\n• Read and understand others' code\n\n🎯 **Focus Areas:**\n• **JavaScript/React**: Build interactive UIs\n• **Python**: Automate tasks, data analysis\n• **SQL**: Master database queries\n• **APIs**: Learn to integrate external services\n\n💪 **Practice Strategies:**\n• Break down complex problems into smaller parts\n• Use pseudocode before writing actual code\n• Debug step by step - don't skip errors\n• Refactor your code for better readability\n\n🚀 **Project Ideas:**\n• Personal blog with React\n• Weather app with APIs\n• Task manager with local storage\n• Calculator with advanced features\n• Portfolio website with animations\n\nWhat programming language or concept would you like to master?";
    } else if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
      return "JavaScript is your gateway to web development! 🌐 Here's your mastery plan:\n\n📚 **Core Concepts to Master:**\n• Variables, functions, and scope\n• Arrays and object manipulation\n• DOM manipulation and events\n• Async programming (Promises, async/await)\n• ES6+ features (arrow functions, destructuring)\n\n🎯 **Practice Projects:**\n• Build a calculator with advanced operations\n• Create a todo app with local storage\n• Develop a quiz app with scoring\n• Make a weather app using APIs\n• Build a portfolio with smooth animations\n\n💡 **Advanced Topics:**\n• Learn React for component-based development\n• Master state management (useState, useEffect)\n• Practice with modern tools (Vite, TypeScript)\n• Understand testing with Jest\n\n🚀 **Resources:**\n• MDN Web Docs for reference\n• JavaScript.info for deep learning\n• YouTube: Traversy Media, The Net Ninja\n• Practice on CodePen and JSFiddle\n\nReady to build something amazing with JavaScript?";
    } else if (lowerMessage.includes('react') || lowerMessage.includes('frontend')) {
      return "React is your ticket to building amazing user interfaces! ⚛️ Here's your React mastery plan:\n\n🎯 **Start with Fundamentals:**\n• Components and JSX syntax\n• Props and state management\n• Event handling and forms\n• Conditional rendering and lists\n\n🚀 **Core Concepts:**\n• Hooks: useState, useEffect, useContext\n• Component lifecycle and side effects\n• Props drilling vs Context API\n• Custom hooks for reusable logic\n\n💡 **Advanced React:**\n• Learn TypeScript for type safety\n• Master state management (Redux, Zustand)\n• Practice with React Router for navigation\n• Build with modern tools (Vite, Next.js)\n\n🎨 **Project Ideas:**\n• E-commerce site with cart functionality\n• Social media dashboard with charts\n• Task manager with drag-and-drop\n• Portfolio with smooth animations\n• Blog with markdown support\n\n🌟 **Best Practices:**\n• Write clean, readable components\n• Use proper naming conventions\n• Implement error boundaries\n• Optimize performance with useMemo/useCallback\n\nReady to create stunning React applications?";
    } else if (lowerMessage.includes('problem') || lowerMessage.includes('algorithm')) {
      return "Problem-solving is the heart of programming! 🧠 Here's your algorithm mastery plan:\n\n🎯 **Start with Basics:**\n• Arrays and string manipulation\n• Loops and conditional statements\n• Basic sorting and searching\n• Time and space complexity\n\n🚀 **Data Structures:**\n• Arrays and linked lists\n• Stacks and queues\n• Trees and graphs\n• Hash tables and sets\n\n💡 **Algorithm Patterns:**\n• Two pointers technique\n• Sliding window approach\n• Binary search variations\n• Dynamic programming basics\n• Recursion and backtracking\n\n🎯 **Practice Strategy:**\n• Solve 2-3 problems daily on LeetCode\n• Start with easy problems, gradually increase difficulty\n• Focus on understanding patterns, not memorizing\n• Practice explaining your solutions\n\n🌟 **Resources:**\n• LeetCode for practice problems\n• HackerRank for skill assessment\n• YouTube: Back To Back SWE, NeetCode\n• Books: 'Cracking the Coding Interview'\n\nWhat type of problems would you like to tackle first?";
    } else if (lowerMessage.includes('motivation') || lowerMessage.includes('inspire')) {
      return "You are capable of amazing things! 🌟 Remember: every successful developer started exactly where you are. Your dedication to learning sets you apart. Focus on progress, not perfection. Every line of code you write is building your future. What's your biggest dream in tech?";
    } else if (lowerMessage.includes('portfolio') || lowerMessage.includes('resume')) {
      return "Your portfolio is your digital identity! 🎨 Here's how to build an impressive one:\n\n🚀 **Essential Projects:**\n• Personal portfolio website (showcase your skills)\n• Full-stack application (demonstrate end-to-end development)\n• API integration project (show real-world skills)\n• Mobile-responsive design (prove adaptability)\n• Performance-optimized app (show technical depth)\n\n💡 **Portfolio Tips:**\n• Keep it clean and professional\n• Include live demos and GitHub links\n• Write clear project descriptions\n• Highlight your role and technologies used\n• Show your problem-solving process\n\n🎯 **GitHub Best Practices:**\n• Write clear README files\n• Use meaningful commit messages\n• Organize repositories properly\n• Include setup instructions\n• Show your coding style\n\n🌟 **Stand Out:**\n• Add testimonials or recommendations\n• Include a blog section\n• Show your learning journey\n• Demonstrate continuous improvement\n\nReady to build a portfolio that opens doors?";
    } else {
      return "You're asking great questions! 🚀 That curiosity will take you far in tech. Remember: every challenge is an opportunity to grow stronger. What specific area would you like to explore? Whether it's coding, problem-solving, or building confidence - I'm here to inspire and guide you to success!";
    }
  }

  // Method to set API key (for development/testing)
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  // Method to check if API is available
  isApiAvailable(): boolean {
    return this.apiKey !== null && this.apiKey !== '';
  }
}

// Export singleton instance
const geminiService = new GeminiService();
export default geminiService; 