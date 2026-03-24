import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAiResearch() {
  const [researches, setResearches] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResearches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_research')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setResearches(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchResearches(); }, []);

  const saveResearch = async ({ title, query, result }) => {
    const { data, error } = await supabase
      .from('ai_research')
      .insert([{ title, query, result }])
      .select()
      .single();
    if (!error) {
      setResearches(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  const deleteResearch = async (id) => {
    const { error } = await supabase.from('ai_research').delete().eq('id', id);
    if (!error) setResearches(prev => prev.filter(r => r.id !== id));
  };

  return { researches, loading, saveResearch, deleteResearch, fetchResearches };
}