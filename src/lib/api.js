import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Helpers ────────────────────────────────────────────────
const mapCallToFrontend = (c) => ({
  id: c.id, srNo: c.sr_no || '', callDate: c.call_date || '', locationId: c.location_id,
  resolutionDate: c.resolution_date || '', resolutionNotes: c.resolution_notes || '',
  status: c.status || '', parts: c.parts || [], machine: c.machine || [], notes: c.notes || '',
  // We attach joined data back if available:
  callLocation: c.locations?.location || '',
  address: [c.locations?.address, c.locations?.town].filter(Boolean).join(', '),
  broker: c.locations?.brokers?.name || '',
  brokerContact: c.locations?.brokers?.phone || '',
  locationContact: c.locations?.contact_no || ''
})

const mapCallToDb = (c) => ({
  id: c.id, sr_no: c.srNo, call_date: c.callDate, location_id: c.locationId || null,
  resolution_date: c.resolutionDate, resolution_notes: c.resolutionNotes,
  status: c.status, parts: c.parts, machine: c.machine, notes: c.notes
})

const mapLocToFrontend = (l) => ({
  id: l.id, location: l.location, licenseNo: l.license_no || '',
  coams: l.coams || '', address: l.address || '', town: l.town || '', contactNo: l.contact_no || ''
})

const mapLocToDb = (l, brokerId) => ({
  id: l.id, broker_id: brokerId, location: l.location, license_no: l.licenseNo,
  coams: String(l.coams), address: l.address, town: l.town, contact_no: l.contactNo
})

// ── Service Calls ──────────────────────────────────────────
export async function fetchServiceCalls() {
  const { data, error } = await supabase
    .from('service_calls')
    .select('*, locations(*, brokers(*))')
    .order('id', { ascending: true })
  
  if (error) throw error
  return data.map(mapCallToFrontend)
}

export async function pushServiceCalls(calls) {
  const dbCalls = calls.map(mapCallToDb)
  const { error } = await supabase
    .from('service_calls')
    .upsert(dbCalls, { onConflict: 'id' })
  
  if (error) throw error
}

export async function deleteServiceCall(id) {
  const { error } = await supabase.from('service_calls').delete().eq('id', id)
  if (error) throw error
}

export async function fetchBrokerServiceCalls(brokerId) {
  const { data, error } = await supabase
    .from('service_calls')
    .select('*, locations!inner(*, brokers(*))')
    .eq('locations.broker_id', brokerId)
    .order('id', { ascending: false })
  
  if (error) throw error
  return data.map(mapCallToFrontend)
}

export async function insertBrokerServiceCall(callFrontend) {
  const dbCall = mapCallToDb(callFrontend)
  delete dbCall.id
  const { data, error } = await supabase
    .from('service_calls')
    .insert(dbCall)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ── Brokers & Locations ───────────────────────────────────
export async function fetchLocations() {
  const { data: brokers, error: brokerError } = await supabase
    .from('brokers')
    .select('*, locations(*)')
    .order('id', { ascending: true })

  if (brokerError) throw brokerError
  return brokers.map(b => ({
    id: b.id, name: b.name, phone: b.phone || '',
    pin: b.pin || null, shareToken: b.share_token || null,
    locations: (b.locations || []).map(mapLocToFrontend).sort((a, b) => a.id - b.id)
  }))
}

export async function pushBrokers(brokers) {
  for (const broker of brokers) {
    const { locations, pin, shareToken, ...brokerData } = broker
    
    // Upsert broker
    const { data: savedBroker, error: bError } = await supabase
      .from('brokers')
      .upsert({ ...brokerData, pin, share_token: shareToken }, { onConflict: 'id' })
      .select()
      .single()

    if (bError) throw bError

    // Upsert its locations
    if (locations && locations.length > 0) {
      const locsWithBrokerId = locations.map(l => mapLocToDb(l, savedBroker.id))
      const { error: lError } = await supabase
        .from('locations')
        .upsert(locsWithBrokerId, { onConflict: 'id' })
        
      if (lError) throw lError
    }
  }
}

export async function deleteBroker(id) {
  // Cascades to locations based on schema setup
  const { error } = await supabase.from('brokers').delete().eq('id', id)
  if (error) throw error
}

export async function deleteLocation(id) {
  const { error } = await supabase.from('locations').delete().eq('id', id)
  if (error) throw error
}

// ── Finances ──────────────────────────────────────────────
export async function fetchFinances(brokerId) {
  const { data, error } = await supabase
    .from('finances')
    .select('*')
    .eq('broker_id', brokerId)
  
  if (error) throw error
  return data
}

export async function upsertFinance(financeData) {
  const { error } = await supabase
    .from('finances')
    .upsert(financeData, { onConflict: 'broker_id, location_id, month' })
    
  if (error) throw error
}

export async function updateBrokerAuth(brokerId, pin, shareToken) {
  const { error } = await supabase
    .from('brokers')
    .update({ pin, share_token: shareToken })
    .eq('id', brokerId)
  
  if (error) throw error
}
