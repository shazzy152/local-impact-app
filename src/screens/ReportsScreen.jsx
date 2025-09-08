import { useState, useEffect } from 'react'
import { Select, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, TextInput } from 'flowbite-react'
import Header from '../components/Header'
import { getTransactionsData, getPartiesData } from '../lib/storage'

function ReportsScreen() {
  const [parties, setParties] = useState([])
  const [selectedParty, setSelectedParty] = useState('')
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' })
  const [commission, setCommission] = useState('')

  useEffect(() => {
    // Load parties and transactions data
    const partiesData = getPartiesData()
    const transactionsData = getTransactionsData()
    
    setParties(partiesData)
    setTransactions(transactionsData)
  }, [])

  useEffect(() => {
    // Filter transactions when party selection changes
    if (selectedParty) {
      const filtered = transactions.filter(transaction => transaction.party === selectedParty)
      setFilteredTransactions(filtered)
    } else {
      setFilteredTransactions([])
    }
  }, [selectedParty, transactions])

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
        
        {/* Party Selection Dropdown */}
        <div className="mb-6">
          <label htmlFor="party-select" className="block text-sm font-medium text-white mb-2">
            Select Party
          </label>
          <Select 
            id="party-select"
            value={selectedParty} 
            onChange={(e) => setSelectedParty(e.target.value)}
            className="w-full max-w-md"
          >
            <option value="">Choose a party...</option>
            {parties.map((party) => (
              <option key={party.id} value={party.name}>
                {party.name}
              </option>
            ))}
          </Select>
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
                        placeholder="Enter commission percentage"
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
