import { useState, useEffect } from 'react';
import { extractorRegistry } from '@/lib/extractors/registry';
import { ContentMetadata } from '@/types/metadata';

interface UseMetadataExtractionOptions {
  useCache?: boolean;
  autoExtract?: boolean;
}

export function useMetadataExtraction(
  url: string | undefined,
  options: UseMetadataExtractionOptions = {}
) {
  const { useCache = true, autoExtract = true } = options;
  
  const [metadata, setMetadata] = useState<ContentMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extract = async (forceRefresh = false) => {
    if (!url) {
      setError('No URL provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await (useCache && !forceRefresh
        ? extractorRegistry.extractWithCache(url)
        : extractorRegistry.extract(url));

      setMetadata(result.metadata);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract metadata';
      setError(errorMessage);
      console.error('Metadata extraction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoExtract && url) {
      extract();
    }
  }, [url, autoExtract]);

  return {
    metadata,
    isLoading,
    error,
    refetch: () => extract(true),
  };
}