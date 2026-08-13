import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { fetchLocations, fetchFinances, updateBrokerAuth, upsertFinance } from '../lib/api'
import { Lock, ArrowLeft, ShareNetwork, CalendarBlank } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { cn } from '../lib/utils'
import BrokerServiceCalls from './BrokerServiceCalls'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKS = ['w1', 'w2', 'w3', 'w4', 'w5']

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
  const [auth, setAuth] = useState(() => localStorage.getItem(`brokerAuth_${brokerId}`) === 'true')
  const [pinInput, setPinInput] = useState('')

  // State for Year and Tabs
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(Math.max(2026, currentYear))
  const [activeTab, setActiveTab] = useState('YTD') // 'YTD' or month index 0-11
  const [mainTab, setMainTab] = useState('finance') // 'finance' or 'service'

  // Dynamic years list from 2026 to currentYear + 1
  const years = Array.from({ length: Math.max(2, (currentYear + 2) - 2026) }, (_, i) => 2026 + i)

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
      localStorage.setItem(`brokerAuth_${brokerId}`, 'true')
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

  const handleCellChange = async (locId, monthStr, weekKey, newValue) => {
    const existingIndex = finances.findIndex(f => f.location_id === locId && f.month === monthStr)
    let newFinances = [...finances]
    let record = { broker_id: brokerId, location_id: locId, month: monthStr, w1:0, w2:0, w3:0, w4:0, w5:0, amount:0 }
    
    if (existingIndex >= 0) {
      record = { ...newFinances[existingIndex] }
    } else {
      newFinances.push(record)
    }

    record[weekKey] = newValue
    record.amount = WEEKS.reduce((sum, w) => sum + (Number(record[w]) || 0), 0)
    
    if (existingIndex >= 0) {
      newFinances[existingIndex] = record
    }
    
    setFinances(newFinances)

    try {
      await upsertFinance(record)
    } catch (e) {
      console.error(e)
      toast.error('Failed to save cell')
    }
  }

  // Auth gate
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

  const locations = broker.locations || []
  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  const getMonthStr = (monthIdx) => `${selectedYear}-${String(monthIdx + 1).padStart(2, '0')}`
  const getRecord = (locId, monthStr) => finances.find(f => f.location_id === locId && f.month === monthStr) || {}
  const getAmount = (locId, monthStr) => Number(getRecord(locId, monthStr).amount || 0)
  
  // -- View Renderers --
  const renderYtdView = () => {
    return (
      <div className="max-w-none min-w-full bg-white border-x border-b border-slate-200 rounded-b-2xl rounded-tr-2xl shadow-sm mt-0 flex-1 overflow-auto">
        <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-bold tracking-wider uppercase text-xs">
            <tr>
              <th className="px-6 py-4 border-r border-b border-slate-200 sticky left-0 top-0 bg-slate-50 z-30 shadow-[1px_1px_0_0_#e2e8f0]">Location</th>
              {MONTH_NAMES.map((name, i) => (
                <th key={name} className="px-4 py-4 border-r border-b border-slate-200 text-right bg-slate-50 sticky top-0 z-20 shadow-[0_1px_0_0_#e2e8f0]">{name}</th>
              ))}
              <th className="px-6 py-4 text-right text-indigo-700 bg-indigo-50/90 border-b border-slate-200 sticky right-0 top-0 z-30 backdrop-blur-sm shadow-[-1px_1px_0_0_#e2e8f0]">YTD Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {locations.map(loc => {
              const ytdTotal = MONTH_NAMES.reduce((sum, _, i) => sum + getAmount(loc.id, getMonthStr(i)), 0)
              return (
                <tr key={loc.id} className="hover:bg-slate-50/50 group">
                  <td className="px-6 py-4 font-medium text-slate-900 border-r border-slate-200 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[1px_0_0_0_#e2e8f0]">
                    {loc.location}
                    <div className="text-xs text-slate-400 font-normal mt-0.5">{loc.address}</div>
                  </td>
                  {MONTH_NAMES.map((_, i) => (
                    <td key={i} className="px-4 py-4 text-right text-slate-600 border-r border-slate-100 tabular-nums">
                      {formatCurrency(getAmount(loc.id, getMonthStr(i)))}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right font-bold text-slate-900 bg-indigo-50/40 tabular-nums border-l border-slate-200 sticky right-0 z-10 backdrop-blur-sm shadow-[-1px_0_0_0_#e2e8f0]">
                    {formatCurrency(ytdTotal)}
                  </td>
                </tr>
              )
            })}
            
            {/* Grand Totals */}
            <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
              <td className="px-6 py-4 text-right border-r border-slate-200 sticky left-0 bg-slate-50 z-20 shadow-[1px_0_0_0_#e2e8f0]">
                Monthly Totals
              </td>
              {MONTH_NAMES.map((_, i) => {
                const monthTotal = locations.reduce((sum, loc) => sum + getAmount(loc.id, getMonthStr(i)), 0)
                return (
                  <td key={i} className="px-4 py-4 text-right text-slate-900 border-r border-slate-200 tabular-nums">
                    {formatCurrency(monthTotal)}
                  </td>
                )
              })}
              <td className="px-6 py-4 text-right text-indigo-700 bg-indigo-100 tabular-nums text-base border-l border-slate-200 sticky right-0 z-20 shadow-[-1px_0_0_0_#e2e8f0]">
                {formatCurrency(locations.reduce((overall, loc) => overall + MONTH_NAMES.reduce((sum, _, i) => sum + getAmount(loc.id, getMonthStr(i)), 0), 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  const getWeekRange = (year, monthIdx, weekIdx) => {
    const ranges = ["1st-7th", "8th-14th", "15th-21st", "22nd-28th"]
    if (weekIdx < 4) return ranges[weekIdx]
    const lastDay = new Date(year, monthIdx + 1, 0).getDate()
    if (lastDay < 29) return "N/A"
    return `29th-${lastDay}th`
  }

  const renderMonthView = (monthIdx) => {
    const monthStr = getMonthStr(monthIdx)
    return (
      <div className="max-w-[1200px] bg-white border-x border-b border-slate-200 rounded-b-2xl rounded-tr-2xl shadow-sm mt-0 flex-1 overflow-auto">
        <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-bold tracking-wider uppercase text-xs">
            <tr>
              <th className="px-6 py-4 border-r border-b border-slate-200 sticky left-0 top-0 bg-slate-50 z-30 shadow-[1px_1px_0_0_#e2e8f0]">Location</th>
              {WEEKS.map((w, i) => (
                <th key={w} className="px-4 py-4 border-r border-b border-slate-200 text-center bg-slate-50 sticky top-0 z-20 shadow-[0_1px_0_0_#e2e8f0]">
                  <div className="text-slate-400 mb-0.5 text-[10px]">Week {i+1}</div>
                  <div className="text-slate-800">{getWeekRange(selectedYear, monthIdx, i)}</div>
                </th>
              ))}
              <th className="px-6 py-4 text-right text-indigo-700 bg-indigo-50/90 border-b border-slate-200 align-bottom sticky right-0 top-0 z-30 backdrop-blur-sm shadow-[-1px_1px_0_0_#e2e8f0]">Month Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {locations.map(loc => {
              const record = getRecord(loc.id, monthStr)
              return (
                <tr key={loc.id} className="hover:bg-slate-50/50 group">
                  <td className="px-6 py-4 font-medium text-slate-900 border-r border-slate-200 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[1px_0_0_0_#e2e8f0]">
                    {loc.location}
                    <div className="text-xs text-slate-400 font-normal mt-0.5">{loc.address}</div>
                  </td>
                  {WEEKS.map((w) => (
                    <td key={w} className="p-1 border-r border-slate-100 bg-white group-hover:bg-slate-50/50">
                      <EditableCell 
                        value={record[w]} 
                        onChange={(val) => handleCellChange(loc.id, monthStr, w, val)} 
                      />
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right font-bold text-slate-900 bg-indigo-50/40 tabular-nums border-l border-slate-200 sticky right-0 z-10 backdrop-blur-sm shadow-[-1px_0_0_0_#e2e8f0]">
                    {formatCurrency(record.amount || 0)}
                  </td>
                </tr>
              )
            })}
            
            {/* Grand Totals */}
            <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
              <td className="px-6 py-4 text-right border-r border-slate-200 sticky left-0 bg-slate-50 z-20 shadow-[1px_0_0_0_#e2e8f0]">
                Totals
              </td>
              {WEEKS.map((w) => {
                const weekTotal = locations.reduce((sum, l) => sum + Number(getRecord(l.id, monthStr)[w] || 0), 0)
                return (
                  <td key={w} className="px-4 py-4 text-right text-slate-600 border-r border-slate-200 tabular-nums">
                    {formatCurrency(weekTotal)}
                  </td>
                )
              })}
              <td className="px-6 py-4 text-right text-indigo-700 bg-indigo-100 tabular-nums text-base border-l border-slate-200 sticky right-0 z-20 shadow-[-1px_0_0_0_#e2e8f0]">
                {formatCurrency(locations.reduce((overall, l) => overall + Number(getRecord(l.id, monthStr).amount || 0), 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          {!token && (
            <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <ArrowLeft size={20} weight="bold" />
            </Link>
          )}
          <h1 className="text-xl font-bold text-slate-900 mr-4">{broker.name}</h1>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setMainTab('finance')}
              className={cn("px-4 py-1.5 text-sm font-semibold rounded-md transition-colors", mainTab === 'finance' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900")}
            >
              Finances
            </button>
            <button
              onClick={() => setMainTab('service')}
              className={cn("px-4 py-1.5 text-sm font-semibold rounded-md transition-colors", mainTab === 'service' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900")}
            >
              Service Calls
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <CalendarBlank size={16} />
            </div>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="pl-9 pr-10 py-1.5 bg-slate-100 border-transparent rounded-lg text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer outline-none"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          {!token && (
            <button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100">
              <ShareNetwork size={16} weight="bold" /> Share Link
            </button>
          )}
        </div>
      </header>

      {mainTab === 'finance' ? (
        <main className="flex-1 flex flex-col p-6 min-h-0">
        <div className="flex space-x-1 mb-0 border-b border-slate-200 pb-[1px] flex-shrink-0">
          <button
            onClick={() => setActiveTab('YTD')}
            className={cn(
              "px-5 py-2.5 text-sm font-bold rounded-t-xl transition-all mb-[-1px] border border-transparent",
              activeTab === 'YTD'
                ? "bg-white text-indigo-600 border-slate-200 border-b-white shadow-[0_-2px_10px_rgba(0,0,0,0.02)] relative z-10"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            YTD {selectedYear}
          </button>
          {MONTH_NAMES.map((name, idx) => (
            <button
              key={name}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all mb-[-1px] border border-transparent",
                activeTab === idx
                  ? "bg-white text-indigo-600 border-slate-200 border-b-white shadow-[0_-2px_10px_rgba(0,0,0,0.02)] relative z-10"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
            >
              {name}
            </button>
          ))}
        </div>
        
        <div className="flex-1 min-h-0 flex flex-col">
          {activeTab === 'YTD' ? renderYtdView() : renderMonthView(activeTab)}
        </div>
        </main>
      ) : (
        <main className="flex-1 overflow-auto">
          <BrokerServiceCalls broker={broker} />
        </main>
      )}
    </div>
  )
}
