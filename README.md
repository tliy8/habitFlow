# HabitFlow – AI-Powered Habit Tracker

A habit tracking web application with an AI assistant powered by Google Gemini. Track your daily habits, view progress statistics, and get AI-powered coaching and insights.

## 1. Project Choice

**Habit Tracking with AI Coaching**

I built a habit tracker with an embedded AI assistant that can:
- Log habits from natural language (e.g., "I completed my morning run")
- Provide coaching when users miss habits
- Generate insights from habit data
- Offer daily reflections

---

## 2. Justification of Tools

| Tool | Why I Chose It |
|------|----------------|
| **Google Gemini 1.0 Pro** | Free tier API access, good instruction-following for structured JSON output, handles conversational prompts well |
| **Next.js 16** | Full-stack React framework with built-in API routes – no separate backend needed |
| **Prisma + SQLite** | Type-safe database queries, zero-configuration database for easy setup |
| **TypeScript** | Catch errors at compile time, better code maintainability |
| **@google/generative-ai** | Official Google SDK with simple API for text generation |

---

## 3. High-Level Approach

I used a **single prompt chain** with intent routing:

```
User Message → Intent Router → Mode Handler → Response
```

**Step 1:** The router classifies user intent into one of 4 categories:
- `log_habit` – User completed activities
- `coach` – User struggling/missed habits  
- `insight` – User asks about patterns
- `reflection` – User wants daily summary

**Step 2:** Based on intent, a specialized prompt handles the request and returns a response.

**Key Design Decisions:**
- AI never writes to database directly (returns structured data for frontend to handle)
- Each mode has its own system prompt optimized for that task
- Fallback responses if AI fails

---

## 4. Final Prompts

### Intent Router
```
You are an intent classifier for a habit tracking app.

Classify the user's message into exactly ONE intent:

1. log_habit - User describes actions they completed today
   Examples: "I drank water", "did my morning run", "finished reading"

2. coach - User mentions missing, failing, struggling, or feeling bad about habits
   Examples: "I missed my workout", "I've been slacking", "feeling unmotivated"

3. insight - User asks about their patterns, progress, or performance
   Examples: "how am I doing?", "what's my best habit?", "show my stats"

4. reflection - User wants a summary, review, or feedback on their day/week
   Examples: "give me my summary", "how was today?", "end of day review"

Be conservative. If unsure, default to "coach" for emotional content or "insight" for questions.
```

### Coach Mode
```
You are a professional habit coach embedded in a habit tracking app.

BEHAVIOR RULES (STRICT):
1. NEVER shame the user
2. NEVER say "it's okay" without guidance
3. ALWAYS protect user identity ("you are someone who shows up")
4. ALWAYS end with ONE concrete next action
5. Reframe failure as data, not defeat

TONE: Calm, supportive but firm, professional. NO emojis, NO exclamation marks.

STRUCTURE:
1. Acknowledge what they shared (1 sentence)
2. Reframe the situation (1-2 sentences)
3. Give ONE specific, actionable next step

Keep response under 80 words.
```

### Log Habit Mode
```
You are a habit logging assistant.

The user will describe activities they completed. Your job is to:
1. Extract the habits they mentioned
2. Match them to their known habit list if possible

Be generous in matching. "ran 5km" matches "Morning Run".

Known habits: {HABITS}
```

### Insight Mode
```
You are a habit data analyst.

Given the user's habit completion data, provide ONE actionable insight.

RULES:
1. Focus on patterns, not just numbers
2. Be specific and actionable
3. Maximum 2 sentences
4. Professional tone
```

### Reflection Mode
```
You are a habit reflection coach providing end-of-day summaries.

RULES:
1. Start with what was accomplished
2. If habits missed, frame tomorrow as opportunity
3. End with one thing to focus on tomorrow
4. Maximum 3 sentences
```

---

## 5. Instructions

### Prerequisites
- Node.js 18+
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/habit-tracker.git
cd habit-tracker

# Install dependencies
npm install

# Create .env file
echo "DATABASE_URL=file:./dev.db" > .env
echo "NEXTAUTH_SECRET=your-secret-key" >> .env
echo "NEXTAUTH_URL=http://localhost:3000" >> .env
echo "GEMINI_API_KEY=your-gemini-api-key" >> .env

# Initialize database
npx prisma db push

# Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Testing the AI
1. Register an account
2. Create some habits
3. Use the AI chat feature to log habits or ask for coaching

---

## 6. Challenges & Iterations

### Challenge 1: JSON Parsing
**Problem:** Gemini sometimes wrapped JSON in markdown code blocks.
**Solution:** Added cleanup logic to strip markdown formatting before parsing.

### Challenge 2: Overly Enthusiastic Responses
**Problem:** Initial coaching was too "hype" – lots of exclamation marks and "You've got this!"
**Solution:** Added strict rules: "NO emojis, NO exclamation marks, reframe failure as data."

### Challenge 3: Habit Matching
**Problem:** "ran 5km" should match user's habit named "Morning Run."
**Solution:** Implemented fuzzy matching with keyword overlap and substring matching.

---

## Tech Stack

- **Frontend:** Next.js 16, React 19, TailwindCSS, Framer Motion
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** SQLite
- **AI:** Google Gemini 1.0 Pro
- **Auth:** NextAuth.js

---

## License

MIT
