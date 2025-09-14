export function getToday() {
  const today = new Date();
  const kolkataTime = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(today);
  return kolkataTime;
}

export function getTodayData() {
  return JSON.parse(localStorage.getItem('today') || '[]');
}

export function setTodayData(rows) {
  localStorage.setItem('today', JSON.stringify(rows));
}

export function getTransactionsData() {
  return JSON.parse(localStorage.getItem('transactions') || '[]');
}

export function setTransactionsData(rows) {
  localStorage.setItem('transactions', JSON.stringify(rows));
}

export function getPartiesData() {
  return JSON.parse(localStorage.getItem('parties') || '[]');
}

export function setPartiesData(rows) {
  localStorage.setItem('parties', JSON.stringify(rows));
}

export function getItemsData() {
  return JSON.parse(localStorage.getItem('items') || '[]');
}

export function setItemsData(rows) {
  localStorage.setItem('items', JSON.stringify(rows));
}

export function getAdvanceData() {
  return JSON.parse(localStorage.getItem('advances') || '[]');
}

export function setAdvanceData(rows) {
  localStorage.setItem('advances', JSON.stringify(rows));
}

export function computeAmount({ qty, rate, luggage = 0 }) {
  return Number(qty) * Number(rate) + Number(luggage);
}

// Row shape for Today table: { id, date, party, item, qty, rate, luggage, amount, mode, notes }
// Row shape for Transactions table: { id, date, party, item, qty, rate, luggage, amount, mode, notes, status }
// Row shape for Items table: { id, name, unit, rate, notes }
// Row shape for Parties table: { id, name, phone, address, notes }
// Row shape for Advance table: { id, party, date, advance }
