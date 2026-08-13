import { useState, useEffect, useCallback, useRef } from 'react'
import { Toaster, toast } from 'sonner'
import { ClipboardText, MapPin } from '@phosphor-icons/react'
import ServiceCallsTab from './components/ServiceCallsTab'
import LocationsTab from './components/LocationsTab'
import { fetchServiceCalls, pushServiceCalls, fetchLocations, pushLocations } from './lib/api'
import { INITIAL_CALLS, INITIAL_BROKERS, flatRowsToBrokers, brokersToFlatRows } from './lib/data'
import { cn } from './lib/utils'

const TABS = [
  { id: 'calls', label: 'Service Calls', Icon: ClipboardText },
  { id: 'locations', label: 'Locations DB', Icon: MapPin },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('calls')
  const [calls, setCalls] = useState(INITIAL_CALLS)
  const [brokers, setBrokers] = useState(INITIAL_BROKERS)
  const [loading, setLoading] = useState(true)

  const callsTimerRef = useRef(null)
  const locTimerRef = useRef(null)

  // ── Load from cloud on mount ──────────────────────────────
  useEffect(() => {
    async function load() {
      // Load locations first (needed for dropdown)
      try {
        const stored = localStorage.getItem('brokersData')
        if (stored) setBrokers(JSON.parse(stored))
        const rows = await fetchLocations()
        if (rows) {
          const b = flatRowsToBrokers(rows)
          setBrokers(b)
          localStorage.setItem('brokersData', JSON.stringify(b))
        }
      } catch { /* use initial */ }

      // Load service calls
      try {
        const data = await fetchServiceCalls()
        if (data && !data.error) setCalls(data)
      } catch { /* use initial */ }

      setLoading(false)
    }
    load()
  }, [])

  // ── Save calls (debounced) ────────────────────────────────
  const saveCalls = useCallback((newCalls) => {
    setCalls(newCalls)
    if (callsTimerRef.current) clearTimeout(callsTimerRef.current)
    callsTimerRef.current = setTimeout(async () => {
      try {
        await pushServiceCalls(newCalls)
        toast.success('Saved to Google Sheets')
      } catch {
        toast.error('Failed to sync — changes saved locally')
      }
    }, 1200)
  }, [])

  // ── Save brokers (debounced) ──────────────────────────────
  const saveBrokers = useCallback((newBrokers) => {
    setBrokers(newBrokers)
    localStorage.setItem('brokersData', JSON.stringify(newBrokers))
    if (locTimerRef.current) clearTimeout(locTimerRef.current)
    locTimerRef.current = setTimeout(async () => {
      try {
        await pushLocations(brokersToFlatRows(newBrokers))
        toast.success('Locations saved to Google Sheets')
      } catch {
        toast.error('Failed to sync locations')
      }
    }, 1200)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Toaster position="bottom-right" richColors closeButton />

      {/* ── Header ───────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Service Calls Tracker
            </h1>
          </div>

          {/* Tabs */}
          <nav className="flex gap-2">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200',
                  activeTab === id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 bg-white'
                )}
              >
                <Icon size={16} weight={activeTab === id ? 'fill' : 'regular'} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────── */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm gap-3">
            <svg className="animate-spin h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading from Google Sheets…
          </div>
        ) : (
          <>
            {activeTab === 'calls' && (
              <ServiceCallsTab calls={calls} brokers={brokers} onSave={saveCalls} />
            )}
            {activeTab === 'locations' && (
              <LocationsTab brokers={brokers} onSave={saveBrokers} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
