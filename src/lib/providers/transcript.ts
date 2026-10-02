import type {
  TranscriptLanguage,
  TranscriptMetadata,
  TranscriptSegment,
} from "@/types/domain";

export type TranscriptProviderCapabilities = {
  languages: boolean;
  timestamps: boolean;
  metadata: boolean;
};

export type TranscriptRequest = {
  videoId: string;
  sourceUrl: string;
  languageCode?: string;
  requestId?: string;
};

export type TranscriptResult = {
  language: TranscriptLanguage;
  metadata: TranscriptMetadata;
  segments: readonly TranscriptSegment[];
  providerReference?: string;
};

export interface TranscriptProvider {
  readonly id: string;
  readonly capabilities: TranscriptProviderCapabilities;
  listLanguages(request: Pick<TranscriptRequest, "videoId" | "sourceUrl" | "requestId">): Promise<readonly TranscriptLanguage[]>;
  retrieve(request: TranscriptRequest): Promise<TranscriptResult>;
}

export class ProviderRegistry {
  private readonly providers: readonly TranscriptProvider[];

  constructor(providers: readonly TranscriptProvider[] = []) {
    this.providers = providers;
  }

  get(providerId: string): TranscriptProvider | undefined {
    return this.providers.find((provider) => provider.id === providerId);
  }

  list(): readonly TranscriptProvider[] {
    return this.providers;
  }
}