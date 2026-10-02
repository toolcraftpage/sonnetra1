import { configurationError } from "@/lib/errors";
import { ProviderRegistry, type TranscriptProvider } from "@/lib/providers/transcript";
import { SupadataTranscriptProvider } from "@/lib/providers/supadata";

export function createProviderRegistry(
  providers: readonly TranscriptProvider[] = [new SupadataTranscriptProvider()],
): ProviderRegistry {
  return new ProviderRegistry(providers);
}

export function requireProvider(
  registry: ProviderRegistry,
  providerId: string,
): TranscriptProvider {
  const provider = registry.get(providerId);
  if (!provider) {
    throw configurationError(`Transcript provider '${providerId}' is not configured.`);
  }
  return provider;
}