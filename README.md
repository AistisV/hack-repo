# Visibly — AI Recommendation Engine

> "See what AI says about your company. Fix it in 3 minutes."

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Claude API key
Open `.env` and replace the placeholder:
```
VITE_CLAUDE_API_KEY=your_actual_claude_api_key_here
```

Get your key at: https://console.anthropic.com

### 3. Run the app
```bash
npm run dev
```

Open http://localhost:5173

---

## How It Works

1. Enter any company URL or name
2. App runs 4 Claude prompts in sequence
3. Shows Recommendation Report — score, gaps, competitor
4. Generates 5-tab AI Content Pack — ready to publish

---

## Demo Mode (No API Key)

If no API key is set — the app automatically loads the Nando Holdings demo.
Perfect for showing the product without API costs.

---

## Deploy to Vercel

```bash
npm run build
# Upload dist/ folder to Vercel
# Or connect GitHub repo to Vercel for auto-deploy
# Add VITE_CLAUDE_API_KEY as environment variable in Vercel dashboard
```

---

## File Structure

```
src/
├── App.jsx                    # Main flow controller
├── api/claude.js              # Claude API wrapper
├── prompts/
│   ├── prompt1_analyzer.js    # Company Intelligence Extractor
│   ├── prompt2_queries.js     # Buyer Query Generator
│   ├── prompt3_gaps.js        # Gap Analyzer
│   └── prompt4_content.js     # Content Pack Generator
├── screens/
│   ├── Screen1_Landing.jsx    # URL input + split screen visual
│   ├── Screen2_Report.jsx     # Recommendation report
│   └── Screen3_Pack.jsx       # 5-tab content pack
├── components/
│   └── LoadingAnimation.jsx   # Step-by-step loading
└── utils/
    ├── parser.js              # JSON and content parser
    └── nando_backup.js        # Hardcoded demo fallback
```

---

## The 5 Content Tabs

| Tab | What It Does |
|-----|-------------|
| llms.txt | Direct AI instruction file — publish at yoursite.com/llms.txt |
| Fact Sheet | Wikipedia-style authority page for AI to cite |
| JSON-LD | Schema markup for Google AI entity recognition |
| FAQ Block | 10 buyer questions answered for AI citation |
| LinkedIn Posts | Citation trail content for Perplexity indexing |

---

Built for Make It Real Hackathon — Vilnius, Lithuania, May 2026
