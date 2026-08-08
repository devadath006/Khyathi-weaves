export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] px-5 py-3 rounded-lg shadow-xl text-sm font-medium text-white ${
        toast.type === 'error' ? 'bg-rose-800' : 'bg-emerald-700'
      }`}
    >
      {toast.msg}
    </div>
  )
}
