import { useState, useEffect } from 'react'
import { Card, Badge, TextInput, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Button, Toast, Label } from 'flowbite-react'
import { getToday, getTransactionsData, setTransactionsData, computeAmount, getAdvanceData, getPartiesData } from '../lib/storage'
import Header from '../components/Header'

function TodayScreen() {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState({ key: 'date', dir: 'asc' })
  const [selectedDate, setSelectedDate] = useState('')
  const [showCalculateModal, setShowCalculateModal] = useState(false)

  // Calculate modal form states
  const [calculateDate, setCalculateDate] = useState('')
  const [calculateCash, setCalculateCash] = useState('')
  const [calculateLoan, setCalculateLoan] = useState('')
  const [calculateAdvance, setCalculateAdvance] = useState('')
  const [calculateLuggage, setCalculateLuggage] = useState('')

  const [toastMessage, setToastMessage] = useState('')
  const [advanceData, setAdvanceData] = useState([])
  const [partiesData, setPartiesData] = useState([])
  const today = getToday()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(timer)
  }, [search])



  useEffect(() => {
    // Get all transactions and filter based on selected date
    let allTransactions = getTransactionsData()
    let filteredTransactions = allTransactions

    if (selectedDate) {
      // Filter by selected date
      filteredTransactions = allTransactions.filter(transaction =>
        transaction.date === selectedDate
      )
    } else {
      // Default to today's transactions if no date is selected
      filteredTransactions = allTransactions.filter(transaction => transaction.date === today)
    }

    setRows(filteredTransactions)
  }, [today, selectedDate])

  useEffect(() => {
    // Load advance data
    const advances = getAdvanceData()
    setAdvanceData(advances)

    // Load parties data for driver lookup
    const parties = getPartiesData()
    setPartiesData(parties)
  }, [])

  useEffect(() => {
    // Auto-populate advance, luggage, and vendor loan fields when calculate date changes
    if (calculateDate) {
      const totalAdvance = getTotalAdvanceForDate(calculateDate)
      setCalculateAdvance(totalAdvance.toString())

      const totalLuggage = getTotalLuggageForDate(calculateDate)
      setCalculateLuggage(totalLuggage.toString())

      const totalVendorAmount = getTotalVendorAmountForDate(calculateDate)
      setCalculateLoan(totalVendorAmount.toString())

      // Clear cash field
      setCalculateCash('')
    }
  }, [calculateDate, advanceData])

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



  const salesCount = rows.length
  const totalQty = rows.reduce((sum, row) => sum + Number(row.qty || 0), 0)
  const totalGroupRevenue = rows.reduce((sum, row) => sum + ((Number(row.qty || 0) * Number(row.groupRate || row.rate || 0)) + Number(row.luggage || 0)), 0)
  const totalVendorRevenue = rows.reduce((sum, row) => sum + (Number(row.qty || 0) * Number(row.vendorRate || 0)), 0)
  const formattedGroupRevenue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalGroupRevenue)
  const formattedVendorRevenue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalVendorRevenue)

  // Function to get advance amount for a specific party and date
  const getAdvanceAmount = (party, date) => {
    const advance = advanceData.find(adv => adv.party === party && adv.date === date)
    return advance ? advance.advance : 0
  }

  // Function to get total advance amount for a specific date
  const getTotalAdvanceForDate = (date) => {
    return advanceData
      .filter(adv => adv.date === date)
      .reduce((total, adv) => total + adv.advance, 0)
  }

  // Function to get total luggage amount for a specific date
  const getTotalLuggageForDate = (date) => {
    return getTransactionsData()
      .filter(transaction => transaction.date === date)
      .reduce((total, transaction) => total + Number(transaction.luggage || 0), 0)
  }

  // Function to get total vendor amount for a specific date
  const getTotalVendorAmountForDate = (date) => {
    return getTransactionsData()
      .filter(transaction => transaction.date === date)
      .reduce((total, transaction) => total + (Number(transaction.qty || 0) * Number(transaction.vendorRate || 0)), 0)
  }

  // Function to get driver mobile number
  const getDriverMobile = (partyName, driverName) => {
    if (!partyName || !driverName) return null

    const party = partiesData.find(p => p.name === partyName)
    if (!party || !party.drivers) return null

    const driver = party.drivers.find(d => d.name === driverName)
    return driver ? driver.mobile : null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onCalculateClick={() => {
        setCalculateDate(today)
        setShowCalculateModal(true)
      }} />

      {/* Page Container */}
      <main className="w-full px-4 py-3 mx-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <Card className="bg-gray-800 border-gray-700 p-2 sm:p-4">
            <h5 className="text-xs sm:text-sm text-gray-300">Total Qty</h5>
            <p className="text-lg sm:text-2xl font-semibold text-white">{totalQty}</p>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-2 sm:p-4">
            <h5 className="text-xs sm:text-sm text-gray-300">Group Revenue</h5>
            <p className="text-sm sm:text-xl font-semibold text-green-400">{formattedGroupRevenue}</p>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-2 sm:p-4">
            <h5 className="text-xs sm:text-sm text-gray-300">Vendor Revenue</h5>
            <p className="text-sm sm:text-xl font-semibold text-blue-400">{formattedVendorRevenue}</p>
          </Card>
        </div>

        {/* Date Filter Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
            <div>
              <label htmlFor="selectedDate" className="block text-xs text-gray-400 mb-1">Select Date:</label>
              <input
                id="selectedDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                color="gray"
                onClick={() => {
                  setSelectedDate(today)
                }}
                className="w-full"
              >
                Today
              </Button>
              <Button
                size="sm"
                color="gray"
                onClick={() => {
                  setSelectedDate('')
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
            placeholder="Search by group or item…"
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
                  Group {sort.key === 'party' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('vendor')} className="cursor-pointer text-white">
                  Vendor {sort.key === 'vendor' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('driver')} className="cursor-pointer text-white">
                  Farmer {sort.key === 'driver' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('item')} className="cursor-pointer text-white">
                  Item {sort.key === 'item' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('qty')} className="cursor-pointer text-right text-white">
                  Qty {sort.key === 'qty' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('groupRate')} className="cursor-pointer text-right text-white">
                  Group Rate (₹) {sort.key === 'groupRate' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('vendorRate')} className="cursor-pointer text-right text-white">
                  Vendor Rate (₹) {sort.key === 'vendorRate' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('luggage')} className="cursor-pointer text-right text-white">
                  Luggage (₹) {sort.key === 'luggage' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('groupTotal')} className="cursor-pointer text-right text-white">
                  Group Total (₹) {sort.key === 'groupTotal' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('vendorTotal')} className="cursor-pointer text-right text-white">
                  Vendor Total (₹) {sort.key === 'vendorTotal' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows.map((row, index) => (
                <TableRow key={row.id} className={index % 2 === 1 ? "bg-gray-700" : "bg-gray-800"}>
                  <TableCell className="text-white">{row.date}</TableCell>
                  <TableCell className="text-white">{row.party}</TableCell>
                  <TableCell className="text-white">{row.vendor || '-'}</TableCell>
                  <TableCell className="text-white">
                    {row.driver ? (
                      <div>
                        <div>{row.driver}</div>
                        {getDriverMobile(row.party, row.driver) && (
                          <div className="text-xs text-gray-400">({getDriverMobile(row.party, row.driver)})</div>
                        )}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-white">{row.item}</TableCell>
                  <TableCell className="text-right text-white">{row.qty}</TableCell>
                  <TableCell className="text-right text-white">₹{row.groupRate || row.rate || 0}</TableCell>
                  <TableCell className="text-right text-white">₹{row.vendorRate || 0}</TableCell>
                  <TableCell className="text-right text-white">₹{row.luggage || 0}</TableCell>
                  <TableCell className="text-right text-white">₹{((Number(row.qty || 0) * Number(row.groupRate || row.rate || 0)) + Number(row.luggage || 0)).toFixed(2)}</TableCell>
                  <TableCell className="text-right text-white">₹{((Number(row.qty || 0) * Number(row.vendorRate || 0))).toFixed(2)}</TableCell>
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

        {/* Calculate Modal */}
        {showCalculateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 modal-backdrop">
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Calculate</h3>
                <button
                  onClick={() => setShowCalculateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                {/* Date Picker */}
                <div>
                  <Label htmlFor="calculateDate" className="block text-sm font-medium text-white mb-2">Date</Label>
                  <TextInput
                    id="calculateDate"
                    type="date"
                    value={calculateDate}
                    onChange={(e) => setCalculateDate(e.target.value)}
                    className="dark"
                  />
                </div>

                {/* Cash and Vendor Loan Input Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="calculateCash" className="block text-sm font-medium text-white mb-2">Cash</Label>
                    <TextInput
                      id="calculateCash"
                      type="number"
                      placeholder="0"
                      value={calculateCash}
                      onChange={(e) => setCalculateCash(e.target.value)}
                      className="dark"
                    />
                  </div>
                  <div>
                    <Label htmlFor="calculateLoan" className="block text-sm font-medium text-white mb-2">Vendor Loan</Label>
                    <TextInput
                      id="calculateLoan"
                      type="number"
                      placeholder="0"
                      value={calculateLoan}
                      onChange={(e) => setCalculateLoan(e.target.value)}
                      className="dark"
                    />
                  </div>
                </div>

                {/* Advance and Luggage Input Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="calculateAdvance" className="block text-sm font-medium text-white mb-2">Advance</Label>
                    <TextInput
                      id="calculateAdvance"
                      type="number"
                      placeholder="0"
                      value={calculateAdvance}
                      onChange={(e) => setCalculateAdvance(e.target.value)}
                      className="dark"
                    />
                  </div>
                  <div>
                    <Label htmlFor="calculateLuggage" className="block text-sm font-medium text-white mb-2">Luggage</Label>
                    <TextInput
                      id="calculateLuggage"
                      type="number"
                      placeholder="0"
                      value={calculateLuggage}
                      onChange={(e) => setCalculateLuggage(e.target.value)}
                      className="dark"
                    />
                  </div>
                </div>

                {/* Calculation Summary Box */}
                {calculateDate && (
                  <div className="bg-gray-700 rounded-lg p-4 mt-4">
                    <Label className="block text-sm font-medium text-white mb-3">Revenue Summary</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Group Revenue */}
                      <div className="text-center">
                        <div className="text-xs text-gray-300 mb-1">Group Revenue</div>
                        <div className="text-sm font-bold text-green-400">
                          ₹{(() => {
                            const groupRevenue = getTransactionsData()
                              .filter(transaction => transaction.date === calculateDate)
                              .reduce((sum, row) => sum + ((Number(row.qty || 0) * Number(row.groupRate || row.rate || 0)) + Number(row.luggage || 0)), 0);
                            return groupRevenue.toFixed(2);
                          })()}
                        </div>
                      </div>

                      {/* Vendor Revenue */}
                      <div className="text-center">
                        <div className="text-xs text-gray-300 mb-1">Vendor Revenue</div>
                        <div className="text-sm font-bold text-blue-400">
                          ₹{(() => {
                            const vendorRevenue = getTransactionsData()
                              .filter(transaction => transaction.date === calculateDate)
                              .reduce((sum, row) => sum + (Number(row.qty || 0) * Number(row.vendorRate || 0)), 0);
                            return vendorRevenue.toFixed(2);
                          })()}
                        </div>
                      </div>

                      {/* Profit/Loss */}
                      <div className="text-center">
                        <div className={`text-xs mb-1 ${(() => {
                          const groupRevenue = getTransactionsData()
                            .filter(transaction => transaction.date === calculateDate)
                            .reduce((sum, row) => sum + ((Number(row.qty || 0) * Number(row.groupRate || row.rate || 0)) + Number(row.luggage || 0)), 0);
                          const totalInputs = (Number(calculateCash) || 0) + (Number(calculateLoan) || 0) + (Number(calculateAdvance) || 0);
                          const profitLoss = totalInputs - groupRevenue;
                          return profitLoss >= 0 ? 'text-green-300' : 'text-red-300';
                        })()}`}>
                          {(() => {
                            const groupRevenue = getTransactionsData()
                              .filter(transaction => transaction.date === calculateDate)
                              .reduce((sum, row) => sum + ((Number(row.qty || 0) * Number(row.groupRate || row.rate || 0)) + Number(row.luggage || 0)), 0);
                            const totalInputs = (Number(calculateCash) || 0) + (Number(calculateLoan) || 0) + (Number(calculateAdvance) || 0);
                            const profitLoss = totalInputs - groupRevenue;
                            return profitLoss >= 0 ? 'Profit' : 'Loss';
                          })()}
                        </div>
                        <div className={`text-sm font-bold ${(() => {
                          const groupRevenue = getTransactionsData()
                            .filter(transaction => transaction.date === calculateDate)
                            .reduce((sum, row) => sum + ((Number(row.qty || 0) * Number(row.groupRate || row.rate || 0)) + Number(row.luggage || 0)), 0);
                          const totalInputs = (Number(calculateCash) || 0) + (Number(calculateLoan) || 0) + (Number(calculateAdvance) || 0);
                          const profitLoss = totalInputs - groupRevenue;
                          return profitLoss >= 0 ? 'text-green-400' : 'text-red-400';
                        })()}`}>
                          ₹{(() => {
                            const groupRevenue = getTransactionsData()
                              .filter(transaction => transaction.date === calculateDate)
                              .reduce((sum, row) => sum + ((Number(row.qty || 0) * Number(row.groupRate || row.rate || 0)) + Number(row.luggage || 0)), 0);
                            const totalInputs = (Number(calculateCash) || 0) + (Number(calculateLoan) || 0) + (Number(calculateAdvance) || 0);
                            const profitLoss = totalInputs - groupRevenue;
                            return Math.abs(profitLoss).toFixed(2);
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  color="gray"
                  onClick={() => {
                    setCalculateDate('')
                    setCalculateCash('')
                    setCalculateLoan('')
                    setCalculateAdvance('')
                    setCalculateLuggage('')
                  }}
                >
                  Clear
                </Button>
                <Button
                  color="blue"
                  onClick={() => {
                    setCalculateDate(today)
                  }}
                >
                  Today
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default TodayScreen
