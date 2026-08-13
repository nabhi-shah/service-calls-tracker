import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { fetchLocations, fetchFinances, updateBrokerAuth } from '../lib/api'
import { Lock, ArrowLeft, ShareNetwork, Key } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { cn } from '../lib/utils'

const MONTHS = [
  { key: '2026-06', label: 'Jun 2026' },
  { key: '2026-07', label: 'Jul 2026' },
  { key: '2026-08', label: 'Aug 2026' },
]

export default function FinanceView() {
  const { id } = useParams()
  const brokerId = parseInt(id)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [broker, setBroker] = useState(null)
  const [finances, setFinances] = useState([])
  const [auth, setAuth] = useState(false)
  const [pinInput, setPinInput] = useState('')

  useEffect(() => {
    loadData()
  }, [brokerId])

  async function loadData() {
    setLoading(true)
    try {
      const locs = await fetchLocations()
      const b = locs.find(x => x.id === brokerId)
      if (b) {
        setBroker(b)
        // Check Auth
        if (!b.pin || (token && b.shareToken === token)) {
          setAuth(true)
        }
      }
      
      const fin = await fetchFinances(brokerId)
      setFinances(fin)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load finances.')
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = (e) => {
    e.preventDefault()
    if (pinInput === broker?.pin) {
      setAuth(true)
    } else {
      toast.error('Incorrect PIN')
      setPinInput('')
    }
  }

  const handleShare = async () => {
    try {
      let newToken = broker.shareToken
      if (!newToken) {
        newToken = uuidv4()
        await updateBrokerAuth(brokerId, broker.pin, newToken)
        setBroker({ ...broker, shareToken: newToken })
      }
      const url = `${window.location.origin}/broker/${brokerId}/finance?token=${newToken}`
      await navigator.clipboard.writeText(url)
      toast.success('Shareable link copied to clipboard!')
    } catch (e) {
      toast.error('Failed to generate link')
    }
  }

  const handleSetPin = async () => {
    const newPin = prompt('Enter a new 4-digit PIN for this broker:')
    if (newPin) {
      try {
        await updateBrokerAuth(brokerId, newPin, broker.shareToken)
        setBroker({ ...broker, pin: newPin })
        toast.success('PIN updated!')
      } catch (e) {
        toast.error('Failed to update PIN')
      }
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>
  if (!broker) return <div className="p-8 text-center text-red-500">Broker not found</div>

  if (!auth) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <form onSubmit={handleAuth} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={24} weight="fill" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{broker.name} Finances</h2>
          <p className="text-sm text-slate-500 mb-6">Enter PIN to view financial records.</p>
          <input
            type="password"
            autoFocus
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            placeholder="Enter PIN"
            className="w-full text-center text-2xl tracking-widest px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 mb-4"
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Unlock
          </button>
        </form>
      </div>
    )
  }

  // Calculate grid data
  const locations = broker.locations
  
  const getAmount = (locId, monthKey) => {
    const record = finances.find(f => f.location_id === locId && f.month === monthKey)
    return record ? Number(record.amount) : 0
  }

  const getYTD = (locId) => {
    return MONTHS.reduce((sum, m) => sum + getAmount(locId, m.key), 0)
  }

  const getMonthTotal = (monthKey) => {
    return locations.reduce((sum, l) => sum + getAmount(l.id, monthKey), 0)
  }

  const getGrandTotal = () => {
    return locations.reduce((sum, l) => sum + getYTD(l.id), 0)
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft size={20} weight="bold" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">{broker.name} - Finance Report</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSetPin} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
            <Key size={16} /> Set PIN
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100">
            <ShareNetwork size={16} weight="bold" /> Share Link
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-[1200px] mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold tracking-wider uppercase text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 border-r border-slate-100">Location</th>
                  {MONTHS.map(m => (
                    <th key={m.key} className="px-6 py-4 text-right border-r border-slate-100">{m.label}</th>
                  ))}
                  <th className="px-6 py-4 text-right text-indigo-600 bg-indigo-50/30">YTD Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locations.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900 border-r border-slate-100">
                      {loc.location}
                      <div className="text-xs text-slate-400 font-normal mt-0.5">{loc.address}</div>
                    </td>
                    {MONTHS.map(m => (
                      <td key={m.key} className="px-6 py-4 text-right text-slate-600 border-r border-slate-100 tabular-nums">
                        {formatCurrency(getAmount(loc.id, m.key))}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right font-bold text-slate-900 bg-indigo-50/10 tabular-nums">
                      {formatCurrency(getYTD(loc.id))}
                    </td>
                  </tr>
                ))}
                
                {/* Grand Totals */}
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                  <td className="px-6 py-4 text-right border-r border-slate-200">Total Revenue</td>
                  {MONTHS.map(m => (
                    <td key={m.key} className="px-6 py-4 text-right text-slate-900 border-r border-slate-200 tabular-nums">
                      {formatCurrency(getMonthTotal(m.key))}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right text-indigo-700 bg-indigo-100 tabular-nums text-base">
                    {formatCurrency(getGrandTotal())}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
