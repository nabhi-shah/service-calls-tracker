import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { fetchLocations, fetchFinances, updateBrokerAuth, upsertFinance } from '../lib/api'
import { Lock, ArrowLeft, ShareNetwork } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { cn } from '../lib/utils'

const MONTHS = [
  { key: '2026-06', label: 'Jun 2026', weeks: 4 }, // June had 4 weeks in excel
  { key: '2026-07', label: 'Jul 2026', weeks: 4 }, // July had 4 weeks in excel
  { key: '2026-08', label: 'Aug 2026', weeks: 5 }, // August had 5 weeks in excel
]

function EditableCell({ value, onChange }) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={e => {
        const val = parseFloat(e.currentTarget.innerText.replace(/[^0-9.-]+/g,""))
        onChange(isNaN(val) ? 0 : val)
      }}
      className="outline-none rounded px-2 py-1 text-slate-700 hover:bg-slate-100 focus:bg-indigo-50 focus:ring-1 focus:ring-indigo-300 transition-colors cursor-text tabular-nums text-right min-w-[60px]"
    >
      {value || '0'}
    </div>
  )
}

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

  const handleCellChange = async (locId, monthKey, weekKey, newValue) => {
    const existingIndex = finances.findIndex(f => f.location_id === locId && f.month === monthKey)
    let newFinances = [...finances]
    let record = { broker_id: brokerId, location_id: locId, month: monthKey, w1:0, w2:0, w3:0, w4:0, w5:0, amount:0 }
    
    if (existingIndex >= 0) {
      record = { ...newFinances[existingIndex] }
    } else {
      newFinances.push(record)
    }

    record[weekKey] = newValue
    
    // Auto calculate amount (Month Total)
    record.amount = (Number(record.w1)||0) + (Number(record.w2)||0) + (Number(record.w3)||0) + (Number(record.w4)||0) + (Number(record.w5)||0)
    
    if (existingIndex >= 0) {
      newFinances[existingIndex] = record
    }
    
    setFinances(newFinances)

    // Save to DB
    try {
      await upsertFinance(record)
    } catch (e) {
      console.error(e)
      toast.error('Failed to save cell')
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

  const locations = broker.locations
  
  const getRecord = (locId, monthKey) => finances.find(f => f.location_id === locId && f.month === monthKey) || {}
  const getAmount = (locId, monthKey) => Number(getRecord(locId, monthKey).amount || 0)
  const getYTD = (locId) => MONTHS.reduce((sum, m) => sum + getAmount(locId, m.key), 0)
  
  const getColTotal = (monthKey, weekKey) => {
    return locations.reduce((sum, l) => sum + Number(getRecord(l.id, monthKey)[weekKey] || 0), 0)
  }
  const getMonthTotal = (monthKey) => locations.reduce((sum, l) => sum + getAmount(l.id, monthKey), 0)
  const getGrandTotal = () => locations.reduce((sum, l) => sum + getYTD(l.id), 0)

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
          <button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100">
            <ShareNetwork size={16} weight="bold" /> Share Link
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-none inline-block min-w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-bold tracking-wider uppercase text-xs">
              <tr>
                <th className="px-6 py-4 border-r border-b border-slate-200 sticky left-0 bg-slate-50 z-10" rowSpan={2}>Location</th>
                {MONTHS.map(m => (
                  <th key={m.key} className="px-4 py-2 border-r border-b border-slate-200 text-center bg-slate-100 text-slate-700" colSpan={m.weeks + 1}>
                    {m.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-right text-indigo-700 bg-indigo-50/50 border-b border-slate-200" rowSpan={2}>YTD Total</th>
              </tr>
              <tr>
                {MONTHS.map(m => (
                  <td key={'sub'+m.key} className="p-0 border-r border-b border-slate-200">
                    <div className="flex w-full">
                      {Array.from({length: m.weeks}).map((_, i) => (
                        <div key={i} className="flex-1 min-w-[80px] px-3 py-2 text-right border-r border-slate-200 last:border-0 bg-slate-50">
                          W{i+1}
                        </div>
                      ))}
                      <div className="flex-1 min-w-[100px] px-3 py-2 text-right bg-slate-100/50 font-bold border-l border-slate-200">
                        Total
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locations.map(loc => (
                <tr key={loc.id} className="hover:bg-slate-50/50 group">
                  <td className="px-6 py-4 font-medium text-slate-900 border-r border-slate-200 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[1px_0_0_0_#e2e8f0]">
                    {loc.location}
                    <div className="text-xs text-slate-400 font-normal mt-0.5">{loc.address}</div>
                  </td>
                  {MONTHS.map(m => {
                    const record = getRecord(loc.id, m.key)
                    return (
                      <td key={m.key} className="p-0 border-r border-slate-200">
                        <div className="flex w-full h-full items-stretch">
                          {Array.from({length: m.weeks}).map((_, i) => {
                            const wKey = `w${i+1}`
                            return (
                              <div key={wKey} className="flex-1 min-w-[80px] border-r border-slate-100 last:border-0 flex items-center justify-end px-1">
                                <EditableCell 
                                  value={record[wKey]} 
                                  onChange={(val) => handleCellChange(loc.id, m.key, wKey, val)} 
                                />
                              </div>
                            )
                          })}
                          <div className="flex-1 min-w-[100px] px-3 py-4 text-right bg-slate-50/50 font-semibold border-l border-slate-200 text-slate-700 tabular-nums">
                            {formatCurrency(record.amount || 0)}
                          </div>
                        </div>
                      </td>
                    )
                  })}
                  <td className="px-6 py-4 text-right font-bold text-slate-900 bg-indigo-50/10 tabular-nums border-l border-slate-200">
                    {formatCurrency(getYTD(loc.id))}
                  </td>
                </tr>
              ))}
              
              {/* Grand Totals */}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                <td className="px-6 py-4 text-right border-r border-slate-200 sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                  Totals
                </td>
                {MONTHS.map(m => (
                  <td key={m.key} className="p-0 border-r border-slate-200">
                    <div className="flex w-full">
                      {Array.from({length: m.weeks}).map((_, i) => (
                        <div key={i} className="flex-1 min-w-[80px] px-3 py-4 text-right border-r border-slate-200 text-slate-600 last:border-0">
                          {formatCurrency(getColTotal(m.key, `w${i+1}`))}
                        </div>
                      ))}
                      <div className="flex-1 min-w-[100px] px-3 py-4 text-right bg-slate-100 border-l border-slate-200 text-slate-900">
                        {formatCurrency(getMonthTotal(m.key))}
                      </div>
                    </div>
                  </td>
                ))}
                <td className="px-6 py-4 text-right text-indigo-700 bg-indigo-100 tabular-nums text-base border-l border-slate-200">
                  {formatCurrency(getGrandTotal())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
