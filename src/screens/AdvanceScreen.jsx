import { useState, useEffect, useCallback } from 'react'
import { TextInput, Label, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell } from 'flowbite-react'
import Header from '../components/Header'
import Toast from '../components/Toast'
import { getPartiesData, getToday, getAdvanceData, setAdvanceData } from '../lib/storage'

function AdvanceScreen() {
  const [selectedParty, setSelectedParty] = useState('')
  const [partySearchQuery, setPartySearchQuery] = useState('')
  const [filteredParties, setFilteredParties] = useState([])
  const [showPartyDropdown, setShowPartyDropdown] = useState(false)
  const [isPartySearching, setIsPartySearching] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [advanceAmount, setAdvanceAmount] = useState('')
  const [partiesList, setPartiesList] = useState([])
  const [advanceRecords, setAdvanceRecords] = useState([])
  const [editingRecord, setEditingRecord] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Table search states
  const [tableSearchParty, setTableSearchParty] = useState('')
  const [tableSearchQuery, setTableSearchQuery] = useState('')
  const [tableFilteredParties, setTableFilteredParties] = useState([])
  const [showTableDropdown, setShowTableDropdown] = useState(false)
  const [isTableSearching, setIsTableSearching] = useState(false)
  const today = getToday()

  // Debounced party search function
  const debouncePartySearch = useCallback((query) => {
    if (!selectedParty) {
      setIsPartySearching(true)
      setShowPartyDropdown(true)
    }

    const timeoutId = setTimeout(() => {
      if (!selectedParty) {
        if (query.trim()) {
          const filtered = partiesList.filter(party =>
            party.name.toLowerCase().includes(query.toLowerCase())
          )
          setFilteredParties(filtered)
        } else {
          // Show all parties if no search query
          setFilteredParties(partiesList)
        }
        setIsPartySearching(false)
        setShowPartyDropdown(true)
      } else {
        setFilteredParties([])
        setShowPartyDropdown(false)
        setIsPartySearching(false)
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      setIsPartySearching(false)
    }
  }, [partiesList, selectedParty])

  // Debounced table search function
  const debounceTableSearch = useCallback((query) => {
    if (!tableSearchParty) {
      setIsTableSearching(true)
      setShowTableDropdown(true)
    }

    const timeoutId = setTimeout(() => {
      if (!tableSearchParty) {
        if (query.trim()) {
          const filtered = partiesList.filter(party =>
            party.name.toLowerCase().includes(query.toLowerCase())
          )
          setTableFilteredParties(filtered)
        } else {
          // Show all parties if no search query
          setTableFilteredParties(partiesList)
        }
        setIsTableSearching(false)
        setShowTableDropdown(true)
      } else {
        setTableFilteredParties([])
        setShowTableDropdown(false)
        setIsTableSearching(false)
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      setIsTableSearching(false)
    }
  }, [partiesList, tableSearchParty])

  useEffect(() => {
    // Load parties for dropdown
    const parties = getPartiesData()
    setPartiesList(parties)

    // Load existing advance records
    const advances = getAdvanceData()
    setAdvanceRecords(advances)
  }, [])

  useEffect(() => {
    if (editingRecord) {
      setSelectedParty(editingRecord.party)
      setPartySearchQuery(editingRecord.party)
      setSelectedDate(editingRecord.date)
      setAdvanceAmount(editingRecord.advance.toString())
    } else {
      setSelectedParty('')
      setPartySearchQuery('')
      setSelectedDate(today)
      setAdvanceAmount('')
    }
  }, [editingRecord, today])

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
    const cleanup = debouncePartySearch(partySearchQuery)
    return cleanup
  }, [partySearchQuery, debouncePartySearch])

  useEffect(() => {
    const cleanup = debounceTableSearch(tableSearchQuery)
    return cleanup
  }, [tableSearchQuery, debounceTableSearch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.party-search-container')) {
        setShowPartyDropdown(false)
      }
      if (!event.target.closest('.table-search-container')) {
        setShowTableDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSave = () => {
    // Validation
    if (!selectedParty) {
      setToastMessage('Please select a party.')
      return
    }

    if (!selectedDate) {
      setToastMessage('Please select a date.')
      return
    }

    if (!advanceAmount || Number(advanceAmount) <= 0) {
      setToastMessage('Please enter a valid advance amount.')
      return
    }

    const newRecord = {
      id: editingRecord ? editingRecord.id : crypto.randomUUID(),
      party: selectedParty,
      date: selectedDate,
      advance: Number(advanceAmount)
    }

    let updatedRecords
    if (editingRecord) {
      // Update existing record
      updatedRecords = advanceRecords.map(record =>
        record.id === editingRecord.id ? newRecord : record
      )
      setToastMessage('Advance record updated successfully!')
    } else {
      // Add new record
      updatedRecords = [...advanceRecords, newRecord]
      setToastMessage('Advance record added successfully!')
    }

    setAdvanceRecords(updatedRecords)
    setAdvanceData(updatedRecords)

    // Clear form and close modal
    setSelectedParty('')
    setPartySearchQuery('')
    setSelectedDate(today)
    setAdvanceAmount('')
    setEditingRecord(null)
    setIsModalOpen(false)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setIsModalOpen(true)
  }

  const handleDelete = (record) => {
    if (window.confirm('Are you sure you want to delete this advance record?')) {
      const updatedRecords = advanceRecords.filter(r => r.id !== record.id)
      setAdvanceRecords(updatedRecords)
      setAdvanceData(updatedRecords)
      setToastMessage('Advance record deleted successfully!')
    }
  }

  const handleCancel = () => {
    setEditingRecord(null)
    setSelectedParty('')
    setPartySearchQuery('')
    setSelectedDate(today)
    setAdvanceAmount('')
    setIsModalOpen(false)
  }

  // Function to get total advance for a specific party
  const getTotalAdvanceForParty = (partyName) => {
    return advanceRecords
      .filter(record =>
        record.party.trim().toLowerCase() === partyName.trim().toLowerCase()
      )
      .reduce((total, record) => total + record.advance, 0)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onAddClick={() => { setEditingRecord(null); setIsModalOpen(true); }} />
      <main className="w-full px-4 py-3 mx-8">
        <Toast 
          message={toastMessage} 
          type={toastMessage?.includes('successfully') ? 'success' : 'error'}
          onClose={() => setToastMessage('')}
        />

        {/* Party Search for Table */}
        {advanceRecords.length > 0 && (
          <div className="mb-6">
            <div className="relative table-search-container max-w-md">
              <Label htmlFor="table-party-search" className="block text-sm font-medium text-white mb-2">
                Filter by Party (Optional)
              </Label>
              <TextInput
                id="table-party-search"
                type="text"
                placeholder="Type to search for a party..."
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                onFocus={() => !tableSearchParty && setShowTableDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowTableDropdown(false), 150)
                }}
                disabled={tableSearchParty}
                className="dark w-full"
              />

              {/* Loading Spinner */}
              {showTableDropdown && isTableSearching && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                  <div className="px-4 py-3 flex items-center gap-3 text-gray-300">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-400"></div>
                    <span className="text-sm">Searching...</span>
                  </div>
                </div>
              )}

              {/* Search Results Dropdown */}
              {showTableDropdown && !isTableSearching && !tableSearchParty && tableFilteredParties.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {tableFilteredParties.map((party) => (
                    <div
                      key={party.id}
                      className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white border-b border-gray-700 last:border-b-0"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setTableSearchParty(party.name)
                        setTableSearchQuery(party.name)
                        setShowTableDropdown(false)
                        setIsTableSearching(false)
                        document.getElementById('table-party-search')?.blur()
                      }}
                    >
                      {party.name}
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showTableDropdown && !isTableSearching && !tableSearchParty && tableSearchQuery && tableFilteredParties.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                  <div className="px-4 py-2 text-gray-400">
                    No parties found matching "{tableSearchQuery}"
                  </div>
                </div>
              )}

              {/* Selected party display with total advance */}
              {tableSearchParty && (
                <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-400">Filtered by: {tableSearchParty}</span>
                    <button
                      onClick={() => {
                        setTableSearchParty('')
                        setTableSearchQuery('')
                        setShowTableDropdown(false)
                        setIsTableSearching(false)
                      }}
                      className="px-3 py-1 text-sm text-white bg-transparent border border-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Clear Filter
                    </button>
                  </div>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-green-400">
                      Total Advance: ₹{getTotalAdvanceForParty(tableSearchParty).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advance Records Table */}
        {advanceRecords.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Advance Records {tableSearchParty && `- ${tableSearchParty}`}
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHead className="bg-gray-700">
                  <TableRow>
                    <TableHeadCell className="text-white">Party</TableHeadCell>
                    <TableHeadCell className="text-white">Date</TableHeadCell>
                    <TableHeadCell className="text-right text-white">Advance (₹)</TableHeadCell>
                    <TableHeadCell className="text-white">Actions</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {advanceRecords
                    .filter(record =>
                      !tableSearchParty || 
                      record.party.trim().toLowerCase() === tableSearchParty.trim().toLowerCase()
                    )
                    .map((record, index) => (
                      <TableRow key={record.id} className={index % 2 === 1 ? "bg-gray-700" : "bg-gray-800"}>
                        <TableCell className="text-white">{record.party}</TableCell>
                        <TableCell className="text-white">{record.date}</TableCell>
                        <TableCell className="text-right text-white">₹{record.advance.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleEdit(record)}
                            className="mr-2 min-h-11 min-w-11"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="failure"
                            onClick={() => handleDelete(record)}
                            className="min-h-11 min-w-11"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No advance records found</div>
            <div className="text-gray-500 text-sm">Click the "+" button to add your first advance record</div>
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 modal-backdrop">
          <div className="bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">{editingRecord ? 'Edit Advance' : 'Add Advance'}</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Party Search Input */}
              <div className="relative party-search-container mb-0">
                <Label htmlFor="party-search" className="block text-sm font-medium text-white mb-2">
                  Party
                </Label>
                <TextInput
                  id="party-search"
                  type="text"
                  placeholder="Type to search for a party..."
                  value={partySearchQuery}
                  onChange={(e) => setPartySearchQuery(e.target.value)}
                  onFocus={() => !selectedParty && setShowPartyDropdown(true)}
                  onBlur={() => {
                    setTimeout(() => setShowPartyDropdown(false), 150)
                  }}
                  disabled={selectedParty}
                  className="dark w-full"
                />

                {/* Loading Spinner */}
                {showPartyDropdown && isPartySearching && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                    <div className="px-4 py-3 flex items-center gap-3 text-gray-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-400"></div>
                      <span className="text-sm">Searching...</span>
                    </div>
                  </div>
                )}

                {/* Search Results Dropdown */}
                {showPartyDropdown && !isPartySearching && !selectedParty && filteredParties.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredParties.map((party) => (
                      <div
                        key={party.id}
                        className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white border-b border-gray-700 last:border-b-0"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setSelectedParty(party.name)
                          setPartySearchQuery(party.name)
                          setShowPartyDropdown(false)
                          setIsPartySearching(false)
                          document.getElementById('party-search')?.blur()
                        }}
                      >
                        {party.name}
                      </div>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {showPartyDropdown && !isPartySearching && !selectedParty && partySearchQuery && filteredParties.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                    <div className="px-4 py-2 text-gray-400">
                      No parties found matching "{partySearchQuery}"
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
                        setPartySearchQuery('')
                        setShowPartyDropdown(false)
                        setIsPartySearching(false)
                      }}
                      className="px-3 py-1 text-sm text-white bg-transparent border border-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Date Selection with Today Button */}
              <div>
                <Label htmlFor="advance-date" className="block text-sm font-medium text-white mb-2">
                  Date
                </Label>
                <div className="flex gap-2">
                  <TextInput
                    id="advance-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="dark flex-1"
                  />
                  <Button
                    size="sm"
                    color="gray"
                    onClick={() => setSelectedDate(today)}
                    className="px-3"
                  >
                    Today
                  </Button>
                </div>
              </div>

              {/* Advance Amount Input */}
              <div>
                <Label htmlFor="advance-amount" className="block text-sm font-medium text-white mb-2">
                  Advance
                </Label>
                <TextInput
                  id="advance-amount"
                  type="number"
                  placeholder="Enter advance amount"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  className="dark w-full"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-700">
              <Button color="light" onClick={handleCancel}>Cancel</Button>
              <Button color="blue" size="lg" onClick={handleSave} className="px-8 font-semibold">
                {editingRecord ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvanceScreen