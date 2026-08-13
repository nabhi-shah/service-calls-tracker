export const STATUSES = ['', 'Pending', 'In Progress', 'Complete', 'Facing Issues']

export const MOCK_PARTS = [
  'Mother goose', 'Harness', 'Bill acceptor', 'Screen',
  'Board', 'Printer', 'Card system', 'Access System', 'Other', 'None',
]

export const MOCK_MACHINES = [
  'Aristocrat', 'Light & Wonder', 'IGT', 'Banilla', 'Baddog', 'Other', 'None',
]

export const INITIAL_CALLS = [
  {
    id: 1, srNo: '1', callDate: '2026-08-10', locationId: null,
    callLocation: 'Majik market', address: '4509 Reese road',
    broker: '', brokerContact: '', locationContact: '',
    resolutionDate: '', resolutionNotes: 'Change 4 Machine & access system',
    status: '', parts: ['Access System'], machine: [], notes: 'machine from laundromat',
  },
  {
    id: 2, srNo: '2', callDate: '2026-08-10', locationId: null,
    callLocation: '2211 East Morris Street', address: '2211 East Morris Street, Dalton',
    broker: '', brokerContact: '', locationContact: '',
    resolutionDate: '', resolutionNotes: 'Change two machine, Excess card',
    status: '', parts: [], machine: ['Aristocrat'], notes: '',
  },
  {
    id: 3, srNo: '3', callDate: '2026-08-10', locationId: null,
    callLocation: 'Laundromat Near Me', address: '7465 Blackmon Lane Ste A, Columbus',
    broker: '', brokerContact: '', locationContact: '',
    resolutionDate: '', resolutionNotes: '',
    status: '', parts: [], machine: [], notes: '',
  },
]

export const INITIAL_BROKERS = [
  {
    id: 1, name: 'Lucky 8 Games LLC (15284)', phone: '',
    locations: [
      { id: 101, location: 'Royston Drive-in', licenseNo: '35535', coams: 2, address: '1267 Bowersville St', town: 'Royston', contactNo: '' },
      { id: 102, location: 'BP#1 -(000054116)', licenseNo: '54116', coams: 6, address: '4416 VETERANS PARKWAY', town: 'COLUMBUS', contactNo: '' },
      { id: 103, location: 'H&K Food Mart', licenseNo: '57118', coams: 8, address: '900 S Westover Blvd Ste D', town: 'Albany', contactNo: '' },
      { id: 104, location: 'Citgo At MLK', licenseNo: '61788', coams: 5, address: '1431 MLK Jr Blvd', town: 'COLUMBUS', contactNo: '' },
      { id: 105, location: 'Handee Mart', licenseNo: '62599', coams: 6, address: '3266 Cusseta Road', town: 'Columbus', contactNo: '' },
      { id: 106, location: 'Lucky 9', licenseNo: '67565', coams: 6, address: '1800 E Broad Ave', town: 'Albany', contactNo: '' },
      { id: 107, location: 'Kumar Food Store', licenseNo: '67891', coams: 6, address: '1770 Old Coffee Road', town: 'Cecil', contactNo: '' },
      { id: 108, location: 'BM Foods', licenseNo: '68234', coams: 6, address: '2650 Manchester Expwy', town: 'Columbus', contactNo: '' },
      { id: 109, location: 'Adiyogi 1 Business LLC / Chehar Maa', licenseNo: '68727/77938', coams: 8, address: '8045 Hwy 78', town: 'Bremen', contactNo: '' },
      { id: 110, location: 'Adiyogi 2 LLC', licenseNo: '68873', coams: 5, address: '904 B Pacific Ave', town: 'Bremen', contactNo: '' },
      { id: 111, location: "Judy's Herb & Tobacco", licenseNo: '77965', coams: 5, address: '10900 Commerce St Ste A', town: 'Summerville', contactNo: '' },
      { id: 112, location: 'Gas World 11', licenseNo: '70532', coams: 8, address: '114 Old Evens Rd', town: 'Martinez', contactNo: '' },
      { id: 113, location: '12thAve BP', licenseNo: '71941', coams: 5, address: '1801 12th Ave', town: 'COLUMBUS', contactNo: '' },
      { id: 114, location: 'Shreeji Tifton Inc', licenseNo: '72891', coams: 8, address: '3131 US Hwy 41 S', town: 'Tifton', contactNo: '' },
      { id: 115, location: 'Junebugs Grocery', licenseNo: '73076', coams: 6, address: '1905 S Madison St Ste 1', town: 'Albany', contactNo: '' },
      { id: 116, location: 'Mahalakshmi 11 LLC', licenseNo: '75752', coams: 8, address: '1135 Farmers Rd', town: 'Carrollton', contactNo: '' },
      { id: 117, location: 'Neel 9619 llc/Reese', licenseNo: '75952', coams: 6, address: '2689 Reese Road', town: 'Columbus', contactNo: '' },
      { id: 118, location: 'Adkant', licenseNo: '77004', coams: 6, address: '902 W 16th Ave', town: 'Cordele', contactNo: '' },
      { id: 119, location: '24/7 Minimart', licenseNo: '77934', coams: 6, address: '2234 Fort Benning Rd Ste B', town: 'Columbus', contactNo: '' },
      { id: 120, location: 'Tipco 3 LLC', licenseNo: '78452', coams: 5, address: '6011 Bethel Church rd', town: 'Lizella', contactNo: '' },
      { id: 121, location: 'Laundromat Near Me', licenseNo: '78502', coams: 4, address: '7465 Blackmon Lane Ste A', town: 'Columbus', contactNo: '' },
      { id: 122, location: 'Powder Springs food mart', licenseNo: '79712', coams: '', address: '44334 Austell powder springs rd ste 200', town: 'Powder Springs', contactNo: '' },
    ],
  },
  {
    id: 2, name: 'Nishit Bhai / Viraj', phone: '',
    locations: [
      { id: 201, location: 'Mahalakshmi 11 LLC', licenseNo: '75752', coams: 9, address: '1135 Farmers High Road', town: 'Carrollton', contactNo: '' },
      { id: 202, location: "Judy's Herb & Tobacco", licenseNo: '69213', coams: 5, address: '10900 Commerce St Ste A', town: 'Summerville', contactNo: '' },
      { id: 203, location: 'Adkant', licenseNo: '77004', coams: 6, address: '902 W 16th Ave', town: 'Cordele', contactNo: '' },
    ],
  },
  {
    id: 3, name: 'Nishit Bhai / Shivsena', phone: '',
    locations: [
      { id: 301, location: 'Adiyogi 1 Business LLC', licenseNo: '68727', coams: 8, address: '8045 Hwy 78', town: 'Bremen', contactNo: '' },
      { id: 302, location: 'Adiyogi 2 LLC', licenseNo: '68873', coams: 5, address: '904 B Pacific Ave', town: 'Bremen', contactNo: '' },
    ],
  },
  {
    id: 4, name: 'Platinum', phone: '',
    locations: [
      { id: 401, location: 'BP#1 -(000054116)', licenseNo: '54116', coams: 6, address: '4416 VETERANS PARKWAY', town: 'COLUMBUS', contactNo: '' },
      { id: 402, location: 'BM Foods', licenseNo: '68234', coams: 6, address: '2650 Manchester Expwy', town: 'Columbus', contactNo: '' },
      { id: 403, location: 'Neel 9619 llc', licenseNo: '72916/75952', coams: '', address: 'Reese Road', town: 'Columbus', contactNo: '' },
    ],
  },
  {
    id: 5, name: 'Viraj Shah', phone: '',
    locations: [
      { id: 501, location: 'H&K Food Mart', licenseNo: '57118', coams: 8, address: '900 S Westover Blvd Ste D', town: 'Albany', contactNo: '' },
      { id: 502, location: 'Citgo At MLK', licenseNo: '61788', coams: 5, address: '1431 MLK Jr Blvd', town: 'COLUMBUS', contactNo: '' },
      { id: 503, location: 'Shreeji Tifton Inc', licenseNo: '72891', coams: 8, address: '3131 US Hwy 41 S', town: 'Tifton', contactNo: '' },
      { id: 504, location: 'MMM Sandhu Inc.', licenseNo: '62599', coams: 6, address: '3266 Cusseta Road', town: 'Columbus', contactNo: '' },
      { id: 505, location: 'Junebugs Grocery', licenseNo: '73076', coams: 2, address: '1905 S Madison St Ste 1', town: 'Albany', contactNo: '' },
      { id: 506, location: '24/7 Minimart', licenseNo: '77934', coams: 6, address: '2234 Fort Benning Rd Ste B', town: 'Columbus', contactNo: '' },
    ],
  },
  {
    id: 6, name: 'Lucky 8 Games', phone: '',
    locations: [
      { id: 601, location: 'Royston Drive-in', licenseNo: '35535', coams: 2, address: '1267 Bowersville St', town: 'Royston', contactNo: '' },
      { id: 602, location: 'Kumar Food Store', licenseNo: '67891', coams: 6, address: '1770 Old Coffee Road', town: 'Cecil', contactNo: '' },
      { id: 603, location: 'Gas World 11', licenseNo: '70532', coams: 6, address: '114 Old Evens Rd', town: 'Martinez', contactNo: '' },
      { id: 604, location: '12thAve BP', licenseNo: '71941', coams: 5, address: '1801 12th Ave', town: 'COLUMBUS', contactNo: '' },
      { id: 605, location: 'Lucky 9', licenseNo: '67565', coams: 6, address: '1800 E Broad Ave', town: 'Albany', contactNo: '' },
      { id: 606, location: 'Exon Food Mart', licenseNo: '', coams: '', address: 'Pio nono Avenue', town: 'Macon', contactNo: '' },
    ],
  },
  {
    id: 7, name: 'Others', phone: '',
    locations: [
      { id: 701, location: 'Summit 46', licenseNo: '', coams: '', address: 'William road', town: 'Columbus', contactNo: '' },
      { id: 702, location: 'Pine Food Mart', licenseNo: '', coams: '', address: '321 Main street', town: 'Pine Mountain', contactNo: '' },
      { id: 703, location: 'Five Points Grocery', licenseNo: '52119', coams: 8, address: '762 Hwy 76 E', town: 'Clayton', contactNo: '' },
      { id: 704, location: 'Waycross BP', licenseNo: '71947', coams: 6, address: '2476 Mionnesota Ave', town: 'Waycross', contactNo: '' },
      { id: 705, location: 'M2K2 Food Mart Inc', licenseNo: '71369', coams: 6, address: '1103 S Veterans Blvd', town: 'Glennville', contactNo: '' },
    ],
  },
  {
    id: 8, name: "Viraj's Personal", phone: '',
    locations: [
      { id: 801, location: 'Majik market @ Wynnton', licenseNo: '', coams: '', address: '', town: '', contactNo: '' },
    ],
  },
  {
    id: 9, name: 'Broker: Pintu', phone: '2295915400',
    locations: [
      { id: 901, location: 'SFT', licenseNo: '78042', coams: 8, address: '82 Houston St', town: 'Hawkinsville', contactNo: '' },
      { id: 902, location: 'MEGA MART 3', licenseNo: '71873', coams: 8, address: '1406 West Bypass NW', town: 'Moultrie', contactNo: '' },
      { id: 903, location: 'SANTA FOOD MART', licenseNo: '75086', coams: 8, address: '1129 N Houston Lake Blvd', town: 'Warner Robins', contactNo: '' },
      { id: 904, location: 'D&K SMOKE SHOP LLC', licenseNo: '73899', coams: 6, address: '4020 E Lake Pkwy', town: 'McDonough', contactNo: '' },
      { id: 905, location: 'KESHAV 1 LLC', licenseNo: '72375', coams: 5, address: '105 Gray Rd SW', town: 'Eatonton', contactNo: '' },
      { id: 906, location: 'IN-N-OUT MARKET LOTTERY STORE', licenseNo: '78589', coams: 8, address: '1902 Windsor Spring Rd', town: 'Augusta', contactNo: '' },
      { id: 907, location: 'Bobby Foodmart', licenseNo: '33360', coams: 4, address: '8371 Eisenhower Pkwy', town: 'Lizella', contactNo: '' },
      { id: 908, location: 'PRETTY GIRLS BEAUTY SUPPLY', licenseNo: '69020', coams: 5, address: '333 Drayton St, Ste A', town: 'Montezuma', contactNo: '' },
      { id: 909, location: 'BOB MARLY SMOKE SHOP', licenseNo: '69021', coams: 5, address: '505 Spaulding Rd, Ste C', town: 'Montezuma', contactNo: '' },
      { id: 910, location: '280 GADGETS & GIFTS', licenseNo: '74326', coams: 7, address: '225 Jenkins Rd', town: 'Americus', contactNo: '' },
      { id: 911, location: 'JUMBO EXPRESS', licenseNo: '78524', coams: 5, address: '260 Tom Hill Sr Blvd', town: 'Macon', contactNo: '' },
      { id: 912, location: 'QUICK STOP #3', licenseNo: '77494', coams: 5, address: '4592 N Valdosta Rd', town: 'Valdosta', contactNo: '' },
      { id: 913, location: '2211 EAST MORRIS ST', licenseNo: '79174', coams: 6, address: '2211 East Morris Street', town: 'Dalton', contactNo: '' },
    ],
  },
  {
    id: 10, name: 'Broker: Satish', phone: '',
    locations: [
      { id: 1001, location: 'Anju 88 Inc DBA Liberty Food Mart', licenseNo: '58152', coams: 6, address: '2103 Lumpkin Road', town: 'Columbus', contactNo: '' },
      { id: 1002, location: 'Shel 1500 Inc DBA Shell Food Mart', licenseNo: '71921', coams: 6, address: '1500 Veterans Parkway', town: 'Columbus', contactNo: '' },
      { id: 1003, location: 'Milgen 4254 Inc DBA BP Food Mart', licenseNo: '70613', coams: 6, address: '4254 Milgen Road', town: 'Columbus', contactNo: '' },
      { id: 1004, location: 'Swaminarayan 369 LLC', licenseNo: '77697', coams: 6, address: '108 5th Ave, Ste B', town: 'Eastman', contactNo: '' },
      { id: 1005, location: 'Dos Amigos 584 LLC', licenseNo: '78134', coams: 6, address: '584 Emery Hwy', town: 'Macon', contactNo: '' },
      { id: 1006, location: 'Fuel & Shop Inc DBA A1 Stop', licenseNo: '78364', coams: 6, address: '1433 Eisenhower Parkway Ste R', town: 'Macon', contactNo: '' },
    ],
  },
]

// ── Broker ↔ flat row converters ──────────────────────────
export function flatRowsToBrokers(rows) {
  const map = {}
  const order = []
  rows.forEach(r => {
    const bid = parseInt(r.brokerId)
    if (!map[bid]) {
      map[bid] = { id: bid, name: r.brokerName, phone: r.brokerPhone || '', locations: [] }
      order.push(bid)
    }
    map[bid].locations.push({
      id: parseInt(r.locId),
      location: r.location,
      licenseNo: r.licenseNo || '',
      coams: r.coams,
      address: r.address || '',
      town: r.town || '',
      contactNo: r.contactNo || '',
    })
  })
  return order.map(id => map[id])
}

export function brokersToFlatRows(brokers) {
  const rows = []
  brokers.forEach(b => {
    b.locations.forEach(loc => {
      rows.push({
        brokerId: b.id, brokerName: b.name, brokerPhone: b.phone || '',
        locId: loc.id, location: loc.location, licenseNo: loc.licenseNo || '',
        coams: loc.coams !== undefined ? loc.coams : '',
        address: loc.address || '', town: loc.town || '', contactNo: loc.contactNo || '',
      })
    })
  })
  return rows
}
