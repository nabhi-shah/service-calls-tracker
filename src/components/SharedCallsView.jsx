import { useState, useEffect } from 'react'
import { fetchServiceCalls, fetchLocations } from '../lib/api'
import ServiceCallsTab from './ServiceCallsTab'
import { ClipboardText } from '@phosphor-icons/react'

export default function SharedCallsView() {
  const [calls, setCalls] = useState([])
  const [brokers, setBrokers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [cData, bData] = await Promise.all([fetchServiceCalls(), fetchLocations()])
        setCalls(cData || [])
        setBrokers(bData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900">
            <ClipboardText size={24} weight="bold" className="text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight">Service Calls Tracker (Shared View)</h1>
          </div>
        </div>
      </header>
      <main className="max-w-[1600px] w-full mx-auto px-6 py-6 flex-1 flex flex-col overflow-hidden min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm gap-3">
            Loading database...
          </div>
        ) : (
          <ServiceCallsTab calls={calls} brokers={brokers} readOnly={true} />
        )}
      </main>
    </div>
  )
}
