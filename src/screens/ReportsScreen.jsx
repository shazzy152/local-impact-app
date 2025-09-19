import { useState, useEffect, useCallback } from 'react'
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TextInput, Button } from 'flowbite-react'
import Header from '../components/Header'
import { getTransactionsData, getPartiesData, getToday } from '../lib/storage'

function ReportsScreen() {
  const [parties, setParties] = useState([])
  const [selectedParty, setSelectedParty] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredParties, setFilteredParties] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' })
  const [commission, setCommission] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const today = getToday()

  // Debounced search function
  const debounceSearch = useCallback((query) => {
    // Show loading immediately when user starts typing (but not if party is already selected)
    if (query.trim() && !selectedParty) {
      setIsSearching(true)
      setShowDropdown(true)
    }

    const timeoutId = setTimeout(() => {
      if (query.trim() && !selectedParty) {
        const filtered = parties.filter(party =>
          party.name.toLowerCase().includes(query.toLowerCase())
        )
        setFilteredParties(filtered)
        setIsSearching(false)
        setShowDropdown(true)
      } else {
        setFilteredParties([])
        setShowDropdown(false)
        setIsSearching(false)
      }
    }, 300) // 300ms debounce delay

    return () => {
      clearTimeout(timeoutId)
      setIsSearching(false)
    }
  }, [parties, selectedParty])

  useEffect(() => {
    // Load parties and transactions data
    const partiesData = getPartiesData()
    const transactionsData = getTransactionsData()

    setParties(partiesData)
    setTransactions(transactionsData)
  }, [])

  useEffect(() => {
    const cleanup = debounceSearch(searchQuery)
    return cleanup
  }, [searchQuery, debounceSearch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.party-search-container')) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    // Filter transactions when party selection or date range changes
    if (selectedParty) {
      let filtered = transactions.filter(transaction => transaction.party === selectedParty)

      // Apply date range filter
      if (dateFrom && dateTo) {
        filtered = filtered.filter(transaction =>
          transaction.date >= dateFrom && transaction.date <= dateTo
        )
      } else if (dateFrom) {
        filtered = filtered.filter(transaction =>
          transaction.date >= dateFrom
        )
      } else if (dateTo) {
        filtered = filtered.filter(transaction =>
          transaction.date <= dateTo
        )
      }

      setFilteredTransactions(filtered)
    } else {
      setFilteredTransactions([])
    }
  }, [selectedParty, transactions, dateFrom, dateTo])

  const handleSort = (key) => {
    const newDir = sort.key === key && sort.dir === 'asc' ? 'desc' : 'asc'
    setSort({ key, dir: newDir })
  }

  const sortedRows = [...filteredTransactions].sort((a, b) => {
    let aVal = a[sort.key]
    let bVal = b[sort.key]

    if (sort.key === 'qty' || sort.key === 'rate' || sort.key === 'luggage' || sort.key === 'amount') {
      aVal = Number(aVal)
      bVal = Number(bVal)
    }

    if (aVal < bVal) return sort.dir === 'asc' ? -1 : 1
    if (aVal > bVal) return sort.dir === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="w-full px-4 py-3 mx-8">

        {/* Party Search Input */}
        <div className="mb-2 relative party-search-container">
          <label htmlFor="party-search" className="block text-sm font-medium text-white mb-2">
            Search Party
          </label>
          <TextInput
            id="party-search"
            type="text"
            placeholder="Type to search for a party..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && !selectedParty && setShowDropdown(true)}
            onBlur={() => {
              // Delay hiding dropdown to allow click events to register
              setTimeout(() => setShowDropdown(false), 150)
            }}
            disabled={selectedParty}
            className="w-full max-w-md"
          />

          {/* Loading Spinner */}
          {showDropdown && isSearching && (
            <div className="absolute z-10 w-full max-w-md mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
              <div className="px-4 py-3 flex items-center gap-3 text-gray-300">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-400"></div>
                <span className="text-sm">Searching...</span>
              </div>
            </div>
          )}

          {/* Search Results Dropdown */}
          {showDropdown && !isSearching && filteredParties.length > 0 && (
            <div className="absolute z-10 w-full max-w-md mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredParties.map((party) => (
                <div
                  key={party.id}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white border-b border-gray-700 last:border-b-0"
                  onClick={() => {
                    setSelectedParty(party.name)
                    setSearchQuery(party.name)
                    setShowDropdown(false)
                    setIsSearching(false)
                    // Remove focus from input to prevent dropdown from reopening
                    document.getElementById('party-search')?.blur()
                  }}
                >
                  {party.name}
                </div>
              ))}
            </div>
          )}

          {/* No results message */}
          {showDropdown && !isSearching && searchQuery && filteredParties.length === 0 && (
            <div className="absolute z-10 w-full max-w-md mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
              <div className="px-4 py-2 text-gray-400">
                No parties found matching "{searchQuery}"
              </div>
            </div>
          )}

          {/* Selected party display */}
          {selectedParty && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-400"></span>
              <button
                onClick={() => {
                  setSelectedParty('')
                  setSearchQuery('')
                  setShowDropdown(false)
                  setIsSearching(false)
                }}
                className="px-3 py-1 text-sm text-white bg-transparent border border-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Transaction Table */}
        {selectedParty && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4">
              Transactions for: <span className="text-blue-400">{selectedParty}</span>
            </h3>

            {filteredTransactions.length > 0 ? (
              <>
                {/* Summary Section */}
                <div className="mb-6">
                  {/* Quantity and Luggage cards in one row */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Total Quantity</h4>
                      <p className="text-2xl font-bold text-white">
                        {filteredTransactions.reduce((sum, row) => sum + Number(row.qty || 0), 0)}
                      </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Total Luggage</h4>
                      <p className="text-2xl font-bold text-white">
                        ₹{filteredTransactions.reduce((sum, row) => sum + Number(row.luggage || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Commission input and amount in one row */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <label htmlFor="commission" className="block text-sm font-medium text-gray-300 mb-2">
                        Commission (%)
                      </label>
                      <TextInput
                        id="commission"
                        type="number"
                        placeholder=""
                        value={commission}
                        onChange={(e) => setCommission(e.target.value)}
                        className="w-full"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Commission Amount</h4>
                      <p className="text-2xl font-bold text-yellow-400">
                        ₹{(() => {
                          const total = filteredTransactions.reduce((sum, row) => sum + Number(row.amount || 0), 0);
                          const commissionAmount = (Number(commission) || 0) / 100 * total;
                          return commissionAmount.toLocaleString();
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Total and Net Total cards in one row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Total</h4>
                      <p className="text-2xl font-bold text-green-400">
                        ₹{filteredTransactions.reduce((sum, row) => sum + Number(row.amount || 0), 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Net Total</h4>
                      <p className="text-2xl font-bold text-blue-400">
                        ₹{(() => {
                          const total = filteredTransactions.reduce((sum, row) => sum + Number(row.amount || 0), 0);
                          const luggageTotal = filteredTransactions.reduce((sum, row) => sum + Number(row.luggage || 0), 0);
                          const commissionAmount = (Number(commission) || 0) / 100 * total;
                          const netTotal = total - (commissionAmount + luggageTotal);
                          return netTotal.toLocaleString();
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date Filter Section */}
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                    <div>
                      <label htmlFor="dateFrom" className="block text-xs text-gray-300 mb-1">From:</label>
                      <TextInput
                        id="dateFrom"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="dark text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="dateTo" className="block text-xs text-gray-300 mb-1">To:</label>
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

                {/* Transaction Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHead className="bg-gray-700">
                      <TableRow>
                        <TableHeadCell onClick={() => handleSort('date')} className="cursor-pointer text-white">
                          Date {sort.key === 'date' && (sort.dir === 'asc' ? '▲' : '▼')}
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
                          Amount (₹) {sort.key === 'amount' && (sort.dir === 'asc' ? '▲' : '▼')}
                        </TableHeadCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedRows.map((row, index) => (
                        <TableRow key={row.id} className={index % 2 === 1 ? "bg-gray-700" : "bg-gray-800"}>
                          <TableCell className="text-white">{row.date}</TableCell>
                          <TableCell className="text-white">{row.item}</TableCell>
                          <TableCell className="text-right text-white">{row.qty}</TableCell>
                          <TableCell className="text-right text-white">₹{row.rate}</TableCell>
                          <TableCell className="text-right text-white">₹{row.luggage || 0}</TableCell>
                          <TableCell className="text-right text-white">₹{row.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No transactions found for {selectedParty}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default ReportsScreen
