# AI Queue Runbook

This runbook explains how to enable and operate the background AI job queue.

## Overview
- Queue engine: BullMQ
- Redis required when the queue is enabled
- Queue is **disabled by default** and all AI calls run inline

## Environment Variables
Set these in `empowerai-backend/.env`:

```env
ENABLE_AI_QUEUE=true
ENABLE_AI_QUEUE_WORKER=true
REDIS_URL=redis://localhost:6379
```

## Health Check
- Endpoint: `GET /api/queue/health`
- Returns queue status and job counts if enabled

## Operational Notes
- If `ENABLE_AI_QUEUE=true` but `ENABLE_AI_QUEUE_WORKER=false`, requests run inline.
- On low-resource or early testing environments, keep the queue disabled.
- Default retries: 2 attempts with exponential backoff (1s).

## Common Issues
- Queue disabled: check `ENABLE_AI_QUEUE` and `REDIS_URL`.
- Worker disabled: check `ENABLE_AI_QUEUE_WORKER`.
- Redis connection errors: validate `REDIS_URL` and Redis availability.
