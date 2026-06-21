export default function Avatar({ firstName = '', lastName = '', avatarUrl = null, size = 40, onChange, bgColor = '#0A1628' }) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
  const fontSize  = Math.round(size * 0.36)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file || !onChange) return
    const reader = new FileReader()
    reader.onload = ev => onChange(ev.target.result)
    reader.readAsDataURL(file)
  }

  const inner = avatarUrl
    ? <img src={avatarUrl} alt={`${firstName} ${lastName}`}
        className="w-full h-full object-cover" />
    : <span className="font-semibold select-none" style={{ fontSize, color: '#fff', letterSpacing: '0.02em' }}>
        {initials}
      </span>

  if (onChange) {
    return (
      <label className="relative cursor-pointer group shrink-0" style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: bgColor }}>
          {inner}
        </div>
        <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <span style={{ fontSize: Math.round(size * 0.22), color: '#fff' }}>✎</span>
        </div>
        <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
      </label>
    )
  }

  return (
    <div className="rounded-full overflow-hidden flex items-center justify-center shrink-0"
      style={{ width: size, height: size, backgroundColor: bgColor }}>
      {inner}
    </div>
  )
}
