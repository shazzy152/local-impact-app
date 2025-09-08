import { useState, useEffect } from 'react'
import { Card, Badge, TextInput, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Button, Toast } from 'flowbite-react'
import { getToday, getTransactionsData, setTransactionsData, computeAmount } from '../lib/storage'
import Header from '../components/Header'

function TodayScreen() {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState({ key: 'date', dir: 'asc' })
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  const [toastMessage, setToastMessage] = useState('')
  const today = getToday()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(timer)
  }, [search])

  

  useEffect(() => {
    // Get all transactions and filter based on date range
    let allTransactions = getTransactionsData()
    let filteredTransactions = allTransactions
    
    if (dateFrom && dateTo) {
      // Filter by date range
      filteredTransactions = allTransactions.filter(transaction => 
        transaction.date >= dateFrom && transaction.date <= dateTo
      )
    } else if (dateFrom) {
      // Filter from date onwards
      filteredTransactions = allTransactions.filter(transaction => 
        transaction.date >= dateFrom
      )
    } else if (dateTo) {
      // Filter up to date
      filteredTransactions = allTransactions.filter(transaction => 
        transaction.date <= dateTo
      )
    } else {
      // Default to today's transactions if no date filter is set
      filteredTransactions = allTransactions.filter(transaction => transaction.date === today)
    }
    
    setRows(filteredTransactions)
  }, [today, dateFrom, dateTo])

  const handleSort = (key) => {
    setSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
    }))
  }

  const filteredRows = rows.filter(row =>
    row.party.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    row.item.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const sortedRows = [...filteredRows].sort((a, b) => {
    const aVal = a[sort.key]
    const bVal = b[sort.key]
    if (sort.dir === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
    }
  })

  const handleDelete = (row) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      // Remove from main transactions data
      let allTransactions = getTransactionsData()
      const updatedTransactions = allTransactions.filter(r => r.id !== row.id)
      setTransactionsData(updatedTransactions)
      
      // Update local state with today's transactions only
      const todaysTransactions = updatedTransactions.filter(transaction => transaction.date === today)
      setRows(todaysTransactions)
      
      setToastMessage('Entry deleted successfully!')
      setTimeout(() => setToastMessage(''), 3000)
    }
  }
  

  const salesCount = rows.length
  const totalQty = rows.reduce((sum, row) => sum + Number(row.qty || 0), 0)
  const totalRevenue = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const formattedRevenue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalRevenue)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

  {/* Page Container */}
  <main className="w-full px-4 py-3 mx-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
          <Card className="bg-gray-800 border-gray-700 p-2 sm:p-4">
            <h5 className="text-xs sm:text-sm text-gray-300">Total Qty</h5>
            <p className="text-lg sm:text-2xl font-semibold text-white">{totalQty}</p>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-2 sm:p-4">
            <h5 className="text-xs sm:text-sm text-gray-300">Revenue</h5>
            <p className="text-sm sm:text-xl font-semibold text-white">{formattedRevenue}</p>
          </Card>
        </div>

        {/* Date Filter Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
            <div>
              <label htmlFor="dateFrom" className="block text-xs text-gray-400 mb-1">From:</label>
              <TextInput
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="dark text-sm"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="block text-xs text-gray-400 mb-1">To:</label>
              <TextInput
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="dark text-sm"
              />
            </div>
            <div>
              <Button 
                size="sm" 
                color="gray" 
                onClick={() => {
                  setDateFrom(today)
                  setDateTo(today)
                }}
                className="w-full"
              >
                Today
              </Button>
            </div>
            <div>
              <Button 
                size="sm" 
                color="gray" 
                onClick={() => {
                  setDateFrom('')
                  setDateTo('')
                }}
                className="w-full"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <TextInput
            placeholder="Search by party or item…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                <TableHeadCell onClick={() => handleSort('amount')} className="cursor-pointer text-right text-white">
                  Amount (₹) {sort.key === 'amount' && (sort.dir === 'asc' ? '▲' : '▼')}
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
                  <TableCell className="text-right text-white">₹{row.amount}</TableCell>
                  <TableCell>
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
    </div>
  )
}

export default TodayScreen
