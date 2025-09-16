import { useEffect } from 'react';
import { logPostView } from '../api';

export default function usePostView(postId) {
  useEffect(() => {
    if (!postId) return;
    const day = new Date().toISOString().slice(0, 10);
    const key = `viewed:${postId}:${day}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
    logPostView(postId);
  }, [postId]);
}
