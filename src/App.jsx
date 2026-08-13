import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { ClipboardText, MapPin, Lock } from '@phosphor-icons/react'
import ServiceCallsTab from './components/ServiceCallsTab'
import LocationsTab from './components/LocationsTab'
import FinanceView from './components/FinanceView'
import { fetchServiceCalls, pushServiceCalls, fetchLocations, pushBrokers } from './lib/api'
import { INITIAL_CALLS, INITIAL_BROKERS, flatRowsToBrokers, brokersToFlatRows } from './lib/data'
import { cn } from './lib/utils'

const TABS = [
  { id: 'calls', label: 'Service Calls', Icon: ClipboardText },
  { id: 'locations', label: 'Locations DB', Icon: MapPin },
]

function MainApp() {
  const [activeTab, setActiveTab] = useState('calls')
  const [calls, setCalls] = useState([])
  const [brokers, setBrokers] = useState([])
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState(() => localStorage.getItem('adminAuth') === 'true')
  const [pinInput, setPinInput] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [cData, bData] = await Promise.all([fetchServiceCalls(), fetchLocations()])
        setCalls(cData || [])
        setBrokers(bData || [])
      } catch (err) {
        console.error('Failed to load from Supabase:', err)
        toast.error('Could not connect to database.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const saveCalls = async (updated) => {
    setCalls(updated)
    try {
      await pushServiceCalls(updated)
      toast.success('Service calls saved to Supabase!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to save to Supabase.')
    }
  }

  const saveBrokers = async (updated) => {
    setBrokers([...updated])
    try {
      await pushBrokers(updated)
      toast.success('Brokers & locations saved to Supabase!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to save brokers.')
    }
  }

  const handleAuth = (e) => {
    e.preventDefault()
    if (pinInput === '1234') {
      setAuth(true)
      localStorage.setItem('adminAuth', 'true')
    } else {
      toast.error('Incorrect Admin PIN')
      setPinInput('')
    }
  }

  if (!auth) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <form onSubmit={handleAuth} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={24} weight="fill" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Admin Login</h2>
          <p className="text-sm text-slate-500 mb-6">Enter Admin PIN to view dashboard.</p>
          <input
            type="password"
            autoFocus
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            placeholder="Enter PIN"
            className="w-full text-center text-2xl tracking-widest px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 mb-4"
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Unlock Dashboard
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Service Calls Tracker
            </h1>
          </div>

          <nav className="flex bg-slate-100 p-1 rounded-lg">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-md transition-colors',
                  activeTab === id
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                )}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[1600px] w-full mx-auto px-6 py-6 flex-1 flex flex-col overflow-hidden min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm gap-3">
            <svg className="animate-spin h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading from Database…
          </div>
        ) : (
          <>
            {activeTab === 'calls' && (
              <ServiceCallsTab calls={calls} brokers={brokers} onSave={saveCalls} />
            )}
            {activeTab === 'locations' && (
              <div className="flex-1 overflow-y-auto pb-12">
                <LocationsTab brokers={brokers} onSave={saveBrokers} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/broker/:id/finance" element={<FinanceView />} />
      </Routes>
    </BrowserRouter>
  )
}
