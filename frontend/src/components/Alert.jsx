export default function Alert({ type = 'info', message, onClose }) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  return (
    <div className={`border rounded-lg px-4 py-3 mb-4 flex items-center justify-between ${styles[type]}`}>
      <span className="text-sm">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-current opacity-60 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
}
