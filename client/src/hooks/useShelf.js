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
    window.pendo?.track("item_saved_to_shelf", {
      item_id: item.id,
      item_title: item.title,
      item_type: item.type,
      item_genre: item.genre,
      tags: (item.tags || []).slice(0, 5).join(", "),
      shelf_size_after: r.data.length
    });
  }, [api]);
  const removeItem = useCallback(async (id) => {
    const r = await api('delete', `/user/shelf/${id}`); setShelf(r.data);
    window.pendo?.track("item_removed_from_shelf", {
      item_id: id,
      shelf_size_after: r.data.length
    });
  }, [api]);
  const isSaved = (id) => shelf.some(s => s.id === id);

  const createList = useCallback(async (name, type) => {
    const r = await api('post', '/user/lists', { name, type }); setLists(r.data);
    window.pendo?.track("custom_list_created", {
      list_name: name,
      list_type: type,
      total_lists_after: r.data.length
    });
    return r.data;
  }, [api]);
  const renameList = useCallback(async (listId, name) => {
    const r = await api('put', `/user/lists/${listId}`, { name }); setLists(r.data);
    window.pendo?.track("custom_list_renamed", {
      list_id: listId,
      new_name: name
    });
  }, [api]);
  const deleteList = useCallback(async (listId) => {
    const r = await api('delete', `/user/lists/${listId}`); setLists(r.data);
    window.pendo?.track("custom_list_deleted", {
      list_id: listId,
      total_lists_after: r.data.length
    });
  }, [api]);
  const addToList = useCallback(async (listId, item) => {
    const r = await api('post', `/user/lists/${listId}/items`, item); setLists(r.data);
    const updatedList = r.data.find(l => l.id === listId);
    window.pendo?.track("item_added_to_list", {
      list_id: listId,
      list_name: updatedList?.name,
      item_id: item.id,
      item_title: item.title,
      item_type: item.type,
      list_item_count_after: updatedList?.items?.length || 0
    });
  }, [api]);
  const removeFromList = useCallback(async (listId, itemId) => {
    const r = await api('delete', `/user/lists/${listId}/items/${itemId}`); setLists(r.data);
    const updatedList = r.data.find(l => l.id === listId);
    window.pendo?.track("item_removed_from_list", {
      list_id: listId,
      item_id: itemId,
      list_item_count_after: updatedList?.items?.length || 0
    });
  }, [api]);

  const sendFeedback = useCallback(async (itemId, direction, tags) => {
    const r = await api('post', '/user/feedback', { itemId, direction, tags });
    setTasteProfile(r.data.tasteProfile); setFeedbackMap(r.data.feedbackMap);
    window.pendo?.track("feedback_submitted", {
      item_id: itemId,
      direction,
      tags: (tags || []).slice(0, 5).join(", "),
      tags_count: (tags || []).length
    });
  }, [api]);

  const reset = () => { setShelf([]); setLists([]); setTasteProfile({}); setFeedbackMap({}); setLoaded(false); };

  return { shelf, lists, tasteProfile, feedbackMap, load, saveItem, removeItem, isSaved, createList, renameList, deleteList, addToList, removeFromList, sendFeedback, reset };
}
