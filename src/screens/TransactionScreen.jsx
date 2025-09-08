import { useState, useEffect } from 'react'
import { Card, Badge, TextInput, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Button, Select, Textarea, Toast, Label } from 'flowbite-react'
import { getToday, getTransactionsData, setTransactionsData, computeAmount, getItemsData, getPartiesData } from '../lib/storage'
import Header from '../components/Header'

function TransactionScreen() {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [modeFilter, setModeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sort, setSort] = useState({ key: 'date', dir: 'asc' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formParty, setFormParty] = useState('')
  const [formItem, setFormItem] = useState('')
  const [formQty, setFormQty] = useState('')
  const [formRate, setFormRate] = useState('')
  const [formLuggage, setFormLuggage] = useState('')
  const [formUnit, setFormUnit] = useState('kgs')
  const [itemsList, setItemsList] = useState([])
  const [partiesList, setPartiesList] = useState([])
  const today = getToday()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (editingRow) {
      setFormDate(editingRow.date)
      setFormParty(editingRow.party)
      setFormItem(editingRow.item)
      setFormQty(editingRow.qty)
      setFormRate(editingRow.rate)
      setFormLuggage(editingRow.luggage || '')
      setFormUnit(editingRow.unit || 'kgs')
    } else {
      setFormDate(today)
      setFormParty('')
      setFormItem('')
      setFormQty('')
      setFormRate('')
      setFormLuggage('')
      setFormUnit('kgs')
    }
  }, [editingRow, today])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
      if (e.key === 'Enter' && isModalOpen) {
        handleSave()
      }
    }
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalOpen])

  useEffect(() => {
    let data = getTransactionsData()
    // Remove seed data - start with empty data after purge
    setRows(data)
  }, [today])

  useEffect(() => {
    // Load items for dropdown
    const items = getItemsData()
    setItemsList(items)
    
    // Load parties for dropdown
    const parties = getPartiesData()
    setPartiesList(parties)
  }, [])

  const handleSort = (key) => {
    setSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
    }))
  }

  const filteredRows = rows.filter(row => {
    const matchesSearch = row.party.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          row.item.toLowerCase().includes(debouncedSearch.toLowerCase())
    const matchesMode = modeFilter === 'All' || row.mode === modeFilter
    const matchesStatus = statusFilter === 'All' || row.status === statusFilter
    return matchesSearch && matchesMode && matchesStatus
  })

  const sortedRows = [...filteredRows].sort((a, b) => {
    const aVal = a[sort.key]
    const bVal = b[sort.key]
    if (sort.dir === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
    }
  })

  const handleEdit = (row) => {
    setEditingRow(row)
    setIsModalOpen(true)
  }

  const handleDelete = (row) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedRows = rows.filter(r => r.id !== row.id)
      setRows(updatedRows)
      setTransactionsData(updatedRows)
      setToastMessage('Entry deleted successfully!')
      setTimeout(() => setToastMessage(''), 3000)
    }
  }

  const handleSave = () => {
    const amount = computeAmount({ qty: formQty, rate: formRate })
    const netTotal = amount + (Number(formLuggage) || 0)
    
    const newRow = {
      id: editingRow ? editingRow.id : crypto.randomUUID(),
      date: formDate,
      party: formParty,
      item: formItem,
      qty: Number(formQty),
      rate: Number(formRate),
      luggage: Number(formLuggage) || 0,
      amount,
      unit: formUnit,
      netTotal
    }
    let updatedRows
    if (editingRow) {
      updatedRows = rows.map(r => r.id === editingRow.id ? newRow : r)
    } else {
      updatedRows = [...rows, newRow]
    }
    setRows(updatedRows)
    setTransactionsData(updatedRows)
    setIsModalOpen(false)
    setEditingRow(null)
    setToastMessage(editingRow ? 'Entry updated successfully!' : 'Entry added successfully!')
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleClear = () => {
    setFormDate(today)
    setFormParty('')
    setFormItem('')
    setFormQty('')
    setFormRate('')
    setFormLuggage('')
    setFormUnit('kgs')
  }

  // Calculate totals for display
  const rateTotal = computeAmount({ qty: formQty, rate: formRate })
  const netTotal = rateTotal + (Number(formLuggage) || 0)

  const parties = [...new Set(rows.map(r => r.party))]

  const totalTransactions = rows.length
  const totalRevenue = rows.filter(row => row.status === 'Completed').reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const pendingAmount = rows.filter(row => row.status === 'Pending').reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const formattedTotalRevenue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalRevenue)
  const formattedPendingAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(pendingAmount)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onAddClick={() => { setEditingRow(null); setIsModalOpen(true); }} />

  {/* Page Container */}
  <main className="w-full px-4 py-3 mx-8">

        {/* Controls */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <TextInput
              placeholder="Search by party or item…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHead className="sticky top-0 bg-gray-800">
              <TableRow>
                <TableHeadCell onClick={() => handleSort('date')} className="cursor-pointer text-white">
                  Date {sort.key === 'date' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('party')} className="cursor-pointer text-white">
                  Party {sort.key === 'party' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('item')} className="cursor-pointer text-white">
                  Item {sort.key === 'item' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('qty')} className="cursor-pointer text-right text-white">
                  Qty {sort.key === 'qty' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('rate')} className="cursor-pointer text-right text-white">
                  Rate (₹) {sort.key === 'rate' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('luggage')} className="cursor-pointer text-right text-white">
                  Luggage (₹) {sort.key === 'luggage' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('amount')} className="cursor-pointer text-right text-white">
                  Net Total (₹) {sort.key === 'amount' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell className="text-white">Actions</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows.map((row, index) => (
                <TableRow key={row.id} className={index % 2 === 1 ? "bg-gray-700" : "bg-gray-800"}>
                  <TableCell className="text-white">{row.date}</TableCell>
                  <TableCell className="text-white">{row.party}</TableCell>
                  <TableCell className="text-white">{row.item}</TableCell>
                  <TableCell className="text-right text-white">{row.qty}</TableCell>
                  <TableCell className="text-right text-white">₹{row.rate}</TableCell>
                  <TableCell className="text-right text-white">₹{row.luggage || 0}</TableCell>
                  <TableCell className="text-right text-white">₹{row.amount}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleEdit(row)} className="mr-2 min-h-11 min-w-11">Edit</Button>
                    <Button size="sm" color="failure" onClick={() => handleDelete(row)} className="min-h-11 min-w-11">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Toast */}
        {toastMessage && (
          <Toast className="fixed top-5 right-5">
            <div className="flex items-center">
              <div className="ml-3 text-sm font-normal">{toastMessage}</div>
            </div>
          </Toast>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 modal-backdrop">
          <div className="bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">{editingRow ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Date and Party Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="block text-sm font-medium text-white mb-1">Date</Label>
                  <TextInput id="date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="dark" />
                </div>
                <div>
                  <Label htmlFor="party" className="block text-sm font-medium text-white mb-1">Party</Label>
                  <Select id="party" value={formParty} onChange={(e) => setFormParty(e.target.value)} className="dark">
                    <option value="" disabled>Select a party</option>
                    {partiesList.map(party => (
                      <option key={party.id} value={party.name}>{party.name}</option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Item Dropdown */}
              <div>
                <Label htmlFor="item" className="block text-sm font-medium text-white mb-1">Item</Label>
                <Select id="item" value={formItem} onChange={(e) => setFormItem(e.target.value)} className="dark">
                  <option value="" disabled>Select an item</option>
                  {itemsList.map(it => (
                    <option key={it.id} value={it.name}>{it.name}</option>
                  ))}
                </Select>
              </div>

              {/* Qty and Unit Section */}
              <div>
                <Label className="block text-sm font-medium text-white mb-2">Quantity & Unit</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qty" className="block text-xs text-gray-300 mb-1">Qty</Label>
                    <TextInput id="qty" type="number" placeholder="Qty" value={formQty} onChange={(e) => setFormQty(e.target.value)} className="dark" />
                  </div>
                  <div>
                    <Label htmlFor="unit" className="block text-xs text-gray-300 mb-1">Unit</Label>
                    <Select id="unit" value={formUnit} onChange={(e) => setFormUnit(e.target.value)} className="dark">
                      <option value="kgs">kgs</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Luggage Section */}
              <div>
                <Label htmlFor="luggage" className="block text-sm font-medium text-white mb-1">Luggage (₹)</Label>
                <TextInput id="luggage" type="number" placeholder="0" value={formLuggage} onChange={(e) => setFormLuggage(e.target.value)} className="dark" />
              </div>

              {/* Rate Section */}
              <div>
                <Label htmlFor="rate" className="block text-sm font-medium text-white mb-1">Rate (₹)</Label>
                <TextInput id="rate" type="number" placeholder={`Rate per ${formUnit}`} value={formRate} onChange={(e) => setFormRate(e.target.value)} className="dark" />
              </div>

              {/* Total Calculation Box */}
              <div className="bg-gray-700 rounded-lg p-4">
                <Label className="block text-sm font-medium text-white mb-3">Calculation Summary</Label>
                <div className="flex justify-center">
                  <div className="bg-blue-600 rounded p-3 text-center w-full max-w-xs">
                    <div className="text-xs text-gray-200 mb-1">Net Total</div>
                    <div className="text-lg font-bold text-white">₹{netTotal.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400 text-center">
                  Net Total = (Rate × Quantity) + Luggage ({formRate || 0} × {formQty || 0}) + ₹{formLuggage || 0}
                </div>
              </div>

            </div>
            <div className="flex justify-between p-4 border-t border-gray-700">
              <Button color="gray" onClick={handleClear}>Clear</Button>
              <div className="flex space-x-2">
                <Button color="light" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionScreen
