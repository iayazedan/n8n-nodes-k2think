# n8n-nodes-k2think

An [n8n](https://n8n.io) community node for **K2 Think V2** (MBZUAI-IFM) — the reasoning model served from the OpenAI-compatible gateway at `api.k2think.ai`.

This is an **action node**: drop it into any workflow to send a prompt to K2 Think and get the answer back. It handles the gateway's quirks for you:

- uses `max_completion_tokens` (not `max_tokens`)
- non-streaming
- automatically strips the `<think>…</think>` reasoning preamble (toggleable)
- adds token headroom so the reasoning never truncates the answer

> **Note on the AI Agent node:** n8n's "Chat Model" sub-nodes (the kind that plug into the AI Agent / Chains) are built on LangChain, which requires a runtime dependency and therefore cannot be verified for n8n Cloud. This package is a dependency-free action node so it *can* be verified and installed on Cloud. To use K2 Think as an Agent model on Cloud today, use the built-in **OpenAI Chat Model** node with a credential whose Base URL is `https://api.k2think.ai/v1`.

## Installation

### n8n Cloud / Self-hosted UI
Settings → Community Nodes → Install → `n8n-nodes-k2think` (available after npm publish + n8n verification).

### Self-hosted (manual)
```bash
cd ~/.n8n/nodes
npm install n8n-nodes-k2think
```

## Credentials

Create a **K2 Think API** credential:
- **API Key** — your `api.k2think.ai` key
- **Base URL** — defaults to `https://api.k2think.ai/v1`

## Usage

Add the **K2 Think** node, pick the credential, set:
- **Model** — `MBZUAI-IFM/K2-Think-v2`
- **Prompt** — your user message
- **System Prompt** (optional)
- **Options** — temperature, max completion tokens, reasoning headroom, strip `<think>`, output field, include raw

## License

MIT
