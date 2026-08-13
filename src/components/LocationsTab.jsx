import { useState } from 'react'
import { Plus, PencilSimple, Trash, Phone, Buildings, MapPin, CaretDown, CaretRight, CurrencyDollar, Coin } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { Drawer } from 'vaul'
import { cn } from '../lib/utils'

// ── Vaul Drawer wrapper ────────────────────────────────────
function AppDrawer({ open, onOpenChange, title, children }) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl max-h-[90vh]">
          <div className="mx-auto mt-3 mb-1 h-1 w-12 rounded-full bg-slate-200" />
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <Drawer.Title className="text-base font-bold text-slate-900">{title}</Drawer.Title>
          </div>
          <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function FormField({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  )
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
    />
  )
}

// ── Add/Edit Broker Drawer ─────────────────────────────────
function BrokerDrawer({ open, onOpenChange, existing, onSave }) {
  const [name, setName] = useState(existing?.name || '')
  const [phone, setPhone] = useState(existing?.phone || '')

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), phone: phone.trim() })
    onOpenChange(false)
  }

  return (
    <AppDrawer open={open} onOpenChange={onOpenChange} title={existing ? 'Edit Group' : 'Add Broker / Group'}>
      <FormField label="Group Name">
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lucky 8 Games LLC" />
      </FormField>
      <FormField label="Phone Number (optional)">
        <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 2295915400" />
      </FormField>
      <button
        onClick={handleSave}
        className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-sm shadow-indigo-200"
      >
        {existing ? 'Save Changes' : 'Add Group'}
      </button>
    </AppDrawer>
  )
}

// ── Add Location Drawer ────────────────────────────────────
function LocationDrawer({ open, onOpenChange, onSave }) {
  const [form, setForm] = useState({ location: '', licenseNo: '', coams: '', address: '', town: '', contactNo: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.location.trim()) return
    onSave({ ...form })
    setForm({ location: '', licenseNo: '', coams: '', address: '', town: '', contactNo: '' })
    onOpenChange(false)
  }

  return (
    <AppDrawer open={open} onOpenChange={onOpenChange} title="Add Location">
      <FormField label="Location Name *">
        <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. BM Foods" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="License No.">
          <Input value={form.licenseNo} onChange={e => set('licenseNo', e.target.value)} placeholder="e.g. 68234" />
        </FormField>
        <FormField label="COAMs">
          <Input type="number" value={form.coams} onChange={e => set('coams', e.target.value)} placeholder="e.g. 6" />
        </FormField>
      </div>
      <FormField label="Address">
        <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Town">
          <Input value={form.town} onChange={e => set('town', e.target.value)} placeholder="City" />
        </FormField>
        <FormField label="Contact No.">
          <Input type="tel" value={form.contactNo} onChange={e => set('contactNo', e.target.value)} placeholder="Phone" />
        </FormField>
      </div>
      <button
        onClick={handleSave}
        className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-sm shadow-indigo-200"
      >
        Add Location
      </button>
    </AppDrawer>
  )
}

// ── Editable table cell ────────────────────────────────────
function EditableCell({ value, onChange }) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={e => onChange(e.currentTarget.innerText.trim())}
      className="outline-none rounded px-1 py-0.5 text-sm text-slate-700 hover:bg-slate-100 focus:bg-indigo-50 focus:ring-1 focus:ring-indigo-300 transition-colors cursor-text min-w-[60px]"
    >
      {value}
    </div>
  )
}

// ── Broker Card ────────────────────────────────────────────
function BrokerCard({ broker, onUpdate, onDelete, onAddLocation, onDeleteLocation }) {
  const [open, setOpen] = useState(false)
  const [editDrawer, setEditDrawer] = useState(false)
  const [addLocDrawer, setAddLocDrawer] = useState(false)

  const totalCoams = broker.locations.reduce((s, l) => s + (parseInt(l.coams) || 0), 0)

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors select-none"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            <Buildings size={16} className="text-indigo-600" weight="fill" />
          </div>
          <span className="font-bold text-slate-800 text-sm truncate">{broker.name}</span>
          {broker.phone && (
            <span className="flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
              <Phone size={11} /> {broker.phone}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
            {broker.locations.length} loc.
          </span>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
            {totalCoams} COAMs
          </span>
          <Link
            to={`/broker/${broker.id}/finance`}
            onClick={e => e.stopPropagation()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors ml-2"
            title="View Finances"
          >
            <CurrencyDollar size={18} />
          </Link>
          <button
            onClick={e => { e.stopPropagation(); setEditDrawer(true) }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <PencilSimple size={18} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash size={18} />
          </button>
          <div className="p-1.5 text-slate-400">
            {open ? <CaretDown size={18} /> : <CaretRight size={18} />}
          </div>
        </div>
      </div>

      {/* Locations table */}
      {open && (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-t border-slate-200 bg-white">
                  {['#', 'Location', 'License No.', 'COAMs', 'Address', 'Town', 'Contact No.', ''].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {broker.locations.map((loc, i) => (
                  <tr key={loc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 text-slate-400 w-8">{i + 1}</td>
                    <td className="px-3 py-2"><EditableCell value={loc.location} onChange={v => onUpdate(loc.id, 'location', v)} /></td>
                    <td className="px-3 py-2"><EditableCell value={loc.licenseNo || ''} onChange={v => onUpdate(loc.id, 'licenseNo', v)} /></td>
                    <td className="px-3 py-2 text-center"><EditableCell value={String(loc.coams ?? '')} onChange={v => onUpdate(loc.id, 'coams', v)} /></td>
                    <td className="px-3 py-2"><EditableCell value={loc.address || ''} onChange={v => onUpdate(loc.id, 'address', v)} /></td>
                    <td className="px-3 py-2"><EditableCell value={loc.town || ''} onChange={v => onUpdate(loc.id, 'town', v)} /></td>
                    <td className="px-3 py-2"><EditableCell value={loc.contactNo || ''} onChange={v => onUpdate(loc.id, 'contactNo', v)} /></td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => onDeleteLocation(loc.id)} className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-dashed border-slate-200 bg-slate-50/50">
            <button
              onClick={() => setAddLocDrawer(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-dashed border-indigo-300 hover:border-indigo-500 px-3 py-1.5 rounded-lg transition-all"
            >
              <Plus size={13} weight="bold" /> Add Location
            </button>
          </div>
        </div>
      )}

      {/* Drawers */}
      <BrokerDrawer
        open={editDrawer}
        onOpenChange={setEditDrawer}
        existing={broker}
        onSave={({ name, phone }) => onUpdate(null, '_broker', { name, phone })}
      />
      <LocationDrawer
        open={addLocDrawer}
        onOpenChange={setAddLocDrawer}
        onSave={onAddLocation}
      />
    </div>
  )
}

// ── Locations Tab ──────────────────────────────────────────
export default function LocationsTab({ brokers, onSave }) {
  const [addBrokerOpen, setAddBrokerOpen] = useState(false)

  const totalLocs = brokers.reduce((s, b) => s + b.locations.length, 0)
  const totalCoams = brokers.reduce((s, b) => s + b.locations.reduce((ss, l) => ss + (parseInt(l.coams) || 0), 0), 0)

  const nextId = () => Math.max(...brokers.map(b => b.id), 0) + 1
  const nextLocId = () => Math.max(...brokers.flatMap(b => b.locations.map(l => l.id)), 0) + 1

  const updateBroker = (brokerId, locId, field, value) => {
    const next = brokers.map(b => {
      if (b.id !== brokerId) return b
      if (field === '_broker') return { ...b, ...value }
      return { ...b, locations: b.locations.map(l => l.id === locId ? { ...l, [field]: value } : l) }
    })
    onSave(next)
  }

  const deleteBroker = (brokerId) => {
    if (!confirm('Delete this group and all its locations?')) return
    onSave(brokers.filter(b => b.id !== brokerId))
  }

  const addLocation = (brokerId, locData) => {
    const next = brokers.map(b => {
      if (b.id !== brokerId) return b
      return { ...b, locations: [...b.locations, { id: nextLocId(), ...locData }] }
    })
    onSave(next)
  }

  const deleteLocation = (brokerId, locId) => {
    if (!confirm('Delete this location?')) return
    const next = brokers.map(b => {
      if (b.id !== brokerId) return b
      return { ...b, locations: b.locations.filter(l => l.id !== locId) }
    })
    onSave(next)
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            <Buildings size={15} className="text-indigo-500" weight="fill" />
            <strong>{brokers.length}</strong> groups
          </span>
          <span className="flex items-center gap-1.5 text-sm text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            <MapPin size={15} className="text-indigo-500" weight="fill" />
            <strong>{totalLocs}</strong> locations
          </span>
          <span className="flex items-center gap-1.5 text-sm text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            <Coin size={15} className="text-indigo-500" weight="fill" />
            <strong>{totalCoams}</strong> total COAMs
          </span>
        </div>
        <button
          onClick={() => setAddBrokerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={15} weight="bold" />
          Add Group
        </button>
      </div>

      {/* Broker cards */}
      <div className="space-y-3">
        {brokers.map(broker => (
          <BrokerCard
            key={broker.id}
            broker={broker}
            onUpdate={(locId, field, value) => updateBroker(broker.id, locId, field, value)}
            onDelete={() => deleteBroker(broker.id)}
            onAddLocation={locData => addLocation(broker.id, locData)}
            onDeleteLocation={locId => deleteLocation(broker.id, locId)}
          />
        ))}
      </div>

      {/* Add broker drawer */}
      <BrokerDrawer
        open={addBrokerOpen}
        onOpenChange={setAddBrokerOpen}
        existing={null}
        onSave={({ name, phone }) => {
          onSave([...brokers, { id: nextId(), name, phone, locations: [] }])
        }}
      />
    </div>
  )
}
