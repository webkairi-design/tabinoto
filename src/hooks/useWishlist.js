import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setWishlist(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchWishlist(); }, []);

  const addToWishlist = async ({ name, location, latitude, longitude, memo, research_id }) => {
    let lat = latitude;
    let lng = longitude;
    if ((!lat || !lng) && location) {
      try {
        const res = await fetch(
  `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name + ' ' + location)}&format=json&limit=1&countrycodes=jp`,
          { headers: { 'Accept-Language': 'ja' } }
        );
        const data = await res.json();
        if (data[0]) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        }
      } catch (e) {}
    }
    const { data, error } = await supabase
      .from('wishlist')
      .insert([{ name, location, latitude: lat, longitude: lng, memo, research_id }])
      .select()
      .single();
    if (!error) {
      setWishlist(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  const removeFromWishlist = async (id) => {
    const { error } = await supabase.from('wishlist').delete().eq('id', id);
    if (!error) setWishlist(prev => prev.filter(w => w.id !== id));
  };

  return { wishlist, loading, addToWishlist, removeFromWishlist, fetchWishlist };
}