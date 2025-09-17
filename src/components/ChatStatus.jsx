export default function ChatStatus({ status }) {
  const color = status === 'connected' ? 'text-green-400'
              : status === 'error' ? 'text-red-400'
              : 'text-yellow-400';
  return <span className={`text-sm ${color}`}>Socket: {status}</span>;
}
