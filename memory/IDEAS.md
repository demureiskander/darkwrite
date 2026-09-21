# Deferred ideas

## AI writing assistant

**Status:** Deferred by the product owner on 2026-09-22. Do not begin
implementation until explicitly requested.

**Goal:** A bring-your-own-key writing assistant that understands Darkwrite's
editor structure and can work with a selection or the current document.

**First release:**

- OpenAI and DeepSeek through a shared provider adapter where compatible.
- User-owned API keys stored in OS-protected storage, excluded from settings
  export and backups.
- Explicit indication of whether a selection or whole document is sent to an
  external provider.
- Streaming answer preview with Replace, Insert below, and Cancel actions.
- Preset commands: shorten, expand, make formal, improve style, translate,
  and continue writing.
- Structured editor output: validate a constrained block/action schema for
  headings, lists, quotes, callouts, code blocks, and tables. Never apply raw
  model HTML directly to a document.

**Later release:**

- Dedicated Gemini adapter. Its OpenAI compatibility layer is useful for
  basic requests but does not expose all Gemini-specific capabilities.
- More structured transformation commands and configurable user prompts.

**Constraints:** Keep the feature optional, local-first by default, and clear
about what leaves the device. API costs and provider accounts remain the
user's responsibility.
