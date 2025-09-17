export default function ChatMessage({ msg }) {
  const { username, message, replayed, room } = msg;
  return (
    <div style={{ opacity: replayed ? 0.55 : 1 }}>
      <span className="text-gray-500 mr-2">[{room}]</span>
      {username ? <b>{username}:</b> : <i>system</i>} {message}
    </div>
  );
}
