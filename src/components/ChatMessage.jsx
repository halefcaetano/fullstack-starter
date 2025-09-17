export default function ChatMessage({ msg }) {
  const { username, message, replayed } = msg;
  return (
    <div style={{ opacity: replayed ? 0.55 : 1 }}>
      {username ? <b>{username}:</b> : <i>system</i>} {message}
    </div>
  );
}
