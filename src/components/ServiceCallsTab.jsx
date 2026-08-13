import { useState, useCallback, useRef } from 'react'
import { Plus, Trash, FloppyDisk, CaretUpDown, Check, X } from '@phosphor-icons/react'
import { STATUSES, MOCK_PARTS, MOCK_MACHINES } from '../lib/data'
import { cn } from '../lib/utils'
import { toast } from 'sonner'

const STATUS_STYLES = {
  'Pending':       'bg-amber-100 text-amber-800 border-amber-200',
  'In Progress':   'bg-blue-100 text-blue-800 border-blue-200',
  'Complete':      'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Facing Issues': 'bg-red-100 text-red-800 border-red-200',
  '':              'bg-slate-100 text-slate-500 border-slate-200',
}

// ── Small reusable cell components ────────────────────────
function EditableCell({ value, onChange, className, placeholder = '', readOnly = false }) {
  return (
    <div
      contentEditable={!readOnly}
      suppressContentEditableWarning
      onBlur={e => {
        if (!readOnly) onChange(e.currentTarget.innerText.trim())
      }}
      className={cn(
        'min-w-[80px] outline-none rounded px-1 py-0.5',
        readOnly ? 'cursor-default' : 'cursor-text hover:bg-slate-50 focus:bg-indigo-50 focus:ring-1 focus:ring-indigo-300',
        'text-sm text-slate-800 transition-colors',
        className
      )}
      data-placeholder={placeholder}
    >
      {value}
    </div>
  )
}

function StatusBadge({ value, onChange, readOnly = false }) {
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const ref = useRef(null)

  const toggle = () => {
    if (readOnly) return
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setDropUp(window.innerHeight - rect.bottom < 220)
    }
    setOpen(o => !o)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        disabled={readOnly}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all w-full',
          STATUS_STYLES[value] || STATUS_STYLES[''],
          readOnly && 'cursor-default'
        )}
      >
        <span className="flex-1 text-left">{value || (readOnly ? '' : 'Set Status')}</span>
        {!readOnly && <CaretUpDown size={12} />}
      </button>
      {open && (
        <div className={cn(
          "absolute z-50 left-0 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[160px]",
          dropUp ? "bottom-full mb-1" : "top-full mt-1"
        )}>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false) }}
              className={cn(
                'w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2',
                value === s && 'font-semibold text-indigo-600'
              )}
            >
              {value === s && <Check size={12} />}
              {s || 'None'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MultiSelect({ items, selected, onChange, options, readOnly = false }) {
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const ref = useRef(null)

  const toggle = () => {
    if (readOnly) return
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setDropUp(window.innerHeight - rect.bottom < 280)
    }
    setOpen(o => !o)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        disabled={readOnly}
        className={cn("flex flex-wrap gap-1 min-w-[140px] text-left p-1 rounded transition-colors", !readOnly && "hover:bg-slate-50")}
      >
        {selected.length === 0
          ? <span className="text-xs text-slate-400 px-1">{readOnly ? '' : 'Select…'}</span>
          : selected.map(s => (
              <span key={s} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">{s}</span>
            ))
        }
      </button>
      {open && (
        <div className={cn(
          "absolute z-50 left-0 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[200px] max-h-60 overflow-y-auto",
          dropUp ? "bottom-full mb-1" : "top-full mt-1"
        )}>
          {options.map(opt => {
            const checked = selected.includes(opt)
            return (
              <button
                key={opt}
                onClick={() => {
                  const next = checked ? selected.filter(x => x !== opt) : [...selected, opt]
                  onChange(next)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-50 text-sm"
              >
                <div className={cn(
                  'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  checked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                )}>
                  {checked && <Check size={10} color="white" weight="bold" />}
                </div>
                {opt}
              </button>
            )
          })}
          <div className="border-t border-slate-100 mt-1 pt-1 px-2">
            <button
              onClick={() => setOpen(false)}
              className="w-full text-center text-xs text-indigo-600 font-semibold py-1 hover:text-indigo-800"
            >Done</button>
          </div>
        </div>
      )}
    </div>
  )
}

function LocationSelect({ locationId, brokers, onChange, readOnly = false }) {
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const ref = useRef(null)
  const [search, setSearch] = useState('')
  
  const selectedBroker = brokers.find(b => b.locations?.some(l => l.id === locationId))
  const selectedLocation = selectedBroker?.locations?.find(l => l.id === locationId)

  const toggle = () => {
    if (readOnly) return
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setDropUp(window.innerHeight - rect.bottom < 300)
    }
    setOpen(o => !o)
  }

  const filtered = brokers.map(b => ({
    ...b,
    locations: b.locations.filter(l =>
      l.location.toLowerCase().includes(search.toLowerCase()) ||
      b.name.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(b => b.locations.length > 0)

  // Find current label
  let label = 'Select location…'
  for (const b of brokers) {
    const l = b.locations.find(l => l.id === locationId)
    if (l) { label = l.location; break }
  }

  return (
    <div className="relative min-w-[200px]" ref={ref}>
      <button
        onClick={toggle}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-sm transition-all text-left',
          open ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'
        )}
      >
        <span className={locationId ? 'text-slate-800' : 'text-slate-400'}>{label}</span>
        <CaretUpDown size={13} className="text-slate-400 flex-shrink-0" />
      </button>
      {open && (
        <div className={cn(
          "absolute z-50 left-0 bg-white rounded-xl shadow-xl border border-slate-200 w-72",
          dropUp ? "bottom-full mb-1" : "top-full mt-1"
        )}>
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search locations…"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            <button
              onClick={() => { onChange(null, null, null); setOpen(false); setSearch('') }}
              className="w-full text-left px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-50"
            >— None —</button>
            {filtered.map(b => (
              <div key={b.id}>
                <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50">{b.name}</div>
                {b.locations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => { onChange(loc.id, loc, b); setOpen(false); setSearch('') }}
                    className={cn(
                      'w-full text-left px-4 py-1.5 text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors',
                      loc.id === locationId && 'bg-indigo-50 text-indigo-700 font-semibold'
                    )}
                  >
                    {loc.location}
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-4">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────
export default function ServiceCallsTab({ calls, brokers, onSave, onDelete, readOnly = false }) {
  const idCounter = useRef(Math.max(...calls.map(c => c.id), 0) + 1)

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/shared/calls`
      await navigator.clipboard.writeText(url)
      toast.success('Shareable link copied to clipboard!')
    } catch (e) {
      toast.error('Failed to generate link')
    }
  }

  const updateCall = useCallback((id, field, value) => {
    const next = calls.map(c => c.id === id ? { ...c, [field]: value } : c)
    onSave(next)
  }, [calls, onSave])

  const onLocationChange = useCallback((rowId, locId, loc, broker) => {
    const next = calls.map(c => {
      if (c.id !== rowId) return c
      if (!locId) return { ...c, locationId: null, callLocation: '' }
      return {
        ...c,
        locationId: locId,
        callLocation: loc.location,
        address: [loc.address, loc.town].filter(Boolean).join(', '),
        broker: broker.name,
        brokerContact: broker.phone || '',
        locationContact: loc.contactNo || '',
      }
    })
    onSave(next)
  }, [calls, onSave])

  const addRow = () => {
    const newId = idCounter.current++
    const next = [...calls, {
      id: newId, srNo: String(calls.length + 1),
      callDate: new Date().toISOString().split('T')[0], locationId: null,
      callLocation: '', address: '', broker: '', brokerContact: '', locationContact: '',
      resolutionDate: '', resolutionNotes: '', status: '', parts: [], machine: [], notes: '',
    }]
    onSave(next)
  }

  const deleteRow = (id) => {
    if (onDelete) {
      onDelete(id)
    } else {
      // Fallback if onDelete is not provided
      onSave(calls.filter(c => c.id !== id))
    }
  }

  const cols = [
    { key: 'srNo',            label: '#',                w: 'min-w-[40px]' },
    { key: 'callDate',        label: 'Call Date',        w: 'min-w-[140px]' },
    { key: 'callLocation',    label: 'Location',         w: 'min-w-[220px]' },
    { key: 'address',         label: 'Address',          w: 'min-w-[240px]' },
    { key: 'broker',          label: 'Broker',           w: 'min-w-[200px]' },
    { key: 'brokerContact',   label: 'Broker Contact',   w: 'min-w-[140px]' },
    { key: 'locationContact', label: 'Loc. Contact',     w: 'min-w-[140px]' },
    { key: 'resolutionDate',  label: 'Resolution Date',  w: 'min-w-[140px]' },
    { key: 'resolutionNotes', label: 'Resolution Notes', w: 'min-w-[240px]' },
    { key: 'status',          label: 'Status',           w: 'min-w-[160px]' },
    { key: 'parts',           label: 'Parts',            w: 'min-w-[200px]' },
    { key: 'machine',         label: 'Machine',          w: 'min-w-[200px]' },
    { key: 'notes',           label: 'Notes',            w: 'min-w-[240px]' },
    { key: '_actions',        label: '',                 w: 'min-w-[50px]' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">{calls.length} calls</span>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-500">
            {calls.filter(c => c.status === 'Complete').length} resolved
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!readOnly && (
            <>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
              >
                Share Link
              </button>
              <button
                onClick={addRow}
                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-200 transition-all active:scale-95"
              >
                <Plus size={15} weight="bold" />
                Add Row
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto relative">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-20 bg-slate-50">
            <tr className="border-b border-slate-200">
              {cols.map(c => (
                <th key={c.key} className={cn('px-3 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap bg-slate-50', c.w)}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calls.map((row, i) => (
              <tr key={row.id} className={cn('border-b border-slate-100 transition-colors hover:bg-slate-50/80', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30')}>
                {/* Sr No */}
                <td className="px-3 py-2">
                  <EditableCell readOnly={readOnly} value={row.srNo} onChange={v => updateCall(row.id, 'srNo', v)} className="w-8 text-center text-slate-500" />
                </td>
                {/* Call Date */}
                <td className="px-3 py-2">
                  <input
                    type="date"
                    readOnly={readOnly}
                    disabled={readOnly}
                    value={row.callDate || ''}
                    onChange={e => updateCall(row.id, 'callDate', e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-400 bg-white w-full disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </td>
                {/* Location Dropdown */}
                <td className="px-3 py-2">
                  <LocationSelect
                    readOnly={readOnly}
                    locationId={row.locationId}
                    brokers={brokers}
                    onChange={(locId, loc, broker) => onLocationChange(row.id, locId, loc, broker)}
                  />
                </td>
                {/* Address */}
                <td className="px-3 py-2">
                  <EditableCell readOnly={readOnly} value={row.address || ''} onChange={v => updateCall(row.id, 'address', v)} placeholder="Address" />
                </td>
                {/* Broker */}
                <td className="px-3 py-2">
                  <EditableCell readOnly={readOnly} value={row.broker || ''} onChange={v => updateCall(row.id, 'broker', v)} placeholder="Broker" />
                </td>
                {/* Broker Contact */}
                <td className="px-3 py-2">
                  <EditableCell readOnly={readOnly} value={row.brokerContact || ''} onChange={v => updateCall(row.id, 'brokerContact', v)} placeholder="—" />
                </td>
                {/* Location Contact */}
                <td className="px-3 py-2">
                  <EditableCell readOnly={readOnly} value={row.locationContact || ''} onChange={v => updateCall(row.id, 'locationContact', v)} placeholder="—" />
                </td>
                {/* Resolution Date */}
                <td className="px-3 py-2">
                  <input
                    type="date"
                    readOnly={readOnly}
                    disabled={readOnly}
                    value={row.resolutionDate || ''}
                    onChange={e => updateCall(row.id, 'resolutionDate', e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-400 bg-white w-full disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </td>
                {/* Resolution Notes */}
                <td className="px-3 py-2">
                  <EditableCell readOnly={readOnly} value={row.resolutionNotes || ''} onChange={v => updateCall(row.id, 'resolutionNotes', v)} placeholder="Notes…" className="min-w-[180px]" />
                </td>
                {/* Status */}
                <td className="px-3 py-2">
                  <StatusBadge readOnly={readOnly} value={row.status} onChange={v => updateCall(row.id, 'status', v)} />
                </td>
                {/* Parts */}
                <td className="px-3 py-2">
                  <MultiSelect
                    readOnly={readOnly}
                    selected={row.parts || []}
                    options={MOCK_PARTS}
                    onChange={v => updateCall(row.id, 'parts', v)}
                  />
                </td>
                {/* Machine */}
                <td className="px-3 py-2">
                  <MultiSelect
                    readOnly={readOnly}
                    selected={row.machine || []}
                    options={MOCK_MACHINES}
                    onChange={v => updateCall(row.id, 'machine', v)}
                  />
                </td>
                {/* Notes */}
                <td className="px-3 py-2">
                  <EditableCell readOnly={readOnly} value={row.notes || ''} onChange={v => updateCall(row.id, 'notes', v)} placeholder="Notes…" className="min-w-[160px]" />
                </td>
                {/* Actions */}
                <td className="px-3 py-2 text-center">
                  {!readOnly && (
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete row"
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {calls.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <FloppyDisk size={36} className="text-slate-300" />
            <p className="text-sm">No service calls yet. Add one above.</p>
          </div>
        )}
      </div>
    </div>
  )
}
