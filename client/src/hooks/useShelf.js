import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useShelf() {
  const { user, api } = useAuth();
  const [shelf, setShelf] = useState([]);
  const [lists, setLists] = useState([]);
  const [tasteProfile, setTasteProfile] = useState({});
  const [feedbackMap, setFeedbackMap] = useState({});
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!user || loaded) return;
    try {
      const [sr, lr, tr] = await Promise.all([
        api('get', '/user/shelf'), api('get', '/user/lists'), api('get', '/user/taste')
      ]);
      setShelf(sr.data); setLists(lr.data);
      setTasteProfile(tr.data.tasteProfile || {}); setFeedbackMap(tr.data.feedbackMap || {});
      setLoaded(true);
    } catch (e) { console.error(e); }
  }, [user, api, loaded]);

  const saveItem = useCallback(async (item) => {
    const r = await api('post', '/user/shelf', item); setShelf(r.data);
  }, [api]);
  const removeItem = useCallback(async (id) => {
    const r = await api('delete', `/user/shelf/${id}`); setShelf(r.data);
  }, [api]);
  const isSaved = (id) => shelf.some(s => s.id === id);

  const createList = useCallback(async (name, type) => {
    const r = await api('post', '/user/lists', { name, type }); setLists(r.data); return r.data;
  }, [api]);
  const renameList = useCallback(async (listId, name) => {
    const r = await api('put', `/user/lists/${listId}`, { name }); setLists(r.data);
  }, [api]);
  const deleteList = useCallback(async (listId) => {
    const r = await api('delete', `/user/lists/${listId}`); setLists(r.data);
  }, [api]);
  const addToList = useCallback(async (listId, item) => {
    const r = await api('post', `/user/lists/${listId}/items`, item); setLists(r.data);
  }, [api]);
  const removeFromList = useCallback(async (listId, itemId) => {
    const r = await api('delete', `/user/lists/${listId}/items/${itemId}`); setLists(r.data);
  }, [api]);

  const sendFeedback = useCallback(async (itemId, direction, tags) => {
    const r = await api('post', '/user/feedback', { itemId, direction, tags });
    setTasteProfile(r.data.tasteProfile); setFeedbackMap(r.data.feedbackMap);
  }, [api]);

  const reset = () => { setShelf([]); setLists([]); setTasteProfile({}); setFeedbackMap({}); setLoaded(false); };

  return { shelf, lists, tasteProfile, feedbackMap, load, saveItem, removeItem, isSaved, createList, renameList, deleteList, addToList, removeFromList, sendFeedback, reset };
}
