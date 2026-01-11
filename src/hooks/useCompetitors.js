/**
 * useCompetitors Hook
 * 
 * Custom hook for managing competitors and their sightings.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCompetitors,
  createCompetitor,
  updateCompetitor,
  deleteCompetitor,
  getAllSightings,
  addCompetitorSighting,
  updateCompetitorSighting,
  deleteCompetitorSighting,
  getPredefinedSightingNotes,
} from '../lib/supabase';
import { toast } from '../components/ui/Toast';

/**
 * Hook for managing competitors for a specific client
 */
export function useCompetitors(clientId) {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompetitors = useCallback(async () => {
    if (!clientId) {
      setCompetitors([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCompetitors(clientId);
      setCompetitors(data || []);
    } catch (err) {
      console.error('Error fetching competitors:', err);
      setError(err.message);
      toast.error('Failed to load competitors');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  // Create competitor
  const create = async (competitorData) => {
    try {
      const newCompetitor = await createCompetitor({
        ...competitorData,
        client_id: clientId,
      });
      setCompetitors(prev => [...prev, { ...newCompetitor, sightings: [] }]);
      toast.success('Competitor added');
      return { data: newCompetitor, error: null };
    } catch (err) {
      console.error('Error creating competitor:', err);
      toast.error('Failed to add competitor');
      return { data: null, error: err };
    }
  };

  // Update competitor
  const update = async (competitorId, updates) => {
    try {
      const updated = await updateCompetitor(competitorId, updates);
      setCompetitors(prev =>
        prev.map(c => (c.id === competitorId ? { ...c, ...updated } : c))
      );
      toast.success('Competitor updated');
      return { data: updated, error: null };
    } catch (err) {
      console.error('Error updating competitor:', err);
      toast.error('Failed to update competitor');
      return { data: null, error: err };
    }
  };

  // Delete competitor
  const remove = async (competitorId) => {
    try {
      await deleteCompetitor(competitorId);
      setCompetitors(prev => prev.filter(c => c.id !== competitorId));
      toast.success('Competitor removed');
      return { error: null };
    } catch (err) {
      console.error('Error deleting competitor:', err);
      toast.error('Failed to remove competitor');
      return { error: err };
    }
  };

  // Toggle active status
  const toggleActive = async (competitorId, isActive) => {
    return update(competitorId, { is_active: isActive });
  };

  return {
    competitors,
    loading,
    error,
    refetch: fetchCompetitors,
    create,
    update,
    remove,
    toggleActive,
  };
}

/**
 * Hook for managing all sightings across competitors
 */
export function useSightings() {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSightings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllSightings();
      setSightings(data || []);
    } catch (err) {
      console.error('Error fetching sightings:', err);
      setError(err.message);
      toast.error('Failed to load sightings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSightings();
  }, [fetchSightings]);

  // Add sighting
  const add = async (sightingData) => {
    try {
      const newSighting = await addCompetitorSighting(sightingData);
      setSightings(prev => [newSighting, ...prev]);
      toast.success('Sighting logged');
      return { data: newSighting, error: null };
    } catch (err) {
      console.error('Error adding sighting:', err);
      toast.error('Failed to log sighting');
      return { data: null, error: err };
    }
  };

  // Update sighting
  const update = async (sightingId, updates) => {
    try {
      const updated = await updateCompetitorSighting(sightingId, updates);
      setSightings(prev =>
        prev.map(s => (s.id === sightingId ? { ...s, ...updated } : s))
      );
      toast.success('Sighting updated');
      return { data: updated, error: null };
    } catch (err) {
      console.error('Error updating sighting:', err);
      toast.error('Failed to update sighting');
      return { data: null, error: err };
    }
  };

  // Delete sighting
  const remove = async (sightingId) => {
    try {
      await deleteCompetitorSighting(sightingId);
      setSightings(prev => prev.filter(s => s.id !== sightingId));
      toast.success('Sighting removed');
      return { error: null };
    } catch (err) {
      console.error('Error deleting sighting:', err);
      toast.error('Failed to remove sighting');
      return { error: err };
    }
  };

  // Update last seen
  const markSeen = async (sightingId) => {
    return update(sightingId, { last_seen_at: new Date().toISOString() });
  };

  // Get sightings grouped by location
  const sightingsByLocation = sightings.reduce((acc, sighting) => {
    const key = sighting.location_name;
    if (!acc[key]) {
      acc[key] = {
        location_name: sighting.location_name,
        location_type: sighting.location_type,
        location_url: sighting.location_url,
        sightings: [],
        competitors: new Set(),
        lastSeen: null,
      };
    }
    acc[key].sightings.push(sighting);
    acc[key].competitors.add(sighting.competitor?.name);
    if (!acc[key].lastSeen || new Date(sighting.last_seen_at) > new Date(acc[key].lastSeen)) {
      acc[key].lastSeen = sighting.last_seen_at;
    }
    return acc;
  }, {});

  // Get high priority sightings
  const highPrioritySightings = sightings.filter(s => s.priority === 'high');

  // Get recent sightings (last 7 days)
  const recentSightings = sightings.filter(s => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(s.last_seen_at) >= sevenDaysAgo;
  });

  return {
    sightings,
    loading,
    error,
    refetch: fetchSightings,
    add,
    update,
    remove,
    markSeen,
    // Computed
    sightingsByLocation: Object.values(sightingsByLocation),
    highPrioritySightings,
    recentSightings,
  };
}

/**
 * Hook for predefined sighting notes
 */
export function useSightingNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getPredefinedSightingNotes();
        setNotes(data || []);
      } catch (err) {
        console.error('Error fetching sighting notes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const noteOptions = notes.map(n => ({
    value: n.note_text,
    label: n.note_text,
  }));

  return { notes, noteOptions, loading };
}

/**
 * Hook for competitor insights/analytics
 */
export function useCompetitorInsights() {
  const { sightings, sightingsByLocation, highPrioritySightings, recentSightings } = useSightings();

  // Most active locations (by sighting count)
  const mostActiveLocations = [...sightingsByLocation]
    .sort((a, b) => b.sightings.length - a.sightings.length)
    .slice(0, 5);

  // Locations not visited recently (more than 14 days)
  const staleLocations = sightingsByLocation.filter(loc => {
    if (!loc.lastSeen) return true;
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    return new Date(loc.lastSeen) < fourteenDaysAgo;
  });

  // Competitors by sighting count
  const competitorActivity = sightings.reduce((acc, s) => {
    const name = s.competitor?.name;
    if (name) {
      acc[name] = (acc[name] || 0) + 1;
    }
    return acc;
  }, {});

  const mostActiveCompetitors = Object.entries(competitorActivity)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalSightings: sightings.length,
    totalLocations: sightingsByLocation.length,
    highPriorityCount: highPrioritySightings.length,
    recentCount: recentSightings.length,
    mostActiveLocations,
    staleLocations,
    mostActiveCompetitors,
  };
}

export default useCompetitors;
