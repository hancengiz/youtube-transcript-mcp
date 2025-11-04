# Claude Code Sub-Agent Guide: YouTube Transcript Analyzer

This guide explains how to use Claude Code sub-agents with the YouTube Transcript MCP server to save context and improve your workflow when analyzing video content.

## Table of Contents

- [What Are Claude Code Sub-Agents?](#what-are-claude-code-sub-agents)
- [The Context Problem](#the-context-problem)
- [The youtube-transcript-analyzer Agent](#the-youtube-transcript-analyzer-agent)
- [How to Create the Agent](#how-to-create-the-agent)
- [Usage Examples](#usage-examples)
- [Benefits](#benefits)
- [Advanced Tips](#advanced-tips)

---

## What Are Claude Code Sub-Agents?

Claude Code supports **specialized sub-agents** that can be launched to handle specific tasks autonomously. These agents run with their own context window and tools, then return results back to the main conversation.

Think of sub-agents as temporary specialized assistants that:

- Have their own isolated context
- Can use all available tools (including MCP servers)
- Execute complex multi-step tasks
- Return only the final result to your main conversation
- Help preserve your main context window

### Available Agent Types

Claude Code provides several built-in agent types:

- `general-purpose`: For complex research and multi-step tasks
- `youtube-transcript-analyzer`: For analyzing YouTube video content (custom)
- Others like `statusline-setup`, `output-style-setup`, etc.

---

## The Context Problem

When analyzing YouTube videos, you typically face a token management challenge:

### Without Sub-Agents

```text
1. You ask: "Analyze this 60-minute video"
2. Claude fetches transcript (~20,000-30,000 tokens)
3. Claude analyzes and responds (~2,000 tokens)
4. Your context now contains: ~22,000-32,000 tokens
5. Follow-up questions carry all this transcript data
6. You quickly hit context limits
```

**Result:** Your main conversation fills up with large transcripts, limiting how many videos you can analyze or how many follow-up questions you can ask.

### With the youtube-transcript-analyzer Sub-Agent

```text
1. You ask: "Analyze this video using sub-agent"
2. Sub-agent launches in isolated context
3. Sub-agent fetches transcript (in its own context)
4. Sub-agent analyzes the video
5. Sub-agent returns ONLY the analysis (~2,000 tokens)
6. Your main context contains only the analysis!
```

**Result:** Your main conversation stays lightweight, letting you analyze multiple videos and have long discussions about the results.

---

## The youtube-transcript-analyzer Agent

The `youtube-transcript-analyzer` is a specialized sub-agent designed specifically for analyzing YouTube video content efficiently.

### What It Does

1. **Accepts a YouTube URL** and analysis instructions
2. **Fetches the transcript** using the MCP server (in its own context)
3. **Analyzes the content** according to your requirements
4. **Returns only the analysis** to your main conversation
5. **Discards the full transcript** from the main context

### Key Benefits

- **Context Efficiency**: Transcript never enters your main conversation
- **Specialized Focus**: Designed specifically for video analysis tasks
- **Flexible Analysis**: Supports summaries, key learnings, quotes, topic extraction, and more
- **Multiple Videos**: Analyze many videos without exhausting your context
- **Clean Results**: Get structured insights without the noise

---

## How to Create the Agent

To replicate the `youtube-transcript-analyzer` agent in your Claude Code setup, you need to configure it in Claude Code's agent registry.

### Prerequisites

1. **Claude Code** installed and configured
2. **YouTube Transcript MCP Server** installed and configured (see main README.md)
3. Access to Claude Code's configuration

### Step 1: Locate Agent Configuration

Claude Code agents are typically configured in:

```bash
~/.claude/agents/
```

Or through Claude Code's settings/configuration system.

### Step 2: Create the Agent Definition

Create a new agent configuration with the following structure:

```json
{
  "name": "youtube-transcript-analyzer",
  "description": "Use this agent when the user requests analysis of a YouTube video's content. This includes requests for summaries, key highlights, specific information extraction, or any custom analysis of video transcripts. The agent should be invoked proactively whenever a user provides a YouTube URL along with instructions about what they want to learn from the video.",
  "type": "specialized",
  "tools": ["*"],
  "proactive": true,
  "prompt_template": "You are a specialized agent for analyzing YouTube video content. You have access to the youtube-transcript MCP server which provides two tools:\n\n1. get-transcript - Fetch video transcripts\n2. get-transcript-languages - Check available languages\n\nYour workflow:\n1. Fetch the transcript from the provided YouTube URL using get-transcript\n2. Analyze the content thoroughly\n3. Return ONLY your analysis (not the full transcript)\n4. Structure your response clearly with headers and bullet points\n\nFocus on:\n- Accuracy: Quote exact phrases when relevant\n- Structure: Use clear formatting (headers, lists, sections)\n- Completeness: Cover all aspects requested by the user\n- Conciseness: Be thorough but avoid unnecessary verbosity\n\nUser's task:\n{task}"
}
```

### Step 3: Agent Behavior Settings

The agent should be configured with these behaviors:

**Trigger Conditions:**

- User provides a YouTube URL
- User asks to "analyze", "summarize", "extract from", or "get insights from" a video
- Keywords: "video", "YouTube", "transcript", "talk", "lecture"

**Tool Access:**

- Full access to all tools (`"*"`)
- Specifically needs: `get-transcript`
- Optionally: `get-transcript-languages`

**Proactive Activation:**

```text
// Agent should activate automatically when user says:
"Get key learnings from https://youtube.com/watch?v=..."
"Summarize this video: https://youtu.be/..."
"What does this talk cover? [YouTube URL]"
"Extract quotes about AI from https://youtube.com/..."
```

### Step 4: Complete Agent Configuration File

Here's the complete configuration you can copy:

```yaml
# youtube-transcript-analyzer.yaml
# Place in: ~/.claude/agents/ or your Claude Code agents directory

name: youtube-transcript-analyzer
description: |
  Use this agent when the user requests analysis of a YouTube video's content.
  This includes requests for summaries, key highlights, specific information extraction,
  or any custom analysis of video transcripts. The agent should be invoked proactively
  whenever a user provides a YouTube URL along with instructions about what they want
  to learn from the video.

type: specialized
tools: ["*"]  # Access to all tools, especially youtube-transcript MCP
proactive: true

activation_patterns:
  - "youtube.com"
  - "youtu.be"
  - "analyze video"
  - "summarize video"
  - "key learnings"
  - "video transcript"

system_prompt: |
  You are a specialized agent for analyzing YouTube video content efficiently.

  ## Available Tools

  You have access to the youtube-transcript MCP server:
  - get-transcript: Fetch video transcripts
  - get-transcript-languages: Check available languages

  ## Your Workflow

  1. **Extract the URL**: Identify the YouTube URL from the user's request
  2. **Fetch transcript**: Use get-transcript (without timestamps for long videos)
  3. **Analyze thoroughly**: Process the content according to user's requirements
  4. **Return analysis only**: Provide insights, NOT the full transcript

  ## Analysis Guidelines

  When analyzing:
  - **Structure clearly**: Use headers (##), bullet points, numbered lists
  - **Be specific**: Quote exact phrases when making claims
  - **Stay focused**: Answer what was asked, don't add unnecessary info
  - **Format well**: Make it easy to scan and read

  ## Common Analysis Types

  - **Summary**: Main topic, key points (3-5), conclusion
  - **Key Learnings**: 5-10 actionable insights with explanations
  - **Topic Extraction**: Find all mentions of specific subjects
  - **Quote Mining**: Extract relevant quotes with context
  - **Comparison**: Compare ideas or arguments presented
  - **Technical Breakdown**: Extract code, frameworks, tools mentioned

  ## Output Format

  Always structure your response:

```markdown
## Main Topic
[Brief description]

## Key Points
1. **Point 1**: Explanation
2. **Point 2**: Explanation
...

## [Additional Sections as Needed]
...

## Important Quotes
- "Exact quote" - Context about why this matters
```

  ## Important Notes

  - For videos >60 minutes, use `include_timestamps: false` to avoid token limits
  - If transcript is unavailable, explain why and suggest alternatives
  - Focus on the user's specific question - don't analyze everything
  - Use markdown formatting for readability

  Remember: Your goal is to save context in the main conversation by keeping
  the transcript in YOUR context and returning only valuable insights.

task_template: |
  {task}

  YouTube URL: {url}

  Additional instructions: {instructions}
```

### Step 5: Alternative - Manual Invocation

If your Claude Code version doesn't support custom agent definitions, you can manually trigger the agent behavior by using the Task tool:

```text
// In your conversation with Claude Code:
"Use the general-purpose sub-agent to analyze this YouTube video"

// Or more explicitly:
"Launch a sub-agent to:
1. Fetch the transcript from [URL]
2. Extract key learnings
3. Return only the analysis (not the full transcript)"
```

---

## Usage Examples

### Example 1: Basic Video Summary

**Your Request:**

```text
Use sub-agent to summarize this video: https://www.youtube.com/watch?v=LCEmiRjPEtQ
```

**What Happens:**

1. Claude launches `youtube-transcript-analyzer` agent
2. Agent fetches transcript (~20k tokens in agent's context)
3. Agent analyzes and creates summary
4. Agent returns only the summary (~1k tokens to your context)

**Result:** Your main conversation only contains the ~1k token summary, not the 20k token transcript.

---

### Example 2: Extract Specific Information

**Your Request:**

```text
Use sub-agent to extract all mentions of "LLMs" and "autonomous agents"
from https://www.youtube.com/watch?v=LCEmiRjPEtQ
```

**Agent Output:**

```markdown
## LLM References in the Video

### Main Concepts
1. **LLMs as Operating Systems**
   - "Remarkably, we're now programming computers in English"
   - LLMs should be understood as new OS platforms
   - Similar to 1960s mainframe computing (expensive, shared access)

2. **LLM Limitations**
   - Hallucinations and "jagged intelligence"
   - "Anterograde amnesia" - no long-term memory
   - Gullible, susceptible to prompt injection

## Autonomous Agent References

### Key Philosophy
1. **"Iron Man suits not Iron Man robots"**
   - Focus on augmentation, not full autonomy
   - Keep humans in the loop

2. **Timeline Reality Check**
   - "2025 is not the year of agents"
   - "This is the DECADE of agents"
   - Lessons from autonomous driving apply

[... detailed analysis continues ...]
```

---

### Example 3: Multiple Videos Analysis

**Your Request:**

```text
Use sub-agent to compare the main arguments in these three videos:
1. https://www.youtube.com/watch?v=VIDEO1
2. https://www.youtube.com/watch?v=VIDEO2
3. https://www.youtube.com/watch?v=VIDEO3
```

**Benefits:**

- Each transcript (~20k tokens) stays in agent context
- Only the comparison (~3k tokens) enters your main context
- Total context saved: ~57k tokens!

---

### Example 4: Technical Concept Extraction

**Your Request:**

```text
Use sub-agent to extract:
1. All frameworks and tools mentioned
2. All technical terms and their definitions
3. Key technical recommendations

From: https://www.youtube.com/watch?v=TECH_VIDEO
```

**Agent Output:**

```markdown
## Frameworks and Tools Mentioned

1. **React** (16:45)
   - Context: Used for building the frontend UI
   - Recommendation: "React's component model works well with AI-generated code"

2. **FastAPI** (23:10)
   - Context: Backend API framework of choice
   - Reason: Fast development, automatic API documentation

3. **LangChain** (31:20)
   - Context: LLM orchestration and chaining
   - Use case: Building complex multi-step AI workflows

## Technical Terms Defined

- **Embeddings** (12:30): Vector representations of text that capture semantic meaning
- **RAG** (18:45): Retrieval Augmented Generation - combining knowledge retrieval with LLM generation
- **Fine-tuning** (25:15): Training a pre-trained model on specific domain data

## Key Technical Recommendations

1. Start with prompting before fine-tuning (22:30)
2. Use structured outputs for reliability (28:40)
3. Implement human-in-the-loop verification (35:20)
```

---

## Benefits

### 1. Context Efficiency

**Without sub-agent:**

- Video 1 transcript: 20k tokens
- Video 2 transcript: 25k tokens
- Video 3 transcript: 18k tokens
- **Total: 63k tokens in main context** ❌

**With sub-agent:**

- Video 1 analysis: 2k tokens
- Video 2 analysis: 2k tokens
- Video 3 analysis: 2k tokens
- **Total: 6k tokens in main context** ✅

**Savings: ~57k tokens (90% reduction)**

### 2. Focused Conversations

Your main conversation stays clean and focused on insights, not raw data:

```text
Main Context Contains:
✅ Summaries and key learnings
✅ Extracted quotes and insights
✅ Comparisons and analyses
❌ Not raw 30k-token transcripts
```

### 3. Multiple Video Analysis

Analyze many videos in one session:

```text
Without sub-agent: ~2-3 videos before context fills
With sub-agent: 10+ videos easily analyzed
```

### 4. Better Follow-up Questions

Because your context isn't filled with transcripts, you can:

- Ask deeper follow-up questions
- Cross-reference multiple videos
- Maintain longer conversations
- Get more detailed analyses

### 5. Reusable Patterns

Once configured, the agent automatically activates:

```text
You: "Analyze https://youtube.com/watch?v=..."
Claude: *automatically launches sub-agent* ✅

No need to remember to ask for sub-agent usage!
```

---

## Advanced Tips

### Tip 1: Chain Multiple Analyses

Analyze one video, then use insights to guide analysis of another:

```text
Step 1: "Use sub-agent to get key concepts from Video A"
Step 2: "Now use sub-agent to find where Video B discusses [concepts from A]"
Step 3: "Compare the two perspectives"
```

### Tip 2: Iterative Refinement

Get a broad summary first, then drill down:

```text
Request 1: "Use sub-agent to summarize Video X"
Request 2: "Use sub-agent to extract more details about [interesting topic from summary]"
```

### Tip 3: Structured Data Extraction

Ask for specific formats:

```text
"Use sub-agent to extract a JSON list of:
{
  "frameworks": [...],
  "key_quotes": [...],
  "action_items": [...]
}
From: [YouTube URL]"
```

### Tip 4: Long Video Optimization

For videos over 60 minutes:

```text
"Use sub-agent to analyze this video without timestamps to avoid token limits:
[Long video URL]"
```

The agent will automatically use `include_timestamps: false` parameter.

### Tip 5: Parallel Analysis

Launch multiple agents for different aspects:

```text
"Launch sub-agents in parallel to:
Agent 1: Extract technical details from Video A
Agent 2: Extract business insights from Video A
Agent 3: Compare with Video B's approach"
```

### Tip 6: Context Preservation Strategy

For research sessions:

```text
Session Strategy:
1. Use sub-agents for all transcript fetching
2. Keep summaries in main context
3. Save detailed analyses to files
4. Reference files in later discussions

This lets you maintain a research session across dozens of videos!
```

---

## Troubleshooting

### Agent Not Activating

**Problem:** Claude doesn't automatically launch the sub-agent

**Solutions:**

1. Explicitly request: "Use the youtube-transcript-analyzer agent"
2. Be clear about the video URL
3. Check agent configuration is properly installed
4. Use manual invocation: "Launch a sub-agent to analyze..."

### Token Limit Errors

**Problem:** "Response exceeds maximum allowed tokens (25000)"

**Solution:**

```text
"Use sub-agent to analyze this video WITHOUT timestamps:
[YouTube URL]"
```

The agent should automatically request transcripts without timestamps for long videos.

### Agent Returns Full Transcript

**Problem:** Sub-agent returns the entire transcript instead of analysis

**Solution:**

Be explicit in your request:

```text
"Use sub-agent to analyze (not transcribe) this video and return ONLY:
1. Summary
2. Key learnings
3. Important quotes

Do NOT return the full transcript.
URL: [YouTube URL]"
```

### Multiple Videos Confusion

**Problem:** Agent mixes up content from multiple videos

**Solution:**

Analyze one at a time, or be very explicit:

```text
"Use sub-agent to separately analyze:

Video 1: [URL1]
Task: Extract technical concepts

Video 2: [URL2]
Task: Extract business insights

Return results in two clearly separated sections."
```

---

## Real-World Workflow Example

Here's a complete workflow showing the power of the youtube-transcript-analyzer agent:

### Research Task: "Understand current thinking on AI agents"

**Step 1:** Analyze foundational talk

```text
You: "Use sub-agent to get key learnings from Andrej Karpathy's talk:
https://www.youtube.com/watch?v=LCEmiRjPEtQ"

Context used: ~2k tokens (analysis only)
```

**Step 2:** Compare with another perspective

```text
You: "Use sub-agent to analyze Andrew Ng's perspective:
https://www.youtube.com/watch?v=EXAMPLE_URL

Focus on how it differs from Karpathy's views on agent autonomy"

Context used: ~2k tokens (comparison)
Total context: ~4k tokens
```

**Step 3:** Deep dive on specific topic

```text
You: "Use sub-agent to extract everything about 'partial autonomy' from:
https://www.youtube.com/watch?v=ANOTHER_URL"

Context used: ~1.5k tokens
Total context: ~5.5k tokens
```

**Step 4:** Synthesize insights (in main context)

```text
You: "Based on the three analyses, create a framework for building AI agents"

Claude: *Uses the 3 analyses (5.5k tokens) to create synthesis*
```

**Result:**

- Analyzed 3 hour-long videos (~60k tokens of transcript)
- Main context only used ~6-7k tokens
- Still have ~193k tokens for detailed discussion!

**Without sub-agent:**

- Would have used ~60k tokens just for transcripts
- Might have hit context limits after 2-3 videos
- Less room for synthesis and discussion

---

## Conclusion

The `youtube-transcript-analyzer` sub-agent is a powerful pattern for:

✅ **Context efficiency** - Keep transcripts out of main conversation
✅ **Multiple videos** - Analyze many videos in one session
✅ **Focused insights** - Get structured analysis, not raw data
✅ **Better research** - Maintain longer, deeper conversations
✅ **Automatic activation** - No need to remember the pattern

### Quick Reference

**Basic Usage:**

```text
"Use sub-agent to [analyze/summarize/extract from] this video: [URL]"
```

**For Long Videos:**

```text
"Use sub-agent to analyze without timestamps: [URL]"
```

**For Specific Extraction:**

```text
"Use sub-agent to extract [specific topics] from [URL]"
```

**For Comparison:**

```text
"Use sub-agent to compare [URL1] and [URL2] on [topic]"
```

---

## Additional Resources

- **Main README**: Setup and basic usage
- **MCP Protocol Docs**: Understanding Model Context Protocol
- **Claude Code Docs**: Advanced agent configuration
- **Test Suite**: See `test-server.js` for examples

---

## Contributing

If you have improvements to the agent configuration or additional usage patterns, please contribute:

1. Fork the repository
2. Add your improvements to this guide
3. Submit a pull request
4. Share your use cases in issues/discussions

---

**Created by:** [Cengiz Han](https://cengizhan.com)
**License:** MIT
**Repository:** [youtube-transcript-mcp](https://github.com/hancengiz/youtube-transcript-mcp)
