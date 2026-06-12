import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { getEntityConfig } from '../config/entities'
import { cellPreview, formatDate, formatEGP } from '../utils/format'
import { Plus, Pencil, Trash2, RefreshCw, Search, X } from 'lucide-react'

function emptyForm(columns) {
  const form = {}
  columns.forEach((col) => {
    if (col.editable === false) return
    if (col.type === 'boolean') form[col.key] = false
    else if (col.type === 'number') form[col.key] = ''
    else form[col.key] = ''
  })
  return form
}

function rowToForm(row, columns) {
  const form = {}
  columns.forEach((col) => {
    if (col.editable === false) return
    const v = row[col.key]
    if (col.type === 'boolean') form[col.key] = Boolean(v)
    else if (v === null || v === undefined) form[col.key] = ''
    else form[col.key] = String(v)
  })
  return form
}

function formToPayload(form, columns, isCreate) {
  const payload = {}
  columns.forEach((col) => {
    if (col.editable === false && !isCreate) return
    if (col.editable === false && isCreate && col.key.includes('_id') && col.key !== columns[0]?.key) {
      // skip auto ids on create unless it's the only key
    }
    const raw = form[col.key]
    if (raw === '' || raw === undefined) {
      payload[col.key] = null
      return
    }
    if (col.type === 'boolean') {
      payload[col.key] = raw === true || raw === 'true'
    } else if (col.type === 'number') {
      payload[col.key] = Number(raw)
    } else {
      payload[col.key] = raw
    }
  })
  return payload
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 12,
  border: '1.5px solid var(--pp-input-border)',
  background: 'var(--pp-input-bg)',
  fontSize: 14,
  color: 'var(--pp-text-primary)',
  outline: 'none',
}

const GenericCrudPanel = ({ entityId }) => {
  const config = getEntityConfig(entityId)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const canCreate = config?.canCreate !== false
  const canEdit = config?.canEdit !== false

  const load = useCallback(async () => {
    if (!config) return
    setLoading(true)
    setError(null)
    try {
      if (config.loadRows) {
        const data = await config.loadRows(supabase)
        setRows(data || [])
      } else {
        const selectCols = config.selectColumns || '*'
        let query = supabase.from(config.table).select(selectCols)
        if (config.orderBy) {
          query = query.order(config.orderBy.column, { ascending: config.orderBy.ascending })
        }
        query = query.limit(config.limit || 200)
        const { data, error: err } = await query
        if (err) throw new Error(err.message)
        setRows(data || [])
      }
    } catch (err) {
      setError(err.message || String(err))
    }
    setLoading(false)
  }, [config])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((row) =>
      Object.values(row).some((v) => cellPreview(v).toLowerCase().includes(q))
    )
  }, [rows, search])

  const displayColumns =
    config?.columns.filter((c) => c.key !== config.primaryKey || c.editable !== false) ||
    config?.columns ||
    []

  const openCreate = () => {
    setEditingRow(null)
    setForm(emptyForm(config.columns))
    setModalOpen(true)
  }

  const openEdit = async (row) => {
    setEditingRow(row)
    let fullRow = row
    if (config.selectColumns && config.selectColumns !== '*') {
      const { data } = await supabase
        .from(config.table)
        .select('*')
        .eq(config.primaryKey, row[config.primaryKey])
        .single()
      if (data) fullRow = data
    }
    setEditingRow(fullRow)
    setForm(rowToForm(fullRow, config.columns))
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = formToPayload(form, config.columns, !editingRow)
      if (editingRow) {
        const { error: err } = await supabase
          .from(config.table)
          .update(payload)
          .eq(config.primaryKey, editingRow[config.primaryKey])
        if (err) throw err
      } else {
        const { error: err } = await supabase.from(config.table).insert([payload])
        if (err) throw err
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    const label = cellPreview(row[config.columns.find((c) => c.required)?.key || config.primaryKey])
    if (!window.confirm(`Delete this record?\n${label}`)) return
    const { error: err } = await supabase
      .from(config.table)
      .delete()
      .eq(config.primaryKey, row[config.primaryKey])
    if (err) setError(err.message)
    else load()
  }

  const renderCell = (row, col) => {
    const v = row[col.key]
    if (col.type === 'number' && col.key.includes('amount')) return formatEGP(v)
    if (col.key.includes('_at') || col.key.includes('_date') || col.key === 'visit_date') return formatDate(v)
    if (col.type === 'textarea') return truncate(cellPreview(v), 60)
    return truncate(cellPreview(v), 40)
  }

  if (!config) {
    return <p style={{ color: 'var(--pp-text-muted)' }}>Unknown section.</p>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--pp-text-primary)' }}>
            {config.title}
          </h3>
          {config.description && (
            <p className="text-sm mt-1 max-w-2xl" style={{ color: 'var(--pp-text-secondary)' }}>
              {config.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            title="Refresh records"
            aria-label="Refresh records"
            style={{
              padding: 10,
              borderRadius: 12,
              border: '1px solid var(--pp-card-border)',
              background: 'var(--pp-card-bg)',
              color: 'var(--pp-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canCreate && (
            <button type="button" onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
              <Plus className="w-4 h-4" /> Add record
            </button>
          )}
        </div>
      </div>

      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
          style={{ color: 'var(--pp-text-muted)' }}
        />
        <input
          type="search"
          placeholder="Search records…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search records"
          style={{ ...inputStyle, paddingLeft: 40 }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--pp-primary)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--pp-input-border)'
          }}
        />
      </div>

      {error && (
        <div
          className="mb-6 p-4 text-sm"
          style={{
            background: '#FEF2F2',
            color: '#991B1B',
            border: '1px solid #FECACA',
            borderRadius: 12,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: 'var(--pp-card-bg)',
          borderRadius: 16,
          border: '1px solid var(--pp-card-border)',
          boxShadow: 'var(--pp-shadow-resting)',
          overflow: 'hidden',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead
              style={{
                background: 'var(--pp-bg)',
                borderBottom: '1px solid var(--pp-card-border)',
                color: 'var(--pp-text-muted)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <tr>
                {displayColumns.slice(0, 8).map((col) => (
                  <th key={col.key} className="px-4 py-3 font-semibold whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={displayColumns.length + 1}
                    className="px-4 py-12 text-center"
                    style={{ color: 'var(--pp-text-muted)' }}
                  >
                    Loading records…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={displayColumns.length + 1} className="px-4 py-12 text-center">
                    <p style={{ color: 'var(--pp-text-muted)' }}>
                      {search.trim() ? 'No records match your search.' : 'No records found.'}
                    </p>
                    {!search.trim() && config.emptyMessage && (
                      <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: 'var(--pp-text-secondary)' }}>
                        {config.emptyMessage}
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={String(row[config.primaryKey])}
                    style={{ borderBottom: '1px solid var(--pp-card-border)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--pp-bg)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {displayColumns.slice(0, 8).map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3 max-w-[200px] truncate"
                        style={{ color: 'var(--pp-text-primary)' }}
                      >
                        {renderCell(row, col)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {canEdit && !row._from_campaign && (
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          aria-label="Edit record"
                          style={{
                            padding: 8,
                            borderRadius: 8,
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--pp-text-muted)',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--pp-primary-light)'
                            e.currentTarget.style.color = 'var(--pp-primary)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = 'var(--pp-text-muted)'
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {!row._from_campaign && (
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          aria-label="Delete record"
                          style={{
                            padding: 8,
                            borderRadius: 8,
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--pp-text-muted)',
                            cursor: 'pointer',
                            marginLeft: 4,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FEF2F2'
                            e.currentTarget.style.color = '#DC2626'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = 'var(--pp-text-muted)'
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div
          className="px-4 py-2 text-xs"
          style={{
            borderTop: '1px solid var(--pp-card-border)',
            color: 'var(--pp-text-muted)',
          }}
        >
          Displaying {filtered.length} of {rows.length} records
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'var(--pp-overlay)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{
              background: 'var(--pp-card-bg)',
              borderRadius: 16,
              border: '1px solid var(--pp-card-border)',
              boxShadow: 'var(--pp-shadow-floating)',
            }}
          >
            <div
              className="flex items-center justify-between p-6"
              style={{ borderBottom: '1px solid var(--pp-card-border)' }}
            >
              <h3 className="text-lg font-bold" style={{ color: 'var(--pp-text-primary)' }}>
                {editingRow ? 'Edit record' : 'New record'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close dialog"
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--pp-text-muted)',
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {config.columns
                .filter((col) => col.editable !== false || !editingRow)
                .map((col) => (
                  <div key={col.key}>
                    <label
                      className="block text-sm font-semibold mb-1"
                      style={{ color: 'var(--pp-text-primary)' }}
                    >
                      {col.label}
                      {col.required && <span style={{ color: '#EF4444' }}> *</span>}
                    </label>
                    {col.type === 'select' ? (
                      <select
                        value={form[col.key] ?? ''}
                        onChange={(e) => setForm({ ...form, [col.key]: e.target.value })}
                        style={inputStyle}
                        required={col.required}
                      >
                        <option value="">—</option>
                        {col.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : col.type === 'textarea' ? (
                      <textarea
                        rows={4}
                        value={form[col.key] ?? ''}
                        onChange={(e) => setForm({ ...form, [col.key]: e.target.value })}
                        style={{ ...inputStyle, resize: 'none' }}
                        required={col.required}
                      />
                    ) : col.type === 'boolean' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(form[col.key])}
                          onChange={(e) => setForm({ ...form, [col.key]: e.target.checked })}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: 'var(--pp-primary)' }}
                        />
                        <span className="text-sm" style={{ color: 'var(--pp-text-secondary)' }}>
                          Enabled
                        </span>
                      </label>
                    ) : (
                      <input
                        type={col.type === 'number' ? 'number' : col.type === 'datetime' ? 'datetime-local' : 'text'}
                        value={form[col.key] ?? ''}
                        onChange={(e) => setForm({ ...form, [col.key]: e.target.value })}
                        style={inputStyle}
                        required={col.required}
                        readOnly={col.editable === false}
                      />
                    )}
                  </div>
                ))}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary flex-1 py-3"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function truncate(str, len) {
  if (!str || str === '—') return str || '—'
  return str.length > len ? `${str.slice(0, len)}…` : str
}

export default GenericCrudPanel
