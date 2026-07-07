export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-14 w-14' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`animate-spin rounded-full border-4 border-primary-600 border-t-transparent ${sizes[size]}`} />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
}
