import { useEffect } from 'react';
import ChatStatus from '../components/ChatStatus.jsx';
import ChatMessage from '../components/ChatMessage.jsx';
import EnterMessage from '../components/EnterMessage.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { useChat } from '../hooks/useChat.js';

export default function Chat() {
  const token = localStorage.getItem('token');
  const { socket, status } = useSocket(token);
  const { messages, send } = useChat(socket);

  // No room/userinfo logic needed

  const clearChat = async () => {
    if (!window.confirm('Are you sure you want to delete all chat messages?')) return;
    await fetch('/api/chat/history', { method: 'DELETE' });
    window.location.reload();
  };
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Chat</h1>
        <ChatStatus status={status} />
      </div>
      <button onClick={clearChat} className="mb-2 px-3 py-1 bg-red-600 text-white rounded">Clear Chat</button>
      <div className="border rounded p-3 h-[50vh] overflow-y-auto bg-black/30 mb-2">
        {messages.map((m, i) => <ChatMessage key={i} msg={m} />)}
      </div>
      <EnterMessage onSend={send} canSend={status === 'connected'} />
    </div>
  );
}
