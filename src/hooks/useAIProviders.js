/**
 * useAIProviders Hook
 * 
 * Custom hook for managing AI provider configurations.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAIProviders,
  getDefaultAIProvider,
  createAIProvider,
  updateAIProvider,
  deleteAIProvider,
  setDefaultAIProvider,
  getAIChatLinks,
  getPlatformPrompts,
  upsertPlatformPrompt,
} from '../lib/supabase';
import { testProvider, DEFAULT_PROVIDERS } from '../lib/ai';
import { toast } from '../components/ui/Toast';

/**
 * Hook for managing AI providers
 */
export function useAIProviders(options = {}) {
  const { autoFetch = true } = options;

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAIProviders();
      setProviders(data || []);
    } catch (err) {
      console.error('Error fetching AI providers:', err);
      setError(err.message);
      toast.error('Failed to load AI providers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchProviders();
    }
  }, [autoFetch, fetchProviders]);

  // Create a new provider
  const create = async (providerData) => {
    try {
      const newProvider = await createAIProvider(providerData);
      setProviders(prev => [...prev, newProvider]);
      toast.success('AI provider added successfully');
      return { data: newProvider, error: null };
    } catch (err) {
      console.error('Error creating AI provider:', err);
      toast.error('Failed to add AI provider');
      return { data: null, error: err };
    }
  };

  // Update a provider
  const update = async (providerId, updates) => {
    try {
      const updatedProvider = await updateAIProvider(providerId, updates);
      setProviders(prev =>
        prev.map(p => (p.id === providerId ? { ...p, ...updatedProvider } : p))
      );
      toast.success('AI provider updated successfully');
      return { data: updatedProvider, error: null };
    } catch (err) {
      console.error('Error updating AI provider:', err);
      toast.error('Failed to update AI provider');
      return { data: null, error: err };
    }
  };

  // Delete a provider
  const remove = async (providerId) => {
    try {
      await deleteAIProvider(providerId);
      setProviders(prev => prev.filter(p => p.id !== providerId));
      toast.success('AI provider removed');
      return { error: null };
    } catch (err) {
      console.error('Error deleting AI provider:', err);
      toast.error('Failed to remove AI provider');
      return { error: err };
    }
  };

  // Set as default
  const setDefault = async (providerId) => {
    try {
      await setDefaultAIProvider(providerId);
      setProviders(prev =>
        prev.map(p => ({
          ...p,
          is_default: p.id === providerId,
        }))
      );
      toast.success('Default provider updated');
      return { error: null };
    } catch (err) {
      console.error('Error setting default provider:', err);
      toast.error('Failed to set default provider');
      return { error: err };
    }
  };

  // Toggle active status
  const toggleActive = async (providerId, isActive) => {
    return update(providerId, { is_active: isActive });
  };

  // Test provider connection
  const test = async (provider) => {
    toast.info(`Testing connection to ${provider.provider_name}...`);
    const result = await testProvider(provider);
    if (result.success) {
      toast.success(`${provider.provider_name}: Connection successful!`);
    } else {
      toast.error(`${provider.provider_name}: ${result.message}`);
    }
    return result;
  };

  // Update fallback order
  const updateFallbackOrder = async (orderedIds) => {
    try {
      // Update each provider's fallback_order based on position
      const updates = orderedIds.map((id, index) =>
        updateAIProvider(id, { fallback_order: index + 1 })
      );
      await Promise.all(updates);
      
      // Update local state
      setProviders(prev => {
        const providerMap = new Map(prev.map(p => [p.id, p]));
        return orderedIds.map((id, index) => ({
          ...providerMap.get(id),
          fallback_order: index + 1,
        }));
      });
      
      toast.success('Fallback order updated');
      return { error: null };
    } catch (err) {
      console.error('Error updating fallback order:', err);
      toast.error('Failed to update fallback order');
      return { error: err };
    }
  };

  // Seed default providers (for initial setup)
  const seedDefaults = async () => {
    try {
      const existingNames = providers.map(p => p.provider_name);
      const toCreate = DEFAULT_PROVIDERS.filter(
        p => !existingNames.includes(p.provider_name)
      );

      if (toCreate.length === 0) {
        toast.info('All default providers already exist');
        return;
      }

      for (const provider of toCreate) {
        await createAIProvider({
          ...provider,
          is_active: false, // Start inactive until API key is added
          fallback_order: providers.length + toCreate.indexOf(provider) + 1,
        });
      }

      await fetchProviders();
      toast.success(`Added ${toCreate.length} default providers`);
    } catch (err) {
      console.error('Error seeding defaults:', err);
      toast.error('Failed to add default providers');
    }
  };

  // Get the current default provider
  const defaultProvider = providers.find(p => p.is_default) || providers[0];

  // Check if any provider is configured
  const hasConfiguredProvider = providers.some(
    p => p.is_active && p.api_key_encrypted
  );

  return {
    providers,
    loading,
    error,
    defaultProvider,
    hasConfiguredProvider,
    refetch: fetchProviders,
    create,
    update,
    remove,
    setDefault,
    toggleActive,
    test,
    updateFallbackOrder,
    seedDefaults,
  };
}

/**
 * Hook for AI chat links (No API mode)
 */
export function useAIChatLinks() {
  const [chatLinks, setChatLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getAIChatLinks();
        setChatLinks(data || []);
      } catch (err) {
        console.error('Error fetching chat links:', err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { chatLinks, loading };
}

/**
 * Hook for platform prompts
 */
export function usePlatformPrompts() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrompts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPlatformPrompts();
      setPrompts(data || []);
    } catch (err) {
      console.error('Error fetching platform prompts:', err);
      toast.error('Failed to load platform prompts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const updatePrompt = async (platform, promptData) => {
    try {
      const updated = await upsertPlatformPrompt(platform, promptData);
      setPrompts(prev => {
        const existing = prev.findIndex(
          p => p.platform === platform && !p.is_system
        );
        if (existing >= 0) {
          const newPrompts = [...prev];
          newPrompts[existing] = updated;
          return newPrompts;
        }
        return [...prev, updated];
      });
      toast.success('Platform prompt updated');
      return { data: updated, error: null };
    } catch (err) {
      console.error('Error updating platform prompt:', err);
      toast.error('Failed to update platform prompt');
      return { data: null, error: err };
    }
  };

  // Get prompt for a specific platform (org override or system default)
  const getPromptForPlatform = useCallback(
    (platform) => {
      const orgPrompt = prompts.find(
        p => p.platform === platform && !p.is_system
      );
      if (orgPrompt) return orgPrompt;

      const systemPrompt = prompts.find(
        p => p.platform === platform && p.is_system
      );
      return systemPrompt;
    },
    [prompts]
  );

  return {
    prompts,
    loading,
    refetch: fetchPrompts,
    updatePrompt,
    getPromptForPlatform,
  };
}

export default useAIProviders;
