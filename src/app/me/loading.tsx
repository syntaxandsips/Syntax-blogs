export default function MeLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-12 rounded-[32px] border-4 border-black bg-[#FF69B4]/40 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.1)]"></div>
      <div className="grid gap-4 md:grid-cols-2">
        {['overview', 'lists', 'highlights', 'history'].map((placeholder) => (
          <div
            key={placeholder}
            className="h-32 rounded-[32px] border-4 border-black bg-[#87CEEB]/40 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}
