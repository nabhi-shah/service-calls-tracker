import { useState, useEffect } from 'react'
import { fetchServiceCalls, fetchLocations, pushServiceCalls, deleteServiceCall } from '../lib/api'
import ServiceCallsTab from './ServiceCallsTab'
import { ClipboardText } from '@phosphor-icons/react'
import { toast } from 'sonner'

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

  const saveCalls = async (updated) => {
    setCalls(updated)
    try {
      await pushServiceCalls(updated)
      toast.success('Service calls saved to Cloud!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to save.')
    }
  }

  const deleteCall = async (id) => {
    try {
      await deleteServiceCall(id)
      setCalls(prev => prev.filter(c => c.id !== id))
      toast.success('Service call deleted!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete service call.')
    }
  }

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-3 py-2 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center sm:justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-900">
            <ClipboardText size={24} weight="bold" className="text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-center sm:text-left">Service Calls Tracker (Shared View)</h1>
          </div>
        </div>
      </header>
      <main className="max-w-[1600px] w-full mx-auto px-2 py-3 sm:px-6 sm:py-6 flex-1 flex flex-col overflow-hidden min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm gap-3">
            Loading database...
          </div>
        ) : (
          <ServiceCallsTab calls={calls} brokers={brokers} onSave={saveCalls} onDelete={deleteCall} readOnly={false} />
        )}
      </main>
    </div>
  )
}
