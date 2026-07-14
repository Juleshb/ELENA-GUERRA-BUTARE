import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

export function useCrud(endpoint) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get(`${endpoint}?admin=true`)
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (data) => {
    await api.post(endpoint, data);
    load();
  };

  const update = async (id, data) => {
    await api.put(`${endpoint}/${id}`, data);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this item?')) return;
    await api.delete(`${endpoint}/${id}`);
    load();
  };

  return { items, loading, create, update, remove, reload: load };
}
