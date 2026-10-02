# Provider Architecture

The application depends on a `TranscriptProvider` interface, not on a vendor-specific response shape. The Supadata adapter is registered for the worker and maps provider data into Sonnetra's internal language, metadata, and ordered segment model. Normalization rejects empty, malformed, out-of-order, inconsistent-language, and invalid-timing results.

The adapter calls `GET https://api.supadata.ai/v1/transcript` over HTTPS with the canonical YouTube URL, `mode=native`, timestamped chunks, and an optional `lang`. It authenticates with the server-only `SUPADATA_API_KEY` in `x-api-key`, uses an abort timeout, and makes at most two jittered retries for transient network, timeout, rate-limit, and server failures. Authentication, rate-limit, unavailable transcript, empty transcript, malformed response, timeout, and provider outage errors remain distinct and do not expose raw provider bodies.

No real provider response has been verified for the current Phase 8C run because `SUPADATA_API_KEY` is missing. YouTube-native and additional transcription providers can be added behind the same interface. The UI only receives normalized Sonnetra DTOs and never claims completion from an HTTP status alone.
