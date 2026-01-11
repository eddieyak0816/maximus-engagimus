/**
 * useAnalyzer Hook
 * 
 * Custom hook for analyzing content and matching to relevant clients.
 */

import { useState, useCallback } from 'react';
import { generateCompletion, parseCommentOptions, AIError } from '../lib/ai';
import { buildContentAnalysisPrompt } from '../lib/prompts';
import { analyzeContentForClients } from '../lib/supabase';
import { toast } from '../components/ui/Toast';

/**
 * Main hook for content analysis
 */
export function useAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [analyzedContent, setAnalyzedContent] = useState('');

  /**
   * Analyze content using database keyword matching
   * This is a fast, local analysis based on client keywords
   */
  const analyzeLocal = useCallback(async (content, clients) => {
    if (!content?.trim()) {
      toast.error('Please enter content to analyze');
      return { success: false };
    }

    if (!clients || clients.length === 0) {
      toast.error('No active clients to match against');
      return { success: false };
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setAnalyzedContent(content);

    try {
      // Use the database function for keyword matching
      const matches = await analyzeContentForClients(content);

      // Filter and sort results
      const relevantMatches = matches
        .filter(m => m.relevance_score > 0)
        .map(m => {
          // Find the full client data
          const client = clients.find(c => c.id === m.client_id);
          
          // Determine relevance level
          let relevance = 'low';
          if (m.relevance_score >= 30) relevance = 'high';
          else if (m.relevance_score >= 20) relevance = 'medium';

          return {
            client_id: m.client_id,
            client_name: m.client_name,
            client: client,
            industry: m.industry,
            relevance,
            relevance_score: m.relevance_score,
            matched_keywords: m.matched_keywords || [],
            reasons: buildReasons(m, client),
            angle: suggestAngle(m, client, content),
          };
        })
        .sort((a, b) => b.relevance_score - a.relevance_score);

      setResults(relevantMatches);

      if (relevantMatches.length === 0) {
        toast.info('No matching clients found for this content');
      } else {
        toast.success(`Found ${relevantMatches.length} matching client(s)`);
      }

      return { success: true, results: relevantMatches };

    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err.message || 'Failed to analyze content';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };

    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Analyze content using AI for deeper analysis
   * This provides more nuanced matching and engagement suggestions
   */
  const analyzeWithAI = useCallback(async (content, clients) => {
    if (!content?.trim()) {
      toast.error('Please enter content to analyze');
      return { success: false };
    }

    if (!clients || clients.length === 0) {
      toast.error('No active clients to match against');
      return { success: false };
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setAnalyzedContent(content);

    try {
      // Build the analysis prompt
      const prompt = buildContentAnalysisPrompt(content, clients);

      // Call AI
      const result = await generateCompletion(
        [{ role: 'user', content: prompt }],
        { temperature: 0.5, maxTokens: 2000 }
      );

      // Parse the response
      const parsed = parseAIAnalysisResponse(result.content, clients);

      if (parsed.length === 0) {
        // Fall back to local analysis
        toast.info('AI analysis found no matches, trying keyword matching...');
        return analyzeLocal(content, clients);
      }

      setResults(parsed);
      toast.success(`AI found ${parsed.length} relevant client(s)`);

      return { success: true, results: parsed };

    } catch (err) {
      console.error('AI Analysis error:', err);
      
      // If AI fails, fall back to local analysis
      if (err instanceof AIError) {
        toast.warning('AI unavailable, using keyword matching instead');
        return analyzeLocal(content, clients);
      }

      const errorMessage = err.message || 'Failed to analyze content';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };

    } finally {
      setLoading(false);
    }
  }, [analyzeLocal]);

  /**
   * Clear results
   */
  const clear = useCallback(() => {
    setResults([]);
    setError(null);
    setAnalyzedContent('');
  }, []);

  return {
    loading,
    error,
    results,
    analyzedContent,
    analyzeLocal,
    analyzeWithAI,
    clear,
  };
}

/**
 * Build human-readable reasons for a match
 */
function buildReasons(match, client) {
  const reasons = [];

  if (match.matched_keywords && match.matched_keywords.length > 0) {
    reasons.push(`Keyword match: ${match.matched_keywords.join(', ')}`);
  }

  if (client?.industry) {
    reasons.push(`Industry: ${client.industry}`);
  }

  if (client?.target_audience) {
    reasons.push(`Target audience alignment`);
  }

  return reasons;
}

/**
 * Suggest an engagement angle based on the match
 */
function suggestAngle(match, client, content) {
  const keywords = match.matched_keywords || [];
  
  if (keywords.length > 0) {
    return `Engage around ${keywords[0]} expertise - share relevant insights or ask thoughtful questions`;
  }

  if (client?.industry) {
    return `Connect through shared ${client.industry} industry experience`;
  }

  return 'Find common ground and add value to the conversation';
}

/**
 * Parse AI analysis response
 */
function parseAIAnalysisResponse(content, clients) {
  try {
    // Try to parse JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.map(item => {
        // Find the full client data
        const client = clients.find(
          c => c.name.toLowerCase() === item.client_name?.toLowerCase() ||
               c.id === item.client_id
        );

        return {
          client_id: client?.id || item.client_id,
          client_name: item.client_name || client?.name,
          client: client,
          industry: client?.industry || item.industry,
          relevance: item.relevance || 'medium',
          relevance_score: getScoreFromRelevance(item.relevance),
          matched_keywords: [],
          reasons: item.reasons || [],
          angle: item.angle || '',
        };
      }).filter(r => r.client); // Only return matches with valid clients
    }
  } catch (err) {
    console.error('Failed to parse AI response:', err);
  }

  return [];
}

/**
 * Convert relevance string to numeric score
 */
function getScoreFromRelevance(relevance) {
  switch (relevance?.toLowerCase()) {
    case 'high': return 50;
    case 'medium': return 30;
    case 'low': return 15;
    default: return 20;
  }
}

export default useAnalyzer;
