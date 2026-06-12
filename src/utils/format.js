export function formatEGP(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function truncate(str, len = 48) {
  if (!str) return '—'
  return str.length > len ? `${str.slice(0, len)}…` : str
}

export function cellPreview(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
