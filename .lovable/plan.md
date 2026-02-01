

# Tenant-Configurable AI Chatbot System

## Overview

Transform your webinar platform from a user-based to a multi-tenant architecture, then build a tenant-configurable AI chatbot that allows your customers to use their own API keys and customize their chatbot behavior per webinar.

---

## Phase 1: Multi-Tenant Foundation

### 1.1 Database Structure
Create the core multi-tenant tables:

- **`tenants`** - Workspaces for each customer
  - Name, slug (for custom domains later)
  - License type: `standard` | `white_label`
  - Parent tenant ID (for white-label resellers)
  - Custom branding fields (logo URL, colors)
  - Created/updated timestamps

- **`tenant_memberships`** - Link users to tenants with roles
  - User ID, Tenant ID
  - Role: `owner` | `admin` | `member`
  - Auto-create tenant when user signs up

- **`profiles` migration** - Add `default_tenant_id` for quick access

### 1.2 Database Security
- Secure RLS policies so tenants can only see their own data
- Helper function: `get_user_tenant_id()` for RLS policies
- Helper function: `has_tenant_role()` for permission checks

### 1.3 Migrate Existing Tables
Add `tenant_id` to existing tables:
- `webinars` (currently uses `user_id`)
- `clips` (currently uses `user_id`)

Data migration: Create tenant for each existing user, link their data

---

## Phase 2: Tenant API Key Management

### 2.1 Secure API Key Storage
Create **`tenant_api_keys`** table with:

**Voice Dictation (Optional)**
- OpenAI Whisper key (encrypted) - for speech-to-text in live chat

**AI Chatbot (Required for chatbot feature)**
- OpenAI key (encrypted) - for GPT-4o-mini responses
- Anthropic key (encrypted) - for Claude responses
- Preferred provider setting

**Security**
- All keys encrypted using AES-256-GCM
- Encryption secret stored as backend secret
- Keys verified with provider before saving

### 2.2 API Key Management Edge Function
New function: `manage-api-key`
- **Save key**: Validate → Encrypt → Store
- **Remove key**: Clear encrypted value
- **Get status**: Return which keys are configured
- **Set provider**: Choose OpenAI or Anthropic for chatbot

---

## Phase 3: Chatbot Configuration

### 3.1 Chatbot Config Table
Create **`webinar_chatbot_config`** with:

**Bot Identity**
- Bot name (e.g., "Alex", "Support")
- Personality style: Professional / Friendly / Energetic / Custom
- Custom personality text (when style is Custom)

**Knowledge Base**
- Webinar description (what the training covers)
- Transcript (partial or full - up to 10,000 chars)

**Response Rules**
- Response length: Short (1-2 lines) / Medium / Detailed
- Encourage watching toggle
- Redirect off-topic toggle
- Allow links toggle

**Price Handling**
- Reveal price toggle
- Price value (e.g., "$997")
- Custom response when price not revealed

**Advanced Settings**
- Max response tokens (default: 150)
- Temperature (default: 0.7)
- Enabled/disabled toggle

### 3.2 FAQ Pairs Table
Create **`webinar_chatbot_faqs`** with:
- Question and answer text
- Sort order (for priority matching)
- Enabled/disabled toggle

---

## Phase 4: AI Chat Edge Function

### 4.1 New `webinar-chat` Function
The core chatbot logic:

1. **Receive** viewer message + webinar ID
2. **Fetch** webinar's chatbot config
3. **Fetch** tenant's encrypted API key
4. **Decrypt** key using encryption secret
5. **Fetch** FAQ pairs for the webinar
6. **Build** dynamic system prompt including:
   - Bot personality
   - Webinar description
   - Response rules
   - FAQ pairs
   - Truncated transcript
7. **Call** OpenAI or Anthropic based on preference
8. **Return** AI response

### 4.2 Error Handling
- Graceful fallback messages if AI fails
- Rate limit handling
- Missing config/key handling

---

## Phase 5: Settings UI - API Keys

### 5.1 New API Keys Settings Page
Add "API Keys" tab to Settings with sections:

**Voice Dictation Section**
- OpenAI API key input (for Whisper)
- Test button to verify key
- Save/Remove buttons
- Status indicator (✅ Connected / Not configured)
- Cost estimate (~$0.006/min)
- Warning: "Voice dictation disabled if not set"

**AI Chatbot Section**
- Provider toggle (OpenAI vs Anthropic)
- OpenAI API key input
- Anthropic API key input
- Each with Test/Save/Remove buttons
- Independent status indicators
- Cost estimates for each provider

**Security Info**
- Encryption notice
- Privacy assurance

---

## Phase 6: Chatbot Configuration UI

### 6.1 New "Chatbot" Tab in Webinar Editor
Add new tab alongside existing tabs (Details, Video, CTA, Registration):

**Bot Personality Section**
- Bot name input
- Personality style radio buttons (4 options)
- Custom personality textarea (when Custom selected)
- Response length toggle (Short/Medium/Detailed)

**Knowledge Base Section**
- Webinar description textarea with character counter
- Transcript upload area (drag & drop .txt or paste)
- Character count and guidance

**FAQ Pairs Section**
- List of existing FAQs with Edit/Delete
- Add FAQ button opens modal
- Drag-and-drop reordering

**Response Rules Section**
- Checkbox toggles for each rule
- Price handling fields

**Advanced Settings (Collapsed by default)**
- Max tokens slider
- Temperature slider

### 6.2 Test Chat Panel
Live preview panel:
- Send test messages as a viewer would
- See how the chatbot responds
- Test before going live

---

## Phase 7: Integration with Live Chat

### 7.1 Update Existing Chat Flow
Modify the webinar viewer chat to:
- Check if AI chatbot is enabled for the webinar
- If enabled, call `webinar-chat` function instead of current webhook
- Fall back to human mode if chatbot fails

### 7.2 Hybrid Mode
Support for:
- AI-only mode (chatbot handles everything)
- Human takeover (operator can take over any session)
- Return to AI (after human is done)

---

## Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Encryption | AES-256-GCM in Edge Function | Secure, industry standard, works with Deno |
| AI Models | GPT-4o-mini & Claude Haiku | Fast, affordable for chat |
| Multi-tenant approach | Tenant per customer | Enables teams & white-label later |
| API key storage | Separate from tenant table | Cleaner separation, easier auditing |

---

## Implementation Order

1. **Multi-tenant foundation** (database + RLS)
2. **API key management** (table + edge function)
3. **API Keys settings page** (UI)
4. **Chatbot config tables** (database)
5. **Webinar chatbot edge function** (AI logic)
6. **Chatbot config UI** (webinar editor tab)
7. **Test panel** (preview feature)
8. **Integration** (connect to live chat)

---

## What You'll Get

✅ Each customer manages their own AI API keys securely
✅ Per-webinar chatbot customization (personality, FAQs, rules)
✅ Choice between OpenAI and Anthropic providers
✅ Test chat panel before going live
✅ Multi-tenant foundation ready for teams and white-label
✅ No N8N dependency - everything runs in your platform

