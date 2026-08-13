// ============================================================
//  LOCATIONS DB
// ============================================================

// Convert flat Google Sheet rows → nested broker structure
function flatRowsToBrokers(rows) {
  const map = {};
  const order = [];
  rows.forEach(r => {
    const bid = parseInt(r.brokerId);
    if (!map[bid]) {
      map[bid] = { id: bid, name: r.brokerName, phone: r.brokerPhone || '', locations: [] };
      order.push(bid);
    }
    map[bid].locations.push({
      id: parseInt(r.locId),
      location: r.location,
      licenseNo: r.licenseNo || '',
      coams: r.coams !== undefined ? r.coams : '',
      address: r.address || '',
      town: r.town || '',
      contactNo: r.contactNo || ''
    });
  });
  return order.map(id => map[id]);
}

// Convert nested broker structure → flat rows for Google Sheet
function brokersToFlatRows(brokers) {
  const rows = [];
  brokers.forEach(b => {
    b.locations.forEach(loc => {
      rows.push({
        brokerId: b.id,
        brokerName: b.name,
        brokerPhone: b.phone || '',
        locId: loc.id,
        location: loc.location,
        licenseNo: loc.licenseNo || '',
        coams: loc.coams !== undefined ? loc.coams : '',
        address: loc.address || '',
        town: loc.town || '',
        contactNo: loc.contactNo || ''
      });
    });
  });
  return rows;
}

const initialBrokers = [
  {
    id: 1,
    name: "Lucky 8 Games LLC (15284)",
    phone: "",
    locations: [
      { id: 101, location: "Royston Drive-in", licenseNo: "35535", coams: 2, address: "1267 Bowersville St", town: "Royston", contactNo: "" },
      { id: 102, location: "BP#1 -(000054116)", licenseNo: "54116", coams: 6, address: "4416 VETERANS PARKWAY", town: "COLUMBUS", contactNo: "" },
      { id: 103, location: "H&K Food Mart", licenseNo: "57118", coams: 8, address: "900 S Westover Blvd Ste D", town: "Albany", contactNo: "" },
      { id: 104, location: "Citgo At MLK", licenseNo: "61788", coams: 5, address: "1431 MLK Jr Blvd", town: "COLUMBUS", contactNo: "" },
      { id: 105, location: "Handee Mart", licenseNo: "62599", coams: 6, address: "3266 Cusseta Road", town: "Columbus", contactNo: "" },
      { id: 106, location: "Lucky 9", licenseNo: "67565", coams: 6, address: "1800 E Broad Ave", town: "Albany", contactNo: "" },
      { id: 107, location: "Kumar Food Store", licenseNo: "67891", coams: 6, address: "1770 Old Coffee Road", town: "Cecil", contactNo: "" },
      { id: 108, location: "BM Foods", licenseNo: "68234", coams: 6, address: "2650 Manchester Expwy", town: "Columbus", contactNo: "" },
      { id: 109, location: "Adiyogi 1 Business LLC / Chehar Maa", licenseNo: "68727/77938", coams: 8, address: "8045 Hwy 78", town: "Bremen", contactNo: "" },
      { id: 110, location: "Adiyogi 2 LLC", licenseNo: "68873", coams: 5, address: "904 B Pacific Ave", town: "Bremen", contactNo: "" },
      { id: 111, location: "Judys Herb & Tobacco", licenseNo: "77965", coams: 5, address: "10900 Commerce St Ste A", town: "Summerville", contactNo: "" },
      { id: 112, location: "Gas World 11", licenseNo: "70532", coams: 8, address: "114 Old Evens Rd", town: "Martinez", contactNo: "" },
      { id: 113, location: "12thAve BP", licenseNo: "71941", coams: 5, address: "1801 12th Ave", town: "COLUMBUS", contactNo: "" },
      { id: 114, location: "Shreeji Tifton Inc", licenseNo: "72891", coams: 8, address: "3131 US Hwy 41 S", town: "Tifton", contactNo: "" },
      { id: 115, location: "Junebugs Grocery", licenseNo: "73076", coams: 6, address: "1905 S Madison St Ste 1", town: "Albany", contactNo: "" },
      { id: 116, location: "Mahalakshmi 11 LLC", licenseNo: "75752", coams: 8, address: "1135 Farmers Rd", town: "Carrollton", contactNo: "" },
      { id: 117, location: "Neel 9619 llc/Reese", licenseNo: "75952", coams: 6, address: "2689 Reese Road", town: "Columbus", contactNo: "" },
      { id: 118, location: "Adkant", licenseNo: "77004", coams: 6, address: "902 W 16th Ave", town: "Cordele", contactNo: "" },
      { id: 119, location: "24/7 Minimart", licenseNo: "77934", coams: 6, address: "2234 Fort Benning Rd Ste B", town: "Columbus", contactNo: "" },
      { id: 120, location: "Tipco 3 LLC", licenseNo: "78452", coams: 5, address: "6011 Bethel Church rd", town: "Lizella", contactNo: "" },
      { id: 121, location: "Laundromat Near Me", licenseNo: "78502", coams: 4, address: "7465 Blackmon Lane Ste A", town: "Columbus", contactNo: "" },
      { id: 122, location: "Powder Springs food mart", licenseNo: "79712", coams: "", address: "44334 Austell powder springs rd ste 200", town: "Powder Springs", contactNo: "" }
    ]
  },
  {
    id: 2,
    name: "Nishit Bhai / Viraj",
    phone: "",
    locations: [
      { id: 201, location: "Mahalakshmi 11 LLC", licenseNo: "75752", coams: 9, address: "1135 Farmers High Road", town: "Carrollton", contactNo: "" },
      { id: 202, location: "Judys Herb & Tobacco", licenseNo: "69213", coams: 5, address: "10900 Commerce St Ste A", town: "Summerville", contactNo: "" },
      { id: 203, location: "Adkant", licenseNo: "77004", coams: 6, address: "902 W 16th Ave", town: "Cordele", contactNo: "" }
    ]
  },
  {
    id: 3,
    name: "Nishit Bhai / Shivsena",
    phone: "",
    locations: [
      { id: 301, location: "Adiyogi 1 Business LLC", licenseNo: "68727", coams: 8, address: "8045 Hwy 78", town: "Bremen", contactNo: "" },
      { id: 302, location: "Adiyogi 2 LLC", licenseNo: "68873", coams: 5, address: "904 B Pacific Ave", town: "Bremen", contactNo: "" }
    ]
  },
  {
    id: 4,
    name: "Platinum",
    phone: "",
    locations: [
      { id: 401, location: "BP#1 -(000054116)", licenseNo: "54116", coams: 6, address: "4416 VETERANS PARKWAY", town: "COLUMBUS", contactNo: "" },
      { id: 402, location: "BM Foods", licenseNo: "68234", coams: 6, address: "2650 Manchester Expwy", town: "Columbus", contactNo: "" },
      { id: 403, location: "Neel 9619 llc", licenseNo: "72916/75952", coams: "", address: "Reese Road", town: "Columbus", contactNo: "" }
    ]
  },
  {
    id: 5,
    name: "Viraj Shah",
    phone: "",
    locations: [
      { id: 501, location: "H&K Food Mart", licenseNo: "57118", coams: 8, address: "900 S Westover Blvd Ste D", town: "Albany", contactNo: "" },
      { id: 502, location: "Citgo At MLK", licenseNo: "61788", coams: 5, address: "1431 MLK Jr Blvd", town: "COLUMBUS", contactNo: "" },
      { id: 503, location: "Shreeji Tifton Inc", licenseNo: "72891", coams: 8, address: "3131 US Hwy 41 S", town: "Tifton", contactNo: "" },
      { id: 504, location: "MMM Sandhu Inc.", licenseNo: "62599", coams: 6, address: "3266 Cusseta Road", town: "Columbus", contactNo: "" },
      { id: 505, location: "Junebugs Grocery", licenseNo: "73076", coams: 2, address: "1905 S Madison St Ste 1", town: "Albany", contactNo: "" },
      { id: 506, location: "24/7 Minimart", licenseNo: "77934", coams: 6, address: "2234 Fort Benning Rd Ste B", town: "Columbus", contactNo: "" }
    ]
  },
  {
    id: 6,
    name: "Lucky 8 Games",
    phone: "",
    locations: [
      { id: 601, location: "Royston Drive-in", licenseNo: "35535", coams: 2, address: "1267 Bowersville St", town: "Royston", contactNo: "" },
      { id: 602, location: "Kumar Food Store", licenseNo: "67891", coams: 6, address: "1770 Old Coffee Road", town: "Cecil", contactNo: "" },
      { id: 603, location: "Gas World 11", licenseNo: "70532", coams: 6, address: "114 Old Evens Rd", town: "Martinez", contactNo: "" },
      { id: 604, location: "12thAve BP", licenseNo: "71941", coams: 5, address: "1801 12th Ave", town: "COLUMBUS", contactNo: "" },
      { id: 605, location: "Lucky 9", licenseNo: "67565", coams: 6, address: "1800 E Broad Ave", town: "Albany", contactNo: "" },
      { id: 606, location: "Exon Food Mart", licenseNo: "", coams: "", address: "Pio nono Avenue", town: "Macon", contactNo: "" }
    ]
  },
  {
    id: 7,
    name: "Others",
    phone: "",
    locations: [
      { id: 701, location: "Summit 46", licenseNo: "", coams: "", address: "William road", town: "Columbus", contactNo: "" },
      { id: 702, location: "Pine Food Mart", licenseNo: "", coams: "", address: "321 Main street", town: "Pine Mountain", contactNo: "" },
      { id: 703, location: "Five Points Grocery", licenseNo: "52119", coams: 8, address: "762 Hwy 76 E", town: "Clayton", contactNo: "" },
      { id: 704, location: "Waycross BP", licenseNo: "71947", coams: 6, address: "2476 Mionnesota Ave", town: "Waycross", contactNo: "" },
      { id: 705, location: "M2K2 Food Mart Inc", licenseNo: "71369", coams: 6, address: "1103 S Veterans Blvd", town: "Glennville", contactNo: "" }
    ]
  },
  {
    id: 8,
    name: "Viraj's Personal",
    phone: "",
    locations: [
      { id: 801, location: "Majik market @ Wynnton", licenseNo: "", coams: "", address: "", town: "", contactNo: "" }
    ]
  },
  {
    id: 9,
    name: "Broker: Pintu",
    phone: "2295915400",
    locations: [
      { id: 901, location: "SFT", licenseNo: "78042", coams: 8, address: "82 Houston St", town: "Hawkinsville", contactNo: "" },
      { id: 902, location: "MEGA MART 3", licenseNo: "71873", coams: 8, address: "1406 West Bypass NW", town: "Moultrie", contactNo: "" },
      { id: 903, location: "SANTA FOOD MART", licenseNo: "75086", coams: 8, address: "1129 N Houston Lake Blvd", town: "Warner Robins", contactNo: "" },
      { id: 904, location: "D&K SMOKE SHOP LLC", licenseNo: "73899", coams: 6, address: "4020 E Lake Pkwy", town: "McDonough", contactNo: "" },
      { id: 905, location: "KESHAV 1 LLC", licenseNo: "72375", coams: 5, address: "105 Gray Rd SW", town: "Eatonton", contactNo: "" },
      { id: 906, location: "IN-N-OUT MARKET LOTTERY STORE", licenseNo: "78589", coams: 8, address: "1902 Windsor Spring Rd", town: "Augusta", contactNo: "" },
      { id: 907, location: "Bobby Foodmart", licenseNo: "33360", coams: 4, address: "8371 Eisenhower Pkwy", town: "Lizella", contactNo: "" },
      { id: 908, location: "PRETTY GIRLS BEAUTY SUPPLY", licenseNo: "69020", coams: 5, address: "333 Drayton St, Ste A", town: "Montezuma", contactNo: "" },
      { id: 909, location: "BOB MARLY SMOKE SHOP", licenseNo: "69021", coams: 5, address: "505 Spaulding Rd, Ste C", town: "Montezuma", contactNo: "" },
      { id: 910, location: "280 GADGETS & GIFTS", licenseNo: "74326", coams: 7, address: "225 Jenkins Rd", town: "Americus", contactNo: "" },
      { id: 911, location: "JUMBO EXPRESS", licenseNo: "78524", coams: 5, address: "260 Tom Hill Sr Blvd", town: "Macon", contactNo: "" },
      { id: 912, location: "QUICK STOP #3", licenseNo: "77494", coams: 5, address: "4592 N Valdosta Rd", town: "Valdosta", contactNo: "" },
      { id: 913, location: "2211 EAST MORRIS ST", licenseNo: "79174", coams: 6, address: "2211 East Morris Street", town: "Dalton", contactNo: "" }
    ]
  },
  {
    id: 10,
    name: "Broker: Satish",
    phone: "",
    locations: [
      { id: 1001, location: "Anju 88 Inc DBA Liberty Food Mart", licenseNo: "58152", coams: 6, address: "2103 Lumpkin Road", town: "Columbus", contactNo: "" },
      { id: 1002, location: "Shel 1500 Inc DBA Shell Food Mart", licenseNo: "71921", coams: 6, address: "1500 Veterans Parkway", town: "Columbus", contactNo: "" },
      { id: 1003, location: "Milgen 4254 Inc DBA BP Food Mart", licenseNo: "70613", coams: 6, address: "4254 Milgen Road", town: "Columbus", contactNo: "" },
      { id: 1004, location: "Swaminarayan 369 LLC", licenseNo: "77697", coams: 6, address: "108 5th Ave, Ste B", town: "Eastman", contactNo: "" },
      { id: 1005, location: "Dos Amigos 584 LLC", licenseNo: "78134", coams: 6, address: "584 Emery Hwy", town: "Macon", contactNo: "" },
      { id: 1006, location: "Fuel & Shop Inc DBA A1 Stop", licenseNo: "78364", coams: 6, address: "1433 Eisenhower Parkway Ste R", town: "Macon", contactNo: "" }
    ]
  }
];

// State
let brokersData = [];
let editingBrokerId = null;
let editingLocationBrokerId = null;

async function loadBrokers() {
  // 1. Load from localStorage immediately (fast, for dropdown)
  const stored = localStorage.getItem('brokersData');
  if (stored) {
    try { brokersData = JSON.parse(stored); } catch(e) {}
  }
  if (!brokersData || brokersData.length === 0) {
    brokersData = JSON.parse(JSON.stringify(initialBrokers));
  }

  // 2. Fetch latest from Google Sheets in background
  try {
    const res = await fetch(WEBHOOK_URL + '?sheet=locations');
    if (!res.ok) throw new Error('fetch failed');
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0 && !rows.error) {
      brokersData = flatRowsToBrokers(rows);
      localStorage.setItem('brokersData', JSON.stringify(brokersData));
    }
  } catch(e) {
    console.warn('Could not load locations from cloud, using local data:', e);
  }
}

let locSyncTimeout = null;
function saveBrokers() {
  // Save to localStorage immediately
  localStorage.setItem('brokersData', JSON.stringify(brokersData));
  // Debounce push to Google Sheets
  if (locSyncTimeout) clearTimeout(locSyncTimeout);
  locSyncTimeout = setTimeout(() => pushBrokers(), 1000);
}

async function pushBrokers() {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ type: 'locations', rows: brokersToFlatRows(brokersData) })
    });
  } catch(e) {
    console.error('Failed to sync locations to cloud:', e);
  }
}

function renderLocations() {
  const container = document.getElementById('brokers-container');
  const summary = document.getElementById('loc-summary');

  const totalBrokers = brokersData.length;
  const totalLocs = brokersData.reduce((sum, b) => sum + b.locations.length, 0);
  const totalCoams = brokersData.reduce((sum, b) => sum + b.locations.reduce((s, l) => s + (parseInt(l.coams) || 0), 0), 0);
  summary.innerHTML = `<strong>${totalBrokers}</strong> groups &nbsp;·&nbsp; <strong>${totalLocs}</strong> locations &nbsp;·&nbsp; <strong>${totalCoams}</strong> total COAMs`;

  container.innerHTML = '';

  brokersData.forEach(broker => {
    const totalBrokerCoams = broker.locations.reduce((s, l) => s + (parseInt(l.coams) || 0), 0);
    const card = document.createElement('div');
    card.className = 'broker-card';
    card.innerHTML = `
      <div class="broker-header" onclick="toggleBroker(${broker.id})">
        <div class="broker-info">
          <span class="broker-name">${broker.name}</span>
          ${broker.phone ? `<span class="broker-phone"><i class="ph ph-phone"></i> ${broker.phone}</span>` : ''}
        </div>
        <div class="broker-meta">
          <span class="broker-badge">${broker.locations.length} locations</span>
          <span class="broker-badge coams-badge">${totalBrokerCoams} COAMs</span>
          <button class="icon-btn edit-broker-btn" onclick="event.stopPropagation(); openEditBroker(${broker.id})" title="Edit Group"><i class="ph ph-pencil-simple"></i></button>
          <button class="icon-btn delete-btn" onclick="event.stopPropagation(); deleteBroker(${broker.id})" title="Delete Group">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
          <span class="broker-chevron" id="chevron-${broker.id}">▼</span>
        </div>
      </div>
      <div class="broker-body" id="broker-body-${broker.id}">
        <div class="loc-table-wrapper">
          <table class="loc-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Location</th>
                <th>License No.</th>
                <th>COAMs</th>
                <th>Address</th>
                <th>Town</th>
                <th>Contact No.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${broker.locations.map((loc, idx) => `
                <tr>
                  <td class="loc-num">${idx + 1}</td>
                  <td class="loc-editable" data-broker="${broker.id}" data-loc="${loc.id}" data-field="location" contenteditable="true">${loc.location}</td>
                  <td class="loc-editable" data-broker="${broker.id}" data-loc="${loc.id}" data-field="licenseNo" contenteditable="true">${loc.licenseNo || ''}</td>
                  <td class="loc-editable loc-num" data-broker="${broker.id}" data-loc="${loc.id}" data-field="coams" contenteditable="true">${loc.coams !== '' ? loc.coams : ''}</td>
                  <td class="loc-editable" data-broker="${broker.id}" data-loc="${loc.id}" data-field="address" contenteditable="true">${loc.address || ''}</td>
                  <td class="loc-editable" data-broker="${broker.id}" data-loc="${loc.id}" data-field="town" contenteditable="true">${loc.town || ''}</td>
                  <td class="loc-editable" data-broker="${broker.id}" data-loc="${loc.id}" data-field="contactNo" contenteditable="true">${loc.contactNo || ''}</td>
                  <td class="loc-actions-cell">
                    <button class="icon-btn delete-btn" onclick="deleteLocation(${broker.id}, ${loc.id})" title="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="broker-footer">
          <button class="add-loc-btn" onclick="openAddLocation(${broker.id})">+ Add Location</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach blur listeners for inline editing
  document.querySelectorAll('.loc-editable').forEach(td => {
    td.addEventListener('blur', e => {
      const brokerId = parseInt(e.target.dataset.broker);
      const locId = parseInt(e.target.dataset.loc);
      const field = e.target.dataset.field;
      const value = e.target.innerText.trim();
      const bi = brokersData.findIndex(b => b.id === brokerId);
      if (bi === -1) return;
      const li = brokersData[bi].locations.findIndex(l => l.id === locId);
      if (li === -1) return;
      brokersData[bi].locations[li][field] = value;
      saveBrokers();
      // Re-render to update header counts
      renderLocations();
      // Re-open the broker card that was being edited
      const bodyEl = document.getElementById(`broker-body-${brokerId}`);
      if (bodyEl) bodyEl.style.display = 'block';
    });
    td.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
    });
  });
}

window.toggleBroker = function(id) {
  const body = document.getElementById(`broker-body-${id}`);
  const chevron = document.getElementById(`chevron-${id}`);
  if (!body) return;
  const isOpen = body.style.display !== 'none' && body.style.display !== '';
  body.style.display = isOpen ? 'none' : 'block';
  chevron.textContent = isOpen ? '▶' : '▼';
};

window.deleteBroker = function(id) {
  if (!confirm('Delete this entire group and all its locations?')) return;
  brokersData = brokersData.filter(b => b.id !== id);
  saveBrokers();
  renderLocations();
};

window.deleteLocation = function(brokerId, locId) {
  if (!confirm('Delete this location?')) return;
  const bi = brokersData.findIndex(b => b.id === brokerId);
  if (bi === -1) return;
  brokersData[bi].locations = brokersData[bi].locations.filter(l => l.id !== locId);
  saveBrokers();
  renderLocations();
  const bodyEl = document.getElementById(`broker-body-${brokerId}`);
  if (bodyEl) bodyEl.style.display = 'block';
};

window.openAddLocation = function(brokerId) {
  editingLocationBrokerId = brokerId;
  document.getElementById('location-modal-title').textContent = 'Add Location';
  ['loc-name-input','loc-license-input','loc-coams-input','loc-address-input','loc-town-input'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('location-modal-overlay').classList.remove('hidden');
};

window.openEditBroker = function(brokerId) {
  editingBrokerId = brokerId;
  const broker = brokersData.find(b => b.id === brokerId);
  document.getElementById('broker-modal-title').textContent = 'Edit Group';
  document.getElementById('broker-name-input').value = broker.name;
  document.getElementById('broker-phone-input').value = broker.phone || '';
  document.getElementById('broker-modal-overlay').classList.remove('hidden');
};

function setupLocationsEventListeners() {
  document.getElementById('add-broker-btn').addEventListener('click', () => {
    editingBrokerId = null;
    document.getElementById('broker-modal-title').textContent = 'Add Broker / Group';
    document.getElementById('broker-name-input').value = '';
    document.getElementById('broker-phone-input').value = '';
    document.getElementById('broker-modal-overlay').classList.remove('hidden');
  });

  document.getElementById('close-broker-modal-btn').addEventListener('click', () => {
    document.getElementById('broker-modal-overlay').classList.add('hidden');
  });

  document.getElementById('save-broker-btn').addEventListener('click', () => {
    const name = document.getElementById('broker-name-input').value.trim();
    if (!name) return alert('Please enter a name.');
    const phone = document.getElementById('broker-phone-input').value.trim();
    if (editingBrokerId !== null) {
      const bi = brokersData.findIndex(b => b.id === editingBrokerId);
      if (bi !== -1) { brokersData[bi].name = name; brokersData[bi].phone = phone; }
    } else {
      const newId = brokersData.length > 0 ? Math.max(...brokersData.map(b => b.id)) + 1 : 1;
      brokersData.push({ id: newId, name, phone, locations: [] });
    }
    saveBrokers();
    renderLocations();
    document.getElementById('broker-modal-overlay').classList.add('hidden');
  });

  document.getElementById('close-location-modal-btn').addEventListener('click', () => {
    document.getElementById('location-modal-overlay').classList.add('hidden');
  });

  document.getElementById('save-location-btn').addEventListener('click', () => {
    const locName = document.getElementById('loc-name-input').value.trim();
    if (!locName) return alert('Please enter a location name.');
    const bi = brokersData.findIndex(b => b.id === editingLocationBrokerId);
    if (bi === -1) return;
    const allIds = brokersData.flatMap(b => b.locations.map(l => l.id));
    const newLocId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;
    brokersData[bi].locations.push({
      id: newLocId,
      location: locName,
      licenseNo: document.getElementById('loc-license-input').value.trim(),
      coams: document.getElementById('loc-coams-input').value.trim(),
      address: document.getElementById('loc-address-input').value.trim(),
      town: document.getElementById('loc-town-input').value.trim(),
      contactNo: document.getElementById('loc-contact-input').value.trim()
    });
    saveBrokers();
    renderLocations();
    document.getElementById('location-modal-overlay').classList.add('hidden');
    // Keep the broker card open
    const bodyEl = document.getElementById(`broker-body-${editingLocationBrokerId}`);
    if (bodyEl) bodyEl.style.display = 'block';
  });

  // Close modals on overlay click
  document.getElementById('broker-modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('broker-modal-overlay'))
      document.getElementById('broker-modal-overlay').classList.add('hidden');
  });
  document.getElementById('location-modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('location-modal-overlay'))
      document.getElementById('location-modal-overlay').classList.add('hidden');
  });
}

// Tab switching
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`panel-${tab}`).classList.add('active');
    });
  });
}

// Init locations DB
async function initLocations() {
  // loadBrokers already called from init() in script.js
  // Re-render now that cloud data may have arrived
  renderLocations();
  setupLocationsEventListeners();
  setupTabs();

  // After cloud fetch completes, re-render table dropdown too
  await loadBrokers();
  renderLocations();
  renderTable();
}
