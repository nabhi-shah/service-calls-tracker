// Default mock data based on the Google Sheet
const initialData = [
  {
    id: 1,
    srNo: "1",
    callDate: "08/10/2026",
    locationId: null,
    callLocation: "Majik market",
    address: "4509 Reese road",
    broker: "",
    brokerContact: "",
    locationContact: "",
    resolutionDate: "",
    resolutionNotes: "Change 4 Machine & access system",
    status: "",
    parts: ["Access System"],
    machine: [],
    notes: "machine from laundramet"
  },
  {
    id: 2,
    srNo: "2",
    callDate: "2026-08-10",
    locationId: null,
    callLocation: "2211 East Morris Street",
    address: "2211 East Morris Street, Dalton",
    broker: "",
    brokerContact: "",
    locationContact: "",
    resolutionDate: "",
    resolutionNotes: "Change two machine, Excessw card",
    status: "",
    parts: [],
    machine: ["Aristocrat"],
    notes: ""
  },
  {
    id: 3,
    srNo: "3",
    callDate: "2026-08-10",
    locationId: null,
    callLocation: "Laundromat Near Me",
    address: "7465 Blackmon Lane Ste A, Columbus",
    broker: "",
    brokerContact: "",
    locationContact: "",
    resolutionDate: "",
    resolutionNotes: "",
    status: "",
    parts: [],
    machine: [],
    notes: ""
  }
];

const mockParts = [
  "Mother goose", "harness", "bill acceptor", "screen", 
  "board", "printer", "card system", "other", "none"
];

const mockMachines = [
  "Aristrocat", "Light & Wonder", "IGT", "Banilla", "Baddog", "Other", "none"
];

const statuses = ["", "Pending", "In Progress", "Complete", "Facing Issues"];

// State
let tableData = [];
let activeRowId = null;
let activeField = null; // 'parts' or 'machine'

// DOM Elements
const tableBody = document.getElementById('table-body');
const addRowBtn = document.getElementById('add-row-btn');
const syncBtn = document.getElementById('sync-btn');

// Stats Elements
const statTotal = document.getElementById('stat-total');
const statPending = document.getElementById('stat-pending');
const statInProgress = document.getElementById('stat-inprogress');
const statComplete = document.getElementById('stat-complete');
const statIssues = document.getElementById('stat-issues');

// Modal Elements
const dropdownOverlay = document.getElementById('dropdown-overlay');
const dropdownTitle = document.getElementById('dropdown-title');
const dropdownList = document.getElementById('dropdown-list');
const closeDropdownBtn = document.getElementById('close-dropdown-btn');
const dropdownApplyBtn = document.getElementById('dropdown-apply-btn');
const dropdownSearchInput = document.getElementById('dropdown-search-input');

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxe7AJCIJ8fw25_8GWD9FyBv-lytPjyMyWsDjBDU-P3kSI8gTgdJmDFl-AHiXDgdcwh/exec";

// Initialize
async function init() {
  tableBody.innerHTML = '<tr><td colspan="14" style="text-align:center; padding: 40px; color: var(--text-muted);">Loading data from cloud...</td></tr>';

  // Load brokers first so location dropdown is populated
  if (typeof loadBrokers === 'function') await loadBrokers();
  
  try {
    const response = await fetch(WEBHOOK_URL);
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    if (data && !data.error) {
      tableData = data;
    } else {
      console.warn("Cloud data format issue, falling back to mock");
      tableData = [...initialData];
    }
  } catch (e) {
    console.error("Error loading from cloud:", e);
    tableData = [...initialData];
  }
  
  renderTable();
  setupEventListeners();
  initLocations();
}

let syncTimeout = null;
function saveData() {
  updateStats();
  
  // Debounce the auto-sync to avoid spamming the Apps Script
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    pushData(false);
  }, 1000);
}

async function pushData(showFeedback = true) {
  const originalText = syncBtn.innerHTML;
  if (showFeedback) {
    syncBtn.innerHTML = 'Syncing...';
    syncBtn.disabled = true;
  }
  
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(tableData)
    });
    if (showFeedback) {
      alert('Sync complete! Your data has been backed up to the Google Sheet.');
    }
  } catch (e) {
    console.error("Sync failed:", e);
    if (showFeedback) {
      alert('Failed to sync. Please make sure you published the script correctly.');
    }
  } finally {
    if (showFeedback) {
      syncBtn.innerHTML = originalText;
      syncBtn.disabled = false;
    }
  }
}

function updateStats() {
  statTotal.textContent = tableData.length;
  statPending.textContent = tableData.filter(r => r.status === 'Pending').length;
  statInProgress.textContent = tableData.filter(r => r.status === 'In Progress').length;
  statComplete.textContent = tableData.filter(r => r.status === 'Complete').length;
  statIssues.textContent = tableData.filter(r => r.status === 'Facing Issues').length;
}

function getStatusClass(status) {
  if (!status) return 'empty';
  return status.toLowerCase().replace(' ', '-');
}

function renderTags(items) {
  if (!items || items.length === 0) return '<span class="text-muted" style="color: var(--text-muted); font-size: 0.875rem;">Select...</span>';
  return `<div class="tags-container">
    ${items.map(item => `<span class="tag">${item}</span>`).join('')}
  </div>`;
}

function buildLocationOptions(selectedId) {
  const groups = (typeof brokersData !== 'undefined' && brokersData.length > 0) ? brokersData : [];
  let html = '<option value="">Select location...</option>';
  groups.forEach(broker => {
    html += `<optgroup label="${broker.name}">`;
    broker.locations.forEach(loc => {
      const sel = selectedId === loc.id ? 'selected' : '';
      html += `<option value="${loc.id}" ${sel}>${loc.location}</option>`;
    });
    html += '</optgroup>';
  });
  return html;
}

function renderTable() {
  tableBody.innerHTML = '';
  
  tableData.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-sr editable" data-id="${row.id}" data-field="srNo" contenteditable="true">${row.srNo}</td>
      <td class="col-date"><input type="date" class="date-input" data-id="${row.id}" data-field="callDate" value="${row.callDate}"></td>
      <td class="col-location">
        <select class="location-select" data-id="${row.id}">${buildLocationOptions(row.locationId || null)}</select>
      </td>
      <td class="col-address editable" data-id="${row.id}" data-field="address" contenteditable="true">${row.address || ''}</td>
      <td class="col-broker editable" data-id="${row.id}" data-field="broker" contenteditable="true">${row.broker || ''}</td>
      <td class="col-broker-contact editable" data-id="${row.id}" data-field="brokerContact" contenteditable="true">${row.brokerContact || ''}</td>
      <td class="col-loc-contact editable" data-id="${row.id}" data-field="locationContact" contenteditable="true">${row.locationContact || ''}</td>
      <td class="col-res-date"><input type="date" class="date-input" data-id="${row.id}" data-field="resolutionDate" value="${row.resolutionDate}"></td>
      <td class="col-res-notes editable" data-id="${row.id}" data-field="resolutionNotes" contenteditable="true">${row.resolutionNotes}</td>
      <td class="col-status">
        <select class="status-select ${getStatusClass(row.status)}" data-id="${row.id}" data-field="status">
          ${statuses.map(s => `<option value="${s}" ${row.status === s ? 'selected' : ''}>${s || 'Set Status'}</option>`).join('')}
        </select>
      </td>
      <td class="col-parts">
        <div class="dropdown-trigger" onclick="openDropdown(${row.id}, 'parts')">
          ${renderTags(row.parts)}
        </div>
      </td>
      <td class="col-machine">
        <div class="dropdown-trigger" onclick="openDropdown(${row.id}, 'machine')">
          ${renderTags(row.machine)}
        </div>
      </td>
      <td class="col-notes editable" data-id="${row.id}" data-field="notes" contenteditable="true">${row.notes}</td>
      <td class="col-actions">
        <button class="icon-btn delete-btn" onclick="deleteRow(${row.id})" title="Delete Row">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
  
  
  // Attach location dropdown change handler
  document.querySelectorAll('select.location-select').forEach(sel => {
    sel.addEventListener('change', e => {
      const rowId = parseInt(e.target.dataset.id);
      const locId = parseInt(e.target.value) || null;
      const rowIndex = tableData.findIndex(r => r.id === rowId);
      if (rowIndex === -1) return;

      if (!locId) {
        tableData[rowIndex].locationId = null;
        tableData[rowIndex].callLocation = '';
        saveData();
        return;
      }

      let foundLoc = null, foundBroker = null;
      for (const broker of (brokersData || [])) {
        const loc = broker.locations.find(l => l.id === locId);
        if (loc) { foundLoc = loc; foundBroker = broker; break; }
      }

      if (foundLoc) {
        tableData[rowIndex].locationId = locId;
        tableData[rowIndex].callLocation = foundLoc.location;
        tableData[rowIndex].address = [foundLoc.address, foundLoc.town].filter(Boolean).join(', ');
        tableData[rowIndex].broker = foundBroker.name;
        tableData[rowIndex].brokerContact = foundBroker.phone || '';
        tableData[rowIndex].locationContact = foundLoc.contactNo || '';
        saveData();
        renderTable();
      }
    });
  });

  // Attach input event to all contenteditables
  document.querySelectorAll('td.editable').forEach(td => {
    td.addEventListener('blur', (e) => {
      const id = parseInt(e.target.dataset.id);
      const field = e.target.dataset.field;
      const value = e.target.innerText;
      
      const rowIndex = tableData.findIndex(r => r.id === id);
      if (rowIndex !== -1) {
        tableData[rowIndex][field] = value;
        saveData();
      }
    });
    
    // Prevent newlines on enter
    td.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
      }
    });
  });

  // Attach input event to all date inputs
  document.querySelectorAll('input.date-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = parseInt(e.target.dataset.id);
      const field = e.target.dataset.field;
      const value = e.target.value;
      
      const rowIndex = tableData.findIndex(r => r.id === id);
      if (rowIndex !== -1) {
        tableData[rowIndex][field] = value;
        saveData();
      }
    });
  });

  // Attach input event to status select
  document.querySelectorAll('select.status-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const id = parseInt(e.target.dataset.id);
      const field = e.target.dataset.field;
      const value = e.target.value;
      
      const rowIndex = tableData.findIndex(r => r.id === id);
      if (rowIndex !== -1) {
        tableData[rowIndex][field] = value;
        saveData();
        renderTable(); // Re-render to update the select class and stats
      }
    });
  });

  
  updateStats();
}



window.deleteRow = function(id) {
  if(confirm("Are you sure you want to delete this row?")) {
    tableData = tableData.filter(r => r.id !== id);
    saveData();
    renderTable();
  }
}

// Dropdown Logic
window.openDropdown = function(id, field) {
  activeRowId = id;
  activeField = field;
  
  const rowIndex = tableData.findIndex(r => r.id === id);
  const currentSelections = tableData[rowIndex][field] || [];
  
  const options = field === 'parts' ? mockParts : mockMachines;
  dropdownTitle.textContent = field === 'parts' ? 'Select Parts' : 'Select Machine';
  dropdownSearchInput.value = '';
  
  renderDropdownOptions(options, currentSelections);
  dropdownOverlay.classList.remove('hidden');
  dropdownSearchInput.focus();
}

function renderDropdownOptions(options, currentSelections, searchTerm = '') {
  dropdownList.innerHTML = '';
  
  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
  
  if (filteredOptions.length === 0) {
    dropdownList.innerHTML = '<div style="padding: 12px 20px; color: var(--text-muted); font-size: 0.875rem;">No options found.</div>';
    return;
  }
  
  filteredOptions.forEach(opt => {
    const isChecked = currentSelections.includes(opt);
    const div = document.createElement('div');
    div.className = 'dropdown-option';
    
    // Use the option text as the ID for the checkbox to link the label
    const safeId = opt.replace(/\\s+/g, '-').toLowerCase();
    
    div.innerHTML = `
      <input type="checkbox" id="chk-${safeId}" value="${opt}" ${isChecked ? 'checked' : ''}>
      <label for="chk-${safeId}">${opt}</label>
    `;
    
    // Allow clicking the div to toggle the checkbox
    div.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL') {
        const chk = div.querySelector('input');
        chk.checked = !chk.checked;
      }
    });
    
    dropdownList.appendChild(div);
  });
}

function closeDropdown() {
  dropdownOverlay.classList.add('hidden');
  activeRowId = null;
  activeField = null;
}

function applyDropdownSelections() {
  if (!activeRowId || !activeField) return;
  
  const selectedOptions = Array.from(dropdownList.querySelectorAll('input[type="checkbox"]:checked')).map(chk => chk.value);
  
  const rowIndex = tableData.findIndex(r => r.id === activeRowId);
  if (rowIndex !== -1) {
    tableData[rowIndex][activeField] = selectedOptions;
    saveData();
    renderTable();
  }
  
  closeDropdown();
}

function setupEventListeners() {
  
  addRowBtn.addEventListener('click', () => {
    const newId = tableData.length > 0 ? Math.max(...tableData.map(r => r.id)) + 1 : 1;
    tableData.push({
      id: newId,
      srNo: tableData.length + 1 + "",
      callDate: new Date().toISOString().split('T')[0],
      locationId: null,
      callLocation: "",
      address: "",
      broker: "",
      brokerContact: "",
      locationContact: "",
      resolutionDate: "",
      resolutionNotes: "",
      status: "",
      parts: [],
      machine: [],
      notes: ""
    });
    saveData();
    renderTable();
    
    // Scroll to bottom
    const tableContainer = document.querySelector('.table-wrapper');
    tableContainer.scrollTop = tableContainer.scrollHeight;
  });
  
  closeDropdownBtn.addEventListener('click', closeDropdown);
  dropdownApplyBtn.addEventListener('click', applyDropdownSelections);
  
  dropdownOverlay.addEventListener('click', (e) => {
    if (e.target === dropdownOverlay) {
      closeDropdown();
    }
  });
  
  dropdownSearchInput.addEventListener('input', (e) => {
    const options = activeField === 'parts' ? mockParts : mockMachines;
    const rowIndex = tableData.findIndex(r => r.id === activeRowId);
    
    renderDropdownOptions(options, tableData[rowIndex][activeField], e.target.value);
  });
  syncBtn.addEventListener('click', () => {
    pushData(true);
  });
}

// App is started from index.html after all scripts load
