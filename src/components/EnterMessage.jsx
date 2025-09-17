import { useState } from 'react';

export default function EnterMessage({ onSend, canSend }) {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!canSend) return;
    console.log('[chat] EnterMessage submit', text);
    onSend?.(text);
    setText('');
    setSent(true);
    setTimeout(() => setSent(false), 1000);
  };
  return (
    <>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          id="chat-message-input"
          name="chat-message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded px-3 py-2 bg-neutral-800 text-white"
          disabled={!canSend}
        />
        <button className="px-4 py-2 bg-gray-600 text-white rounded" disabled={!canSend}>Send</button>
      </form>
      {!canSend && <div className="text-red-400 text-xs mt-1">Not connected</div>}
      {sent && <div className="text-green-400 text-xs mt-1">Message sent!</div>}
    </>
  );
}
