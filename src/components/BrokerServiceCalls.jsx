import { useState, useEffect } from 'react'
import { Plus, Clock, Info, Check, Wrench } from '@phosphor-icons/react'
import { fetchBrokerServiceCalls, insertBrokerServiceCall } from '../lib/api'
import { MOCK_MACHINES, MOCK_PARTS } from '../lib/data'
import { toast } from 'sonner'
import { cn } from '../lib/utils'

const STATUS_STYLES = {
  '': 'bg-slate-100 text-slate-500 border-slate-200',
  'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Complete': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Facing Issues': 'bg-rose-100 text-rose-700 border-rose-200',
}

export default function BrokerServiceCalls({ broker }) {
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [newCall, setNewCall] = useState({
    locationId: '',
    callDate: new Date().toISOString().split('T')[0],
    machine: '',
    notes: '',
  })

  useEffect(() => {
    loadCalls()
  }, [broker.id])

  async function loadCalls() {
    setLoading(true)
    try {
      const data = await fetchBrokerServiceCalls(broker.id)
      setCalls(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load service calls')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newCall.locationId) {
      toast.error('Please select a location.')
      return
    }
    
    setSubmitting(true)
    try {
      // Default initial values for admin fields
      const callToInsert = {
        locationId: parseInt(newCall.locationId),
        callDate: newCall.callDate,
        machine: newCall.machine ? [newCall.machine] : [],
        notes: newCall.notes,
        status: 'Pending',
        parts: [],
        resolutionNotes: '',
        resolutionDate: '',
        brokerContact: '',
        locationContact: '',
      }

      await insertBrokerServiceCall(callToInsert)
      toast.success('Service call submitted successfully!')
      setShowAddForm(false)
      setNewCall({ locationId: '', callDate: new Date().toISOString().split('T')[0], machine: '', notes: '' })
      loadCalls() // refresh list
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit service call')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading service calls...</div>

  return (
    <div className="max-w-[1200px] mx-auto p-2 pb-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Your Service Calls</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors border",
            showAddForm 
              ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-sm"
          )}
        >
          {showAddForm ? 'Cancel' : <><Plus weight="bold" size={16} /> New Service Call</>}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Wrench weight="fill" className="text-indigo-500" /> Request Service
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location <span className="text-red-500">*</span></label>
              <select
                required
                value={newCall.locationId}
                onChange={e => setNewCall({ ...newCall, locationId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              >
                <option value="">Select a location...</option>
                {broker.locations?.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.location} ({loc.address})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={newCall.callDate}
                onChange={e => setNewCall({ ...newCall, callDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Machine</label>
              <select
                value={newCall.machine}
                onChange={e => setNewCall({ ...newCall, machine: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              >
                <option value="">Unknown / None</option>
                {MOCK_MACHINES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Issue Details</label>
              <textarea
                rows={3}
                placeholder="Describe the problem..."
                value={newCall.notes}
                onChange={e => setNewCall({ ...newCall, notes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {calls.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Check size={48} weight="light" className="text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900">No Service Calls</p>
            <p className="text-sm mt-1">You have no active or historical service calls.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Machine & Issue</th>
                  <th className="px-6 py-4">Resolution Notes</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calls.map(call => (
                  <tr key={call.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        {call.callDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{call.callLocation}</div>
                      <div className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate" title={call.address}>{call.address}</div>
                    </td>
                    <td className="px-6 py-4 min-w-[250px]">
                      {call.machine?.length > 0 && (
                        <div className="mb-1 flex gap-1 flex-wrap">
                          {call.machine.map(m => (
                            <span key={m} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-medium">{m}</span>
                          ))}
                        </div>
                      )}
                      <div className="text-slate-600 line-clamp-2" title={call.notes}>
                        {call.notes || <span className="text-slate-400 italic">No notes provided</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-[250px] text-slate-600">
                      {call.resolutionNotes ? (
                        <span className="line-clamp-2" title={call.resolutionNotes}>{call.resolutionNotes}</span>
                      ) : (
                        <span className="text-slate-400 italic">Pending resolution...</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                        STATUS_STYLES[call.status] || STATUS_STYLES['']
                      )}>
                        {call.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
