# Maximus Engagimus - Complete Project Specification

**Version:** 1.0  
**Date:** January 10, 2026  
**Client:** Maximus Digital Marketing  
**Document Purpose:** Lead Developer Guide - Start to Finish

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Branding & Design](#2-branding--design)
3. [Tech Stack](#3-tech-stack)
4. [User Authentication & Team Management](#4-user-authentication--team-management)
5. [Database Schema](#5-database-schema)
6. [Feature Specifications](#6-feature-specifications)
   - 6.1 [Client Management](#61-client-management)
   - 6.2 [Comment Generator](#62-comment-generator)
   - 6.3 [Content Analyzer](#63-content-analyzer)
   - 6.4 [Competitor Tracking](#64-competitor-tracking)
   - 6.5 [AI Provider Management](#65-ai-provider-management)
   - 6.6 [Comment History & Learning](#66-comment-history--learning)
7. [AI Integration](#7-ai-integration)
8. [Prompt Engineering](#8-prompt-engineering)
9. [User Interface Specifications](#9-user-interface-specifications)
10. [API Endpoints](#10-api-endpoints)
11. [Security Considerations](#11-security-considerations)
12. [Future Considerations](#12-future-considerations)

---

## 1. Project Overview

### 1.1 Purpose

Maximus Engagimus is a social media engagement tool designed for digital marketing agencies to manage and generate authentic, client-specific comments across multiple social media platforms. The tool enables agencies to:

- Store detailed client profiles with unique voice/tone settings
- Generate tailored comments for engagement opportunities
- Analyze content to determine which clients should engage
- Track competitor activity across platforms
- Learn from user preferences to improve suggestions over time

### 1.2 Target Users

- Digital marketing agencies
- Social media managers
- Lead generation specialists
- Up to 5 concurrent team members per organization

### 1.3 Supported Platforms

The tool generates comments optimized for:

- Instagram
- Facebook
- LinkedIn
- X (Twitter)
- TikTok
- Reddit
- Industry-specific forums (e.g., Houzz for construction)
- Custom platforms (user-defined)

---

## 2. Branding & Design

### 2.1 Name

**Maximus Engagimus**

- Visual treatment: Highlight "Engage" within the name
- Example: Maximus **Engage**imus
- Use bold, color differentiation, or design element to emphasize "Engage"

### 2.2 Primary Color

**Pokémon Blue:** `#3B4CCA`

This is the dominant blue from the Pokémon logo. Use as:
- Primary buttons
- Headers
- Active states
- Links
- Accent elements

### 2.3 Color Palette

| Purpose | Color | Hex Code |
|---------|-------|----------|
| Primary | Pokémon Blue | `#3B4CCA` |
| Primary Hover | Darker Blue | `#2D3A9E` |
| Secondary | Light Blue | `#E8EAFC` |
| Background | White/Off-white | `#FFFFFF` / `#F8F9FA` |
| Text Primary | Dark Gray | `#1A1A2E` |
| Text Secondary | Medium Gray | `#6B7280` |
| Success | Green | `#10B981` |
| Warning | Amber | `#F59E0B` |
| Error | Red | `#EF4444` |
| Border | Light Gray | `#E5E7EB` |

### 2.4 Design Style

- Clean, professional, polished appearance
- Generous whitespace
- Rounded corners (8px default)
- Subtle shadows for depth
- Clear visual hierarchy
- Mobile-responsive

---

## 3. Tech Stack

### 3.1 Frontend

- **Framework:** React (with hooks)
- **Styling:** Tailwind CSS
- **State Management:** React Context or Zustand
- **Routing:** React Router
- **HTTP Client:** Axios or Fetch API

### 3.2 Backend

- **Platform:** Supabase
  - Authentication
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Real-time subscriptions (optional)

### 3.3 AI Integration

- Multiple AI providers (configurable)
- OpenAI-compatible API format preferred
- Fallback system for provider failures

### 3.4 Deployment

- Frontend: Vercel, Netlify, or similar
- Backend: Supabase (managed)

---

## 4. User Authentication & Team Management

### 4.1 Authentication Method

- Email/password authentication via Supabase Auth
- Optional: Google OAuth

### 4.2 User Limits

- Maximum 5 users per organization
- All users share access to the same data (clients, comments, etc.)

### 4.3 User Roles

For initial release, all users have equal access. Future consideration for role-based permissions.

---

## 5. Database Schema

### 5.1 Tables Overview

```
organizations
├── users
├── clients
│   ├── client_platforms
│   ├── client_keywords
│   └── client_sample_comments
├── competitors
│   └── competitor_sightings
├── ai_providers
├── generated_comments
└── platform_prompts
```

### 5.2 Detailed Schema

#### organizations
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### clients
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255) NOT NULL,
  description TEXT,
  voice_prompt TEXT NOT NULL,
  voice_prompt_with_cta TEXT,
  default_cta TEXT,
  target_audience TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### client_platforms
```sql
CREATE TABLE client_platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  platform_name VARCHAR(100) NOT NULL,
  handle VARCHAR(255),
  profile_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### client_keywords
```sql
CREATE TABLE client_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  keyword VARCHAR(255) NOT NULL,
  keyword_type VARCHAR(50) DEFAULT 'topic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- `keyword_type`: 'topic', 'industry', 'avoid' (for keywords to avoid mentioning)

#### client_sample_comments
```sql
CREATE TABLE client_sample_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  platform VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### client_industry_sites
```sql
CREATE TABLE client_industry_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  site_name VARCHAR(255) NOT NULL,
  site_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### competitors
```sql
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### competitor_sightings
```sql
CREATE TABLE competitor_sightings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  location_type VARCHAR(100) NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  location_url TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  last_seen_date DATE,
  notes TEXT,
  predefined_note VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- `location_type`: 'facebook_group', 'linkedin_group', 'forum', 'subreddit', 'other'
- `priority`: 'high', 'medium', 'low'

#### predefined_sighting_notes
```sql
CREATE TABLE predefined_sighting_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  note_text VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Default values to seed:
- "Posts here weekly"
- "High engagement"
- "Moderator in this group"
- "Very active"
- "Occasional poster"
- "Responds to comments"
- "Shares industry news"
- "Promotes services frequently"

#### ai_providers
```sql
CREATE TABLE ai_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  api_base_url TEXT NOT NULL,
  api_key_encrypted TEXT,
  model_name VARCHAR(255) NOT NULL,
  is_free BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  fallback_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### ai_chat_links
```sql
CREATE TABLE ai_chat_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Default values to seed:
- ChatGPT: https://chat.openai.com
- Claude: https://claude.ai
- Gemini: https://gemini.google.com
- Groq Playground: https://console.groq.com/playground
- DeepSeek: https://chat.deepseek.com

#### platform_prompts
```sql
CREATE TABLE platform_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  platform_name VARCHAR(100) NOT NULL,
  style_prompt TEXT NOT NULL,
  max_length INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, platform_name)
);
```

#### generated_comments
```sql
CREATE TABLE generated_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id),
  platform VARCHAR(100),
  original_content TEXT,
  original_content_url TEXT,
  existing_comments TEXT,
  generated_options JSONB NOT NULL,
  selected_option_index INTEGER,
  selected_comment TEXT,
  was_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  included_cta BOOLEAN DEFAULT false,
  ai_provider_used VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- `generated_options`: JSON array of generated comment options
- `selected_option_index`: Which option the user chose (0-4)
- `selected_comment`: The actual text selected (may be edited)
- `was_used`: Marked true when user confirms they posted it

---

## 6. Feature Specifications

### 6.1 Client Management

#### 6.1.1 Client Profile Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | Text | Yes | Client/company name |
| Industry | Text | Yes | Primary industry |
| Description | Long Text | No | About the client |
| Voice Prompt | Long Text | Yes | Instructions for AI on tone/style |
| Voice Prompt (with CTA) | Long Text | No | Alternative prompt when CTA is enabled |
| Default CTA | Text | No | Default call-to-action text |
| Target Audience | Text | No | Who the client wants to reach |
| Keywords | Tags | No | Topics to associate with |
| Sample Comments | List | No | 2-3 examples of ideal comments |
| Industry-Specific Sites | List | No | Relevant platforms/forums |
| Notes | Long Text | No | Internal notes |

#### 6.1.2 AI-Suggested Industry Sites

When adding a new client, after the user enters the industry, the system should:

1. Call the AI with a prompt like: "List 5-10 popular websites, forums, and platforms where professionals in the [INDUSTRY] industry actively discuss topics and engage. Include both general platforms and industry-specific sites. Return as a simple list."

2. Display suggestions to the user

3. Allow user to:
   - Add suggested sites to the client profile
   - Add custom sites manually
   - Ignore suggestions

#### 6.1.3 Client List View

- Show all clients in a card or table layout
- Display: Name, Industry, Active Status, Last Updated
- Quick actions: Edit, Deactivate, Delete
- Search/filter by name or industry
- Sort by name, industry, or date

#### 6.1.4 Client Detail View

- Full profile information
- List of associated platforms
- Sample comments
- Competitors linked to this client
- Recent generated comments for this client

---

### 6.2 Comment Generator

#### 6.2.1 Input Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Select Client | Dropdown | Yes | Choose which client is commenting |
| Platform | Dropdown | Yes | Target platform |
| Content/URL | Text Area | Yes | Post content or URL to analyze |
| Existing Comments | Text Area | No | Copy/paste existing comments |
| Poster Info | Text Area | No | Info about original poster |
| Hashtags/Topics | Text | No | Relevant hashtags |
| Number of Options | Dropdown | Yes | 1-5 (default: 3) |
| Include CTA | Checkbox | No | Toggle soft pitch |

#### 6.2.2 Generation Process

1. User fills in required fields
2. System builds prompt using:
   - Client's voice prompt (or CTA version if checkbox enabled)
   - Platform-specific style prompt
   - Content being responded to
   - Existing comments (to avoid repetition)
   - Poster info and hashtags
3. System calls AI provider (default first, then fallbacks)
4. Display generated options

#### 6.2.3 Output Display

For each generated option, show:

- The comment text
- Approximate character count
- A label (e.g., "Option 1 - Conversational", "Option 2 - Professional")
- Copy button (one-click copy to clipboard)
- "Mark as Used" button

#### 6.2.4 Variation Types

The AI should generate options with different approaches:

1. **Conversational** - Casual, friendly tone
2. **Professional** - More formal, business-appropriate
3. **Question-Based** - Ends with engaging question
4. **Value-Add** - Includes helpful insight or tip
5. **Brief** - Short and punchy

The number of variations matches the user's selection (1-5).

#### 6.2.5 "No API" Mode

If no API key is configured or user prefers manual AI:

1. System builds the complete prompt
2. User clicks a button for their preferred AI chat interface
3. System:
   - Copies the full prompt to clipboard
   - Opens the selected AI site in a new tab
4. User pastes prompt, gets response, copies back to tool
5. User can still log the comment in the system

---

### 6.3 Content Analyzer

#### 6.3.1 Purpose

Analyze a piece of content (URL or pasted text) and determine which clients should engage, then generate client-specific comments.

#### 6.3.2 Input

- URL or pasted content
- Platform (auto-detect if possible)

#### 6.3.3 Analysis Process

1. Extract/read the content
2. Identify:
   - Main topics/themes
   - Industry relevance
   - Hashtags
   - Poster information (if available)
   - Existing comments (if provided)
3. Match against all active clients based on:
   - Industry alignment
   - Keyword matches
   - Target audience fit
4. Rank clients by relevance

#### 6.3.4 Output Display

1. **Relevance List**
   - Show all matching clients ranked by fit
   - Display why each client matches (e.g., "Industry match: Construction", "Keyword match: renovation, remodeling")
   - Allow user to select which clients should engage

2. **Per-Client Comments**
   - For each selected client, generate comments
   - Show client name with their generated options
   - Each option has copy and "Mark as Used" buttons

#### 6.3.5 Example Flow

1. User pastes URL from a construction forum
2. System analyzes content about "kitchen renovation tips"
3. System shows:
   - **Construction Client** (High relevance - industry match)
   - **Digital Marketing Client** (Medium relevance - could discuss marketing for contractors)
4. User selects both
5. System generates:
   - 3 comments from Construction Client's voice
   - 3 comments from Digital Marketing Client's voice

---

### 6.4 Competitor Tracking

#### 6.4.1 Competitor Profile

Each competitor is linked to a client and includes:

| Field | Type | Required |
|-------|------|----------|
| Name | Text | Yes |
| Website | URL | No |
| Notes | Text | No |

#### 6.4.2 Sighting Log

When a competitor is spotted somewhere, log:

| Field | Type | Required |
|-------|------|----------|
| Location Type | Dropdown | Yes |
| Location Name | Text | Yes |
| Location URL | URL | No |
| Priority | Dropdown | Yes |
| Last Seen Date | Date | Yes |
| Predefined Note | Dropdown | No |
| Custom Note | Text | No |

**Location Types:**
- Facebook Group
- LinkedIn Group
- Forum
- Subreddit
- Instagram
- TikTok
- YouTube
- Other

**Priority Levels:**
- High (valuable, engage here often)
- Medium (worth monitoring)
- Low (occasional opportunity)

**Predefined Notes Dropdown:**

Default options (user can add more):
- "Posts here weekly"
- "High engagement"
- "Moderator in this group"
- "Very active"
- "Occasional poster"
- "Responds to comments"
- "Shares industry news"
- "Promotes services frequently"

Plus: "Add custom note..." option that reveals text field

#### 6.4.3 Sighting List View

- Filter by client, competitor, priority, location type
- Sort by last seen date, priority
- Show total sightings per location
- Quick-add button for new sightings

#### 6.4.4 Sighting Insights

Dashboard showing:
- Most active competitor locations
- High-priority opportunities
- Locations not visited recently
- New sightings this week

---

### 6.5 AI Provider Management

#### 6.5.1 Provider Configuration

Each provider entry includes:

| Field | Type | Required |
|-------|------|----------|
| Provider Name | Text | Yes |
| API Base URL | URL | Yes |
| API Key | Password | No (for free tiers) |
| Model Name/ID | Text | Yes |
| Is Free | Checkbox | No |
| Is Active | Checkbox | Yes |
| Is Default | Radio | No |
| Fallback Order | Number | No |
| Notes | Text | No |

#### 6.5.2 Default Providers to Seed

Include these as starting templates (user adds their own API keys):

| Provider | API Base URL | Model | Free |
|----------|--------------|-------|------|
| Groq | https://api.groq.com/openai/v1 | llama-3.3-70b-versatile | Yes |
| Cerebras | https://api.cerebras.ai/v1 | llama-3.3-70b | Yes |
| Google Gemini | https://generativelanguage.googleapis.com/v1beta | gemini-2.5-flash-lite | Yes |
| OpenRouter | https://openrouter.ai/api/v1 | meta-llama/llama-3.1-8b-instruct:free | Yes |
| Mistral | https://api.mistral.ai/v1 | mistral-small-latest | Yes |
| DeepSeek | https://api.deepseek.com/v1 | deepseek-chat | No |
| OpenAI | https://api.openai.com/v1 | gpt-4o | No |
| Anthropic | https://api.anthropic.com/v1 | claude-3-sonnet | No |

#### 6.5.3 Fallback Logic

1. Try default provider first
2. If error or rate limit (429), try next in fallback order
3. If all fail, show error and offer "No API" mode
4. Log which provider was used for each generation

#### 6.5.4 AI Chat Links (No API Mode)

Configurable list of AI chat interfaces:

| Field | Type |
|-------|------|
| Name | Text |
| URL | URL |
| Is Active | Checkbox |
| Display Order | Number |

When clicked:
1. Copy full prompt to clipboard
2. Show toast notification "Prompt copied!"
3. Open URL in new tab

---

### 6.6 Comment History & Learning

#### 6.6.1 History Log

Every generated comment session is logged with:
- Timestamp
- Client used
- Platform
- Original content/URL
- All generated options
- Which option was selected (if any)
- Whether it was marked as "Used"
- AI provider used

#### 6.6.2 Tracking Usage

**"Mark as Used" Flow:**

1. User generates comments
2. User copies preferred option
3. User clicks "Mark as Used" on that option
4. System records:
   - Which option index was selected
   - The exact text (in case user edited before posting)
   - Timestamp

**"Used Comments" View:**

- List of all comments marked as used
- Filter by client, platform, date range
- Helps avoid reusing similar comments

#### 6.6.3 Learning System

The system improves over time by:

1. **Tracking Preferences**
   - Which option index is most often selected (1st, 2nd, etc.)?
   - Which variation types are preferred per client?
   - Average length of selected comments

2. **Prompt Refinement** (Future Enhancement)
   - Store successful comments
   - Include top-performing examples in future prompts
   - "Generate more like this" feature

3. **Analytics Dashboard**
   - Comments generated vs. used (conversion rate)
   - Most active clients
   - Most common platforms
   - Peak usage times

---

## 7. AI Integration

### 7.1 API Request Format

Use OpenAI-compatible chat completion format:

```javascript
{
  "model": "model-name-here",
  "messages": [
    {
      "role": "system",
      "content": "System prompt here..."
    },
    {
      "role": "user", 
      "content": "User prompt here..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

### 7.2 Response Handling

```javascript
{
  "choices": [
    {
      "message": {
        "content": "Generated response here..."
      }
    }
  ]
}
```

### 7.3 Error Handling

| Error Code | Action |
|------------|--------|
| 401 | Invalid API key - notify user |
| 429 | Rate limit - try fallback provider |
| 500 | Server error - try fallback provider |
| Timeout | Try fallback provider |
| All fail | Show "No API" mode option |

### 7.4 API Key Security

- Encrypt API keys before storing in database
- Never expose keys to frontend
- Use Supabase Edge Functions or similar for API calls
- Decrypt only server-side when making requests

---

## 8. Prompt Engineering

### 8.1 Master Prompt Structure

```
[SYSTEM PROMPT]
You are a social media engagement specialist helping {CLIENT_NAME} engage authentically on {PLATFORM}.

CLIENT VOICE & STYLE:
{CLIENT_VOICE_PROMPT}

{IF CTA_ENABLED}
SOFT CALL-TO-ACTION INSTRUCTIONS:
{CLIENT_VOICE_PROMPT_WITH_CTA}
{/IF}

PLATFORM STYLE:
{PLATFORM_STYLE_PROMPT}

SAMPLE COMMENTS FROM THIS CLIENT:
{SAMPLE_COMMENTS}

RULES:
- Write exactly {NUM_OPTIONS} different comment options
- Each comment should be {PLATFORM_MAX_LENGTH} characters or less
- Make each option distinctly different in approach
- Never repeat or closely echo existing comments
- Sound human and authentic, not AI-generated
- Match the energy of the original post
- Do not use hashtags unless specifically requested
- Do not use emojis unless the platform style calls for them

[USER PROMPT]
ORIGINAL POST/CONTENT:
{CONTENT}

EXISTING COMMENTS TO AVOID REPEATING:
{EXISTING_COMMENTS}

POSTER INFORMATION:
{POSTER_INFO}

RELEVANT HASHTAGS/TOPICS:
{HASHTAGS}

Generate {NUM_OPTIONS} unique comment options. Label each one with its approach style (Conversational, Professional, Question-Based, Value-Add, or Brief).

Format your response as:
---
OPTION 1 - [STYLE]:
[Comment text]

OPTION 2 - [STYLE]:
[Comment text]
---
```

### 8.2 Platform-Specific Style Prompts

#### Instagram
```
Instagram comments should be:
- Warm and personable
- 1-3 sentences maximum (under 150 characters ideal)
- Emoji use is acceptable but not required (1-2 max)
- Avoid sounding salesy
- Can include a genuine question to boost engagement
- Match the casual, visual-first nature of the platform
```

#### Facebook
```
Facebook comments should be:
- Conversational and friendly
- Can be slightly longer than Instagram (50-200 characters)
- Feel like a real person commenting, not a brand
- Questions work well to encourage replies
- Avoid corporate speak
- Can reference shared experiences or community
```

#### LinkedIn
```
LinkedIn comments should be:
- Professional but not stiff
- Provide value or insight when possible
- 1-3 sentences (under 200 characters ideal)
- Can reference industry knowledge
- Avoid overly casual language or slang
- Position the commenter as a knowledgeable peer
- Questions about professional topics encouraged
```

#### X (Twitter)
```
X/Twitter comments should be:
- Concise and punchy (under 100 characters ideal)
- Can be witty or clever when appropriate
- Quick takes that add to the conversation
- Avoid thread-style responses unless requested
- Can use 1 relevant hashtag if natural
- Match the fast-paced, opinion-driven nature of the platform
```

#### TikTok
```
TikTok comments should be:
- Very short and casual (under 100 characters)
- Can be playful, trendy, or use current slang appropriately
- Often question-based or reactive
- Emojis are common and accepted
- Match the young, energetic tone of the platform
- Can reference trends if relevant
```

#### Reddit
```
Reddit comments should be:
- Authentic and community-focused
- Provide genuine value or insight
- Can be longer if adding substantial information
- Absolutely avoid anything that sounds promotional
- Match the specific subreddit's culture and rules
- Questions should be genuine, not leading
- Self-deprecating humor works well
```

#### Forums/Industry Sites
```
Forum comments should be:
- Helpful and informative
- Demonstrate expertise without being condescending
- Can be longer and more detailed
- Answer questions thoroughly
- Reference personal experience when relevant
- Avoid promotional language entirely
- Build reputation as a trusted community member
```

### 8.3 Content Analyzer Prompt

```
[SYSTEM PROMPT]
You are an expert at analyzing social media content and matching it to relevant business profiles.

[USER PROMPT]
Analyze the following content and determine which of these client profiles should engage with it.

CONTENT TO ANALYZE:
{CONTENT}

PLATFORM: {PLATFORM}

CLIENT PROFILES:
{For each client:}
---
Client: {NAME}
Industry: {INDUSTRY}
Keywords: {KEYWORDS}
Target Audience: {TARGET_AUDIENCE}
Description: {DESCRIPTION}
---

For each client, provide:
1. Relevance score (High, Medium, Low, or None)
2. Reason for the score (specific matches found)
3. Engagement angle (how they could naturally engage)

Format your response as:
---
CLIENT: [Name]
RELEVANCE: [High/Medium/Low/None]
REASON: [Why they match]
ANGLE: [How they should engage]
---
```

### 8.4 Industry Sites Suggestion Prompt

```
List 5-10 popular websites, forums, communities, and platforms where professionals in the {INDUSTRY} industry actively discuss topics and engage with each other.

Include:
- Industry-specific forums and communities
- Relevant subreddits
- Facebook or LinkedIn groups (describe, don't link)
- Trade publication websites with comment sections
- Review sites relevant to the industry
- Any other platforms where this industry is active

For each, provide:
- Platform/Site name
- Why it's valuable for engagement
- Typical activity level (very active, moderately active, etc.)

Format as a simple list.
```

---

## 9. User Interface Specifications

### 9.1 Navigation Structure

```
├── Dashboard (Home)
├── Clients
│   ├── All Clients (list)
│   ├── Add New Client
│   └── Client Detail/Edit
├── Engage
│   ├── Comment Generator
│   └── Content Analyzer
├── Competitors
│   ├── All Competitors
│   ├── Sightings Log
│   └── Add Sighting
├── History
│   ├── Generated Comments
│   └── Used Comments
├── Settings
│   ├── AI Providers
│   ├── AI Chat Links
│   ├── Platform Prompts
│   ├── Sighting Notes
│   └── Team/Account
```

### 9.2 Dashboard

Display at-a-glance:
- Total active clients
- Comments generated this week
- Comments used this week
- Recent activity feed
- High-priority competitor sightings
- Quick-action buttons (Generate Comment, Analyze Content)

### 9.3 Key UI Components

#### Client Card
```
┌─────────────────────────────────┐
│ [Industry Icon]                 │
│ CLIENT NAME                     │
│ Industry: Construction          │
│ Keywords: renovation, building  │
│ ────────────────────────────── │
│ [Edit] [View] [Generate Comment]│
└─────────────────────────────────┘
```

#### Comment Option Card
```
┌─────────────────────────────────────────┐
│ OPTION 1 - Conversational               │
│ ─────────────────────────────────────── │
│ "That's a great point about kitchen     │
│ layouts! We've seen open concepts       │
│ really transform how families use       │
│ their space."                           │
│                                         │
│ 142 characters                          │
│ ─────────────────────────────────────── │
│ [📋 Copy]  [✓ Mark as Used]             │
└─────────────────────────────────────────┘
```

#### Competitor Sighting Row
```
┌──────────────────────────────────────────────────────────┐
│ 🔴 HIGH │ CompetitorX │ Facebook: Home Renovation Tips   │
│         │ Last seen: Jan 8, 2026 │ "Posts here weekly"   │
│         │ [View] [Edit] [Log New Sighting]               │
└──────────────────────────────────────────────────────────┘
```

### 9.4 Responsive Design

- Desktop: Full sidebar navigation, multi-column layouts
- Tablet: Collapsible sidebar, adjusted card layouts
- Mobile: Bottom navigation, single-column, touch-friendly buttons

### 9.5 Toast Notifications

Use for:
- "Copied to clipboard!"
- "Comment marked as used"
- "Client saved successfully"
- "API error - trying fallback..."
- "No AI providers configured"

---

## 10. API Endpoints

### 10.1 Supabase Tables API

Standard Supabase REST API for CRUD operations on all tables.

### 10.2 Edge Functions (Serverless)

#### POST /functions/v1/generate-comments

**Request:**
```json
{
  "client_id": "uuid",
  "platform": "instagram",
  "content": "Original post text...",
  "existing_comments": "Comment 1\nComment 2",
  "poster_info": "Posted by @username, 10k followers",
  "hashtags": "#renovation #homedesign",
  "num_options": 3,
  "include_cta": false
}
```

**Response:**
```json
{
  "success": true,
  "options": [
    {
      "index": 0,
      "style": "Conversational",
      "text": "Generated comment...",
      "character_count": 142
    }
  ],
  "provider_used": "groq",
  "generated_comment_id": "uuid"
}
```

#### POST /functions/v1/analyze-content

**Request:**
```json
{
  "content": "Content to analyze...",
  "platform": "linkedin"
}
```

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "client_id": "uuid",
      "client_name": "ABC Construction",
      "relevance": "High",
      "reason": "Industry match: Construction. Keywords: renovation",
      "angle": "Share expertise on project timelines"
    }
  ]
}
```

#### POST /functions/v1/suggest-industry-sites

**Request:**
```json
{
  "industry": "Construction"
}
```

**Response:**
```json
{
  "success": true,
  "sites": [
    {
      "name": "Houzz",
      "description": "Home design and renovation community",
      "activity_level": "Very active"
    }
  ]
}
```

---

## 11. Security Considerations

### 11.1 Authentication

- All routes protected by Supabase Auth
- JWT token validation on each request
- Session timeout after inactivity

### 11.2 Row Level Security (RLS)

Enable RLS on all tables. Example policy:

```sql
-- Users can only see their organization's data
CREATE POLICY "Users can view own org data" ON clients
  FOR SELECT USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );
```

### 11.3 API Key Encryption

- Use Supabase Vault or similar for API key encryption
- Never store plain-text API keys
- Decrypt only in Edge Functions, never in frontend

### 11.4 Rate Limiting

- Implement rate limiting on Edge Functions
- Prevent abuse of AI generation endpoints
- Track usage per organization

---

## 12. Future Considerations

### 12.1 Potential Enhancements

1. **Browser Extension**
   - Generate comments directly on social media sites
   - One-click engagement while browsing

2. **Scheduled Engagement**
   - Queue comments for posting at optimal times
   - Integration with scheduling tools

3. **Analytics Dashboard**
   - Track engagement success
   - A/B test comment styles
   - ROI reporting per client

4. **Team Roles & Permissions**
   - Admin, Manager, Member roles
   - Approval workflows for comments

5. **AI Fine-Tuning**
   - Train on successful comments
   - Per-client model optimization

6. **Multi-Language Support**
   - Generate comments in different languages
   - Translate content for analysis

7. **Direct Platform Integration**
   - Post directly to platforms via API
   - Retrieve engagement metrics

8. **Do Not Engage List**
   - Blacklist specific accounts, groups, or topics
   - Prevent engagement with competitors' posts
   - Avoid controversial or off-brand content

### 12.2 Scalability Notes

- Current design supports 5 users per organization
- Database schema supports multi-organization expansion
- Consider connection pooling for higher user counts
- AI provider fallback system handles increased load

---

## Appendix A: Environment Variables

```
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Encryption (for API keys)
ENCRYPTION_SECRET=your-32-character-secret-key

# Optional: Default AI Provider Keys (for seeding)
DEFAULT_GROQ_KEY=
DEFAULT_OPENROUTER_KEY=
```

---

## Appendix B: Sample Data for Testing

### Sample Client

```json
{
  "name": "ABC Construction",
  "industry": "Construction / Home Renovation",
  "description": "Family-owned construction company specializing in kitchen and bathroom renovations in the tri-state area. 25 years of experience.",
  "voice_prompt": "Sound like a friendly, experienced contractor who genuinely cares about helping homeowners. Use relatable language, share practical tips when relevant, and avoid salesy talk. Occasionally mention 'in my experience' or 'we've found that' to sound authentic.",
  "voice_prompt_with_cta": "Sound like a friendly, experienced contractor. When appropriate, subtly mention that ABC Construction is always happy to chat about renovation projects or offer free consultations, but keep it natural and not pushy.",
  "default_cta": "Feel free to reach out if you ever want to chat about your renovation ideas!",
  "target_audience": "Homeowners aged 35-65 considering renovation projects",
  "keywords": ["renovation", "remodeling", "kitchen", "bathroom", "contractor", "home improvement"]
}
```

### Sample Competitor

```json
{
  "name": "XYZ Renovations",
  "website": "https://xyzrenovations.com",
  "notes": "Main competitor in our area. Very active on social media."
}
```

### Sample Sighting

```json
{
  "location_type": "facebook_group",
  "location_name": "Home Renovation Tips & Ideas",
  "location_url": "https://facebook.com/groups/homerenovationtips",
  "priority": "high",
  "last_seen_date": "2026-01-08",
  "predefined_note": "Posts here weekly",
  "notes": "They share project photos every Monday"
}
```

---

## Appendix C: Modular Development Plan

### Development Philosophy

This project must be built in a modular fashion, with each file completed, tested, and saved before moving to the next. This approach ensures:

- Each component works independently before integration
- Issues are caught early, not after building a massive codebase
- Progress can be saved incrementally
- Features can be swapped or updated without affecting unrelated code
- Testing is manageable and focused

**Rule: Build each file completely, test it, then move on.**

---

### File Structure Overview

```
maximus-engagimus/
├── package.json
├── tailwind.config.js
├── index.html
├── vite.config.js
├── .env.example
├── supabase/
│   ├── schema.sql
│   └── functions/
│       ├── generate-comments/
│       │   └── index.ts
│       ├── analyze-content/
│       │   └── index.ts
│       └── suggest-industry-sites/
│           └── index.ts
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── aiProviders.js
│   │   └── utils.js
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── TextArea.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Toggle.jsx
│   │   │   └── Spinner.jsx
│   │   └── layout/
│   │       ├── Sidebar.jsx
│   │       ├── Header.jsx
│   │       └── Layout.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── clients/
│   │   │   ├── ClientList.jsx
│   │   │   ├── ClientForm.jsx
│   │   │   └── ClientDetail.jsx
│   │   ├── engage/
│   │   │   ├── CommentGenerator.jsx
│   │   │   └── ContentAnalyzer.jsx
│   │   ├── competitors/
│   │   │   ├── CompetitorList.jsx
│   │   │   ├── CompetitorForm.jsx
│   │   │   └── SightingLog.jsx
│   │   ├── history/
│   │   │   ├── GeneratedComments.jsx
│   │   │   └── UsedComments.jsx
│   │   └── settings/
│   │       ├── AIProviders.jsx
│   │       ├── AIChatLinks.jsx
│   │       ├── PlatformPrompts.jsx
│   │       └── SightingNotes.jsx
│   └── hooks/
│       ├── useClients.js
│       ├── useAIProviders.js
│       ├── useCompetitors.js
│       ├── useComments.js
│       └── useToast.js
```

---

### Phase 1: Foundation (Files 1-8)

Complete these files first to establish the core application structure.

| # | File | Purpose | Dependencies |
|---|------|---------|--------------|
| 1 | `package.json` | Project dependencies and scripts | None |
| 2 | `vite.config.js` | Vite bundler configuration | File 1 |
| 3 | `tailwind.config.js` | Tailwind CSS with brand colors | File 1 |
| 4 | `index.html` | HTML entry point | None |
| 5 | `src/index.css` | Global styles and Tailwind imports | File 3 |
| 6 | `supabase/schema.sql` | Complete database schema | None |
| 7 | `src/lib/supabase.js` | Supabase client connection | File 1 |
| 8 | `.env.example` | Environment variable template | None |

**Checkpoint:** After Phase 1, you can run `npm install` and have a configured project.

---

### Phase 2: Authentication & App Shell (Files 9-14)

| # | File | Purpose | Dependencies |
|---|------|---------|--------------|
| 9 | `src/contexts/AuthContext.jsx` | Authentication state management | File 7 |
| 10 | `src/main.jsx` | React entry point | Files 7, 9 |
| 11 | `src/App.jsx` | Main app with routing | Files 9, 10 |
| 12 | `src/pages/Login.jsx` | Login/signup page | Files 9, 11 |
| 13 | `src/components/layout/Sidebar.jsx` | Navigation sidebar | File 11 |
| 14 | `src/components/layout/Header.jsx` | Top header bar | File 11 |
| 15 | `src/components/layout/Layout.jsx` | Page layout wrapper | Files 13, 14 |

**Checkpoint:** After Phase 2, you can log in and see the app shell with navigation.

---

### Phase 3: UI Components (Files 16-26)

Reusable components used throughout the application.

| # | File | Purpose |
|---|------|---------|
| 16 | `src/components/ui/Button.jsx` | Primary, secondary, danger buttons |
| 17 | `src/components/ui/Input.jsx` | Text input with label and error states |
| 18 | `src/components/ui/TextArea.jsx` | Multi-line text input |
| 19 | `src/components/ui/Card.jsx` | Content container with optional header |
| 20 | `src/components/ui/Modal.jsx` | Dialog/popup component |
| 21 | `src/components/ui/Toast.jsx` | Notification messages |
| 22 | `src/hooks/useToast.js` | Toast state management hook |
| 23 | `src/components/ui/Dropdown.jsx` | Select dropdown component |
| 24 | `src/components/ui/Badge.jsx` | Status/tag badges |
| 25 | `src/components/ui/Toggle.jsx` | On/off switch |
| 26 | `src/components/ui/Spinner.jsx` | Loading indicator |

**Checkpoint:** After Phase 3, all UI building blocks are ready.

---

### Phase 4: Utility Functions (Files 27-29)

| # | File | Purpose |
|---|------|---------|
| 27 | `src/lib/utils.js` | Helper functions (formatDate, copyToClipboard, etc.) |
| 28 | `src/lib/aiProviders.js` | AI provider API calls and fallback logic |
| 29 | `src/lib/prompts.js` | Prompt templates for all platforms |

**Checkpoint:** After Phase 4, core utilities are ready for features.

---

### Phase 5: Client Management (Files 30-34)

| # | File | Purpose |
|---|------|---------|
| 30 | `src/hooks/useClients.js` | Client data fetching and mutations |
| 31 | `src/pages/clients/ClientList.jsx` | List all clients |
| 32 | `src/pages/clients/ClientForm.jsx` | Add/edit client form |
| 33 | `src/pages/clients/ClientDetail.jsx` | View client details |
| 34 | Update `src/App.jsx` | Add client routes |

**Checkpoint:** After Phase 5, you can create, view, edit, and delete clients.

---

### Phase 6: AI Provider Management (Files 35-38)

| # | File | Purpose |
|---|------|---------|
| 35 | `src/hooks/useAIProviders.js` | Provider data fetching and mutations |
| 36 | `src/pages/settings/AIProviders.jsx` | Manage AI providers |
| 37 | `src/pages/settings/AIChatLinks.jsx` | Manage chat interface links |
| 38 | Update `src/App.jsx` | Add settings routes |

**Checkpoint:** After Phase 6, you can configure AI providers.

---

### Phase 7: Comment Generator (Files 39-42)

| # | File | Purpose |
|---|------|---------|
| 39 | `src/hooks/useComments.js` | Comment generation and history |
| 40 | `src/pages/engage/CommentGenerator.jsx` | Main comment generation interface |
| 41 | `src/components/CommentOptionCard.jsx` | Display generated comment option |
| 42 | Update `src/App.jsx` | Add engage routes |

**Checkpoint:** After Phase 7, you can generate comments for clients.

---

### Phase 8: Content Analyzer (Files 43-44)

| # | File | Purpose |
|---|------|---------|
| 43 | `src/pages/engage/ContentAnalyzer.jsx` | Analyze content and match clients |
| 44 | `src/components/ClientRelevanceCard.jsx` | Display client match results |

**Checkpoint:** After Phase 8, you can analyze content and see which clients should engage.

---

### Phase 9: Competitor Tracking (Files 45-50)

| # | File | Purpose |
|---|------|---------|
| 45 | `src/hooks/useCompetitors.js` | Competitor and sighting data |
| 46 | `src/pages/competitors/CompetitorList.jsx` | List competitors by client |
| 47 | `src/pages/competitors/CompetitorForm.jsx` | Add/edit competitor |
| 48 | `src/pages/competitors/SightingLog.jsx` | View and add sightings |
| 49 | `src/pages/settings/SightingNotes.jsx` | Manage predefined notes |
| 50 | Update `src/App.jsx` | Add competitor routes |

**Checkpoint:** After Phase 9, full competitor tracking is functional.

---

### Phase 10: History & Dashboard (Files 51-55)

| # | File | Purpose |
|---|------|---------|
| 51 | `src/pages/history/GeneratedComments.jsx` | View all generated comments |
| 52 | `src/pages/history/UsedComments.jsx` | View comments marked as used |
| 53 | `src/pages/Dashboard.jsx` | Main dashboard with stats |
| 54 | `src/pages/settings/PlatformPrompts.jsx` | Customize platform prompts |
| 55 | Update `src/App.jsx` | Add remaining routes |

**Checkpoint:** After Phase 10, the full application is functional.

---

### Phase 11: Supabase Edge Functions (Files 56-58)

| # | File | Purpose |
|---|------|---------|
| 56 | `supabase/functions/generate-comments/index.ts` | Server-side comment generation |
| 57 | `supabase/functions/analyze-content/index.ts` | Server-side content analysis |
| 58 | `supabase/functions/suggest-industry-sites/index.ts` | Industry site suggestions |

**Checkpoint:** After Phase 11, secure server-side AI calls are implemented.

---

### Phase 12: Final Polish (Files 59-60)

| # | File | Purpose |
|---|------|---------|
| 59 | `README.md` | Project documentation |
| 60 | Final testing and bug fixes | All features working together |

**Checkpoint:** Project complete and ready for deployment.

---

### Development Checklist

#### Phase 1: Foundation
- [ ] File 1: `package.json`
- [ ] File 2: `vite.config.js`
- [ ] File 3: `tailwind.config.js`
- [ ] File 4: `index.html`
- [ ] File 5: `src/index.css`
- [ ] File 6: `supabase/schema.sql`
- [ ] File 7: `src/lib/supabase.js`
- [ ] File 8: `.env.example`

#### Phase 2: Authentication & App Shell
- [ ] File 9: `src/contexts/AuthContext.jsx`
- [ ] File 10: `src/main.jsx`
- [ ] File 11: `src/App.jsx`
- [ ] File 12: `src/pages/Login.jsx`
- [ ] File 13: `src/components/layout/Sidebar.jsx`
- [ ] File 14: `src/components/layout/Header.jsx`
- [ ] File 15: `src/components/layout/Layout.jsx`

#### Phase 3: UI Components
- [ ] File 16: `src/components/ui/Button.jsx`
- [ ] File 17: `src/components/ui/Input.jsx`
- [ ] File 18: `src/components/ui/TextArea.jsx`
- [ ] File 19: `src/components/ui/Card.jsx`
- [ ] File 20: `src/components/ui/Modal.jsx`
- [ ] File 21: `src/components/ui/Toast.jsx`
- [ ] File 22: `src/hooks/useToast.js`
- [ ] File 23: `src/components/ui/Dropdown.jsx`
- [ ] File 24: `src/components/ui/Badge.jsx`
- [ ] File 25: `src/components/ui/Toggle.jsx`
- [ ] File 26: `src/components/ui/Spinner.jsx`

#### Phase 4: Utility Functions
- [ ] File 27: `src/lib/utils.js`
- [ ] File 28: `src/lib/aiProviders.js`
- [ ] File 29: `src/lib/prompts.js`

#### Phase 5: Client Management
- [ ] File 30: `src/hooks/useClients.js`
- [ ] File 31: `src/pages/clients/ClientList.jsx`
- [ ] File 32: `src/pages/clients/ClientForm.jsx`
- [ ] File 33: `src/pages/clients/ClientDetail.jsx`
- [ ] File 34: Update `src/App.jsx` with client routes

#### Phase 6: AI Provider Management
- [ ] File 35: `src/hooks/useAIProviders.js`
- [ ] File 36: `src/pages/settings/AIProviders.jsx`
- [ ] File 37: `src/pages/settings/AIChatLinks.jsx`
- [ ] File 38: Update `src/App.jsx` with settings routes

#### Phase 7: Comment Generator
- [ ] File 39: `src/hooks/useComments.js`
- [ ] File 40: `src/pages/engage/CommentGenerator.jsx`
- [ ] File 41: `src/components/CommentOptionCard.jsx`
- [ ] File 42: Update `src/App.jsx` with engage routes

#### Phase 8: Content Analyzer
- [ ] File 43: `src/pages/engage/ContentAnalyzer.jsx`
- [ ] File 44: `src/components/ClientRelevanceCard.jsx`

#### Phase 9: Competitor Tracking
- [ ] File 45: `src/hooks/useCompetitors.js`
- [ ] File 46: `src/pages/competitors/CompetitorList.jsx`
- [ ] File 47: `src/pages/competitors/CompetitorForm.jsx`
- [ ] File 48: `src/pages/competitors/SightingLog.jsx`
- [ ] File 49: `src/pages/settings/SightingNotes.jsx`
- [ ] File 50: Update `src/App.jsx` with competitor routes

#### Phase 10: History & Dashboard
- [ ] File 51: `src/pages/history/GeneratedComments.jsx`
- [ ] File 52: `src/pages/history/UsedComments.jsx`
- [ ] File 53: `src/pages/Dashboard.jsx`
- [ ] File 54: `src/pages/settings/PlatformPrompts.jsx`
- [ ] File 55: Update `src/App.jsx` with remaining routes

#### Phase 11: Supabase Edge Functions
- [ ] File 56: `supabase/functions/generate-comments/index.ts`
- [ ] File 57: `supabase/functions/analyze-content/index.ts`
- [ ] File 58: `supabase/functions/suggest-industry-sites/index.ts`

#### Phase 12: Final Polish
- [ ] File 59: `README.md`
- [ ] File 60: Final testing and bug fixes

---

### Notes for Developers

1. **Test after each file:** Don't move to the next file until the current one works.

2. **Save incrementally:** Each file should be saved and committed before proceeding.

3. **Dependencies matter:** Follow the file order - later files depend on earlier ones.

4. **Update App.jsx progressively:** Routes are added as features are completed, not all at once.

5. **Edge Functions are optional initially:** The app can work with client-side AI calls first; Edge Functions add security for production.

6. **Use the checkboxes:** Mark each file complete as you finish it to track progress.

---

**End of Specification Document**

*This document should be kept up-to-date as the project evolves. Any changes to features, database schema, or requirements should be reflected here.*
