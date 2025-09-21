import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, Badge, TextInput, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Button, Select, Textarea, Label } from 'flowbite-react'
import { getToday, getTransactionsData, setTransactionsData, computeAmount, getItemsData, getPartiesData, getVendorsData } from '../lib/storage'
import Header from '../components/Header'
import Toast from '../components/Toast'

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
  const [formGroupRate, setFormGroupRate] = useState('')
  const [formVendorRate, setFormVendorRate] = useState('')
  const [formLuggage, setFormLuggage] = useState('')
  const [formUnit, setFormUnit] = useState('kgs')
  const [formDriver, setFormDriver] = useState('')
  const [formVendor, setFormVendor] = useState('')
  const [itemsList, setItemsList] = useState([])
  const [partiesList, setPartiesList] = useState([])
  const [vendorsList, setVendorsList] = useState([])
  const [availableDrivers, setAvailableDrivers] = useState([])
  const [vendorSearchQuery, setVendorSearchQuery] = useState('')
  const [filteredVendors, setFilteredVendors] = useState([])
  const [showVendorDropdown, setShowVendorDropdown] = useState(false)
  const [isVendorSearching, setIsVendorSearching] = useState(false)
  const [partySearchQuery, setPartySearchQuery] = useState('')
  const [filteredParties, setFilteredParties] = useState([])
  const [showPartyDropdown, setShowPartyDropdown] = useState(false)
  const [isPartySearching, setIsPartySearching] = useState(false)
  const [modalErrorMessage, setModalErrorMessage] = useState('')
  const [modalSuccessMessage, setModalSuccessMessage] = useState('')
  const modalRef = useRef(null)
  const hasPrefilledDriverRef = useRef(false)
  const today = getToday()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(timer)
  }, [search])

  // Debounced party search function
  const debouncePartySearch = useCallback((query) => {
    if (query.trim()) {
      setIsPartySearching(true)
      setShowPartyDropdown(true)
    }

    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        const filtered = partiesList.filter(party =>
          party.name.toLowerCase().includes(query.toLowerCase())
        )
        setFilteredParties(filtered)
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
  }, [partiesList])

  // Debounced vendor search function
  const debounceVendorSearch = useCallback((query) => {
    if (query.trim()) {
      setIsVendorSearching(true)
      setShowVendorDropdown(true)
    }

    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        const filtered = vendorsList.filter(vendor =>
          vendor.name.toLowerCase().includes(query.toLowerCase())
        )
        setFilteredVendors(filtered)
        setIsVendorSearching(false)
        setShowVendorDropdown(true)
      } else {
        setFilteredVendors([])
        setShowVendorDropdown(false)
        setIsVendorSearching(false)
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      setIsVendorSearching(false)
    }
  }, [vendorsList])

  useEffect(() => {
    hasPrefilledDriverRef.current = false
    if (editingRow) {
      setFormDate(editingRow.date)
      setFormParty(editingRow.party)
      setPartySearchQuery(editingRow.party)
      setFormItem(editingRow.item)
      setFormQty(editingRow.qty)
      setFormGroupRate(editingRow.groupRate || editingRow.rate || '')
      setFormVendorRate(editingRow.vendorRate || '')
      setFormLuggage(editingRow.luggage || '')
      setFormUnit(editingRow.unit || 'kgs')
      setFormDriver(editingRow.driver || '')
      setFormVendor(editingRow.vendor || '')
      setVendorSearchQuery(editingRow.vendor || '')
    } else {
      setFormDate(today)
      setFormParty('')
      setPartySearchQuery('')
      setFormItem('')
      setFormQty('')
      setFormGroupRate('')
      setFormVendorRate('')
      setFormLuggage('')
      setFormUnit('kgs')
      setFormDriver('')
      setFormVendor('')
      setVendorSearchQuery('')
    }
  }, [editingRow, today])

  useEffect(() => {
    const cleanup = debouncePartySearch(partySearchQuery)
    return cleanup
  }, [partySearchQuery, debouncePartySearch])

  useEffect(() => {
    const cleanup = debounceVendorSearch(vendorSearchQuery)
    return cleanup
  }, [vendorSearchQuery, debounceVendorSearch])

  // Update available drivers when party is selected
  useEffect(() => {
    if (formParty) {
      const selectedParty = partiesList.find(party => party.name === formParty)
      if (selectedParty && selectedParty.drivers) {
        setAvailableDrivers(selectedParty.drivers)
      } else {
        setAvailableDrivers([])
      }
      // Clear driver selection when party changes
      if (!editingRow) {
        setFormDriver('')
      }
    } else {
      setAvailableDrivers([])
      setFormDriver('')
    }
  }, [formParty, partiesList, editingRow])

  useEffect(() => {
    if (!editingRow || hasPrefilledDriverRef.current) return
    if (!editingRow.driver) {
      hasPrefilledDriverRef.current = true
      return
    }
    if (formParty !== editingRow.party) return

    const driverExists = availableDrivers.some(driver => driver.name === editingRow.driver)

    if (driverExists && !formDriver) {
      setFormDriver(editingRow.driver)
      hasPrefilledDriverRef.current = true
    }
  }, [editingRow, formParty, availableDrivers, formDriver])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.party-search-container')) {
        setShowPartyDropdown(false)
      }
      if (!event.target.closest('.vendor-search-container')) {
        setShowVendorDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  // Ensure modal always opens with today's date for new entries
  useEffect(() => {
    if (isModalOpen && !editingRow) {
      setFormDate(today)
    }
  }, [isModalOpen, editingRow, today])

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

    // Load vendors for dropdown
    const vendors = getVendorsData()
    setVendorsList(vendors)
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
    // Validate required fields
    if (!formParty) {
      setModalErrorMessage('Please select a party.')
      setTimeout(() => {
        modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
      setTimeout(() => setModalErrorMessage(''), 3000)
      return
    }

    if (!formItem) {
      setModalErrorMessage('Please select an item.')
      setTimeout(() => {
        modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
      setTimeout(() => setModalErrorMessage(''), 3000)
      return
    }

    if (!formQty || Number(formQty) <= 0) {
      setModalErrorMessage('Please enter a valid quantity.')
      setTimeout(() => {
        modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
      setTimeout(() => setModalErrorMessage(''), 3000)
      return
    }

    if (!formGroupRate || Number(formGroupRate) <= 0) {
      setModalErrorMessage('Please enter a valid group rate.')
      setTimeout(() => {
        modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
      setTimeout(() => setModalErrorMessage(''), 3000)
      return
    }

    const amount = computeAmount({ qty: formQty, rate: formGroupRate, luggage: formLuggage })

    const newRow = {
      id: editingRow ? editingRow.id : crypto.randomUUID(),
      date: formDate,
      party: formParty,
      vendor: formVendor,
      item: formItem,
      qty: Number(formQty),
      groupRate: Number(formGroupRate),
      vendorRate: Number(formVendorRate) || 0,
      rate: Number(formGroupRate), // Keep for backward compatibility
      luggage: Number(formLuggage) || 0,
      amount,
      unit: formUnit,
      driver: formDriver
    }
    let updatedRows
    if (editingRow) {
      updatedRows = rows.map(r => r.id === editingRow.id ? newRow : r)
    } else {
      updatedRows = [...rows, newRow]
    }
    setRows(updatedRows)
    setTransactionsData(updatedRows)

    // Show success message in modal
    const successMsg = editingRow ? 'Entry updated successfully!' : 'Entry added successfully!'
    setModalSuccessMessage(successMsg)
    setModalErrorMessage('') // Clear any error messages

    // Auto scroll to top to show success message
    setTimeout(() => {
      modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)

    // Close modal after showing success message
    setTimeout(() => {
      // Clear form only for new entries (not edits)
      if (!editingRow) {
        setFormDate(today)
        setFormParty('')
        setPartySearchQuery('')
        setFormVendor('')
        setVendorSearchQuery('')
        setFormItem('')
        setFormQty('')
        setFormGroupRate('')
        setFormVendorRate('')
        setFormLuggage('')
        setFormUnit('kgs')
        setFormDriver('')
        setShowPartyDropdown(false)
        setIsPartySearching(false)
        setShowVendorDropdown(false)
        setIsVendorSearching(false)
      }

      setIsModalOpen(false)
      setEditingRow(null)
      setModalSuccessMessage('')
      setToastMessage(successMsg)
      setTimeout(() => setToastMessage(''), 3000)
    }, 1500) // Show success for 1.5 seconds before closing
  }

  const handleClear = () => {
    setFormDate(today)
    setFormParty('')
    setPartySearchQuery('')
    setFormVendor('')
    setVendorSearchQuery('')
    setFormItem('')
    setFormQty('')
    setFormGroupRate('')
    setFormVendorRate('')
    setFormLuggage('')
    setFormUnit('kgs')
    setFormDriver('')
    setShowPartyDropdown(false)
    setShowVendorDropdown(false)
    setIsPartySearching(false)
    setModalErrorMessage('')
    setModalSuccessMessage('')
  }

  // Calculate totals for display
  const groupTotal = computeAmount({ qty: formQty, rate: formGroupRate, luggage: formLuggage })
  const vendorTotal = formVendorRate ? (Number(formQty) || 0) * (Number(formVendorRate) || 0) : 0

  const parties = [...new Set(rows.map(r => r.party))]

  const totalTransactions = rows.length
  const totalRevenue = rows.filter(row => row.status === 'Completed').reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const pendingAmount = rows.filter(row => row.status === 'Pending').reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const formattedTotalRevenue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalRevenue)
  const formattedPendingAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(pendingAmount)

  // Function to get driver mobile number
  const getDriverMobile = (partyName, driverName) => {
    if (!partyName || !driverName) return null
    
    const party = partiesList.find(p => p.name === partyName)
    if (!party || !party.drivers) return null
    
    const driver = party.drivers.find(d => d.name === driverName)
    return driver ? driver.mobile : null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onAddClick={() => {
        setEditingRow(null);
        setFormDate(today);
        setIsModalOpen(true);
      }} />

      {/* Page Container */}
      <main className="w-full px-4 py-3 mx-8">



        {/* Table */}
        <div className="overflow-auto max-h-[calc(100vh-100px)]">
          <Table>
            <TableHead className="sticky top-0 bg-gray-800 z-10">
              <TableRow>
                <TableHeadCell onClick={() => handleSort('date')} className="cursor-pointer text-white">
                  Date {sort.key === 'date' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('party')} className="cursor-pointer text-white">
                  Party {sort.key === 'party' && (sort.dir === 'asc' ? '▲' : '▼')}
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
                <TableHeadCell className="text-white">Actions</TableHeadCell>
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
                  <TableCell>
                    <Button size="sm" onClick={() => handleEdit(row)} className="mr-2 min-h-11 min-w-11">Edit</Button>
                    <Button size="sm" color="failure" onClick={() => handleDelete(row)} className="min-h-11 min-w-11">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <Toast
        message={toastMessage}
        type="success"
        onClose={() => setToastMessage('')}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 modal-backdrop">
          <div ref={modalRef} className="bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">{editingRow ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setModalErrorMessage('')
                  setModalSuccessMessage('')
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Error Toast */}
            {modalErrorMessage && (
              <div className="mx-4 mt-4">
                <div className="bg-red-600 text-white px-4 py-3 rounded-lg border-l-4 border-red-800">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{modalErrorMessage}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Success Toast */}
            {modalSuccessMessage && (
              <div className="mx-4 mt-4">
                <div className="bg-green-600 text-white px-4 py-3 rounded-lg border-l-4 border-green-800">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{modalSuccessMessage}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Date - Full Width */}
              <div>
                <Label htmlFor="date" className="block text-sm font-medium text-white mb-1">Date</Label>
                <TextInput id="date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="dark w-full" />
              </div>

              {/* Party Search - Full Width */}
              <div className="relative party-search-container mb-0">
                <Label htmlFor="party-search" className="block text-sm font-medium text-white mb-1">Group</Label>
                <TextInput
                  id="party-search"
                  type="text"
                  placeholder="Type to search for a party..."
                  value={partySearchQuery}
                  onChange={(e) => setPartySearchQuery(e.target.value)}
                  onFocus={() => {
                    if (!formParty) {
                      setShowPartyDropdown(true)
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowPartyDropdown(false), 200)
                  }}
                  disabled={formParty}
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
                {showPartyDropdown && !isPartySearching && !formParty && filteredParties.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredParties.map((party) => (
                      <div
                        key={party.id}
                        className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white border-b border-gray-700 last:border-b-0"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setFormParty(party.name)
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
                {showPartyDropdown && !isPartySearching && !formParty && partySearchQuery && filteredParties.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                    <div className="px-4 py-2 text-gray-400">
                      No parties found matching "{partySearchQuery}"
                    </div>
                  </div>
                )}

                {/* Selected party display */}
                {formParty && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-400"></span>
                    <button
                      onClick={() => {
                        setFormParty('')
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

              {/* Driver Dropdown - Only show when party is selected */}
              {formParty && availableDrivers.length > 0 && (
                <div>
                  <Label htmlFor="driver" className="block text-sm font-medium text-white mb-1">Farmer</Label>
                  <Select id="driver" value={formDriver} onChange={(e) => setFormDriver(e.target.value)} className="dark">
                    <option value="">Select a farmer (optional)</option>
                    {availableDrivers.map(driver => (
                      <option key={driver.id} value={driver.name}>{driver.name} - {driver.mobile}</option>
                    ))}
                  </Select>
                </div>
              )}

              {/* Vendor Search - Full Width */}
              <div className="relative vendor-search-container mb-0">
                <Label htmlFor="vendor-search" className="block text-sm font-medium text-white mb-1">Vendor</Label>
                <TextInput
                  id="vendor-search"
                  type="text"
                  placeholder="Type to search for a vendor..."
                  value={vendorSearchQuery}
                  onChange={(e) => setVendorSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (!formVendor) {
                      setShowVendorDropdown(true)
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowVendorDropdown(false), 200)
                  }}
                  disabled={formVendor}
                  className="dark w-full"
                />

                {/* Loading Spinner */}
                {showVendorDropdown && isVendorSearching && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                    <div className="px-4 py-3 flex items-center gap-3 text-gray-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-400"></div>
                      <span className="text-sm">Searching...</span>
                    </div>
                  </div>
                )}

                {/* Search Results Dropdown */}
                {showVendorDropdown && !isVendorSearching && !formVendor && filteredVendors.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredVendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white border-b border-gray-700 last:border-b-0"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setFormVendor(vendor.name)
                          setVendorSearchQuery(vendor.name)
                          setShowVendorDropdown(false)
                          setIsVendorSearching(false)
                          document.getElementById('vendor-search')?.blur()
                        }}
                      >
                        {vendor.name}
                      </div>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {showVendorDropdown && !isVendorSearching && !formVendor && vendorSearchQuery && filteredVendors.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                    <div className="px-4 py-2 text-gray-400">
                      No vendors found matching "{vendorSearchQuery}"
                    </div>
                  </div>
                )}

                {/* Selected vendor display */}
                {formVendor && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-400"></span>
                    <button
                      onClick={() => {
                        setFormVendor('')
                        setVendorSearchQuery('')
                        setShowVendorDropdown(false)
                        setIsVendorSearching(false)
                      }}
                      className="px-3 py-1 text-sm text-white bg-transparent border border-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
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

              {/* Rate Section - Split into Group Rate and Vendor Rate */}
              <div>
                <Label className="block text-sm font-medium text-white mb-2">Rates (₹)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="groupRate" className="block text-xs text-gray-300 mb-1">Group Rate *</Label>
                    <TextInput id="groupRate" type="number" placeholder={`Rate per ${formUnit}`} value={formGroupRate} onChange={(e) => setFormGroupRate(e.target.value)} className="dark" />
                  </div>
                  <div>
                    <Label htmlFor="vendorRate" className="block text-xs text-gray-300 mb-1">Vendor Rate</Label>
                    <TextInput id="vendorRate" type="number" placeholder={`Rate per ${formUnit}`} value={formVendorRate} onChange={(e) => setFormVendorRate(e.target.value)} className="dark" />
                  </div>
                </div>
              </div>

              {/* Total Display - Split into Group and Vendor */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Group Total */}
                  <div className="bg-blue-600 rounded p-3 text-center">
                    <div className="text-xs text-gray-200 mb-1">Group Total</div>
                    <div className="text-lg font-bold text-white">₹{groupTotal.toFixed(2)}</div>
                  </div>

                  {/* Vendor Total */}
                  <div className="bg-green-600 rounded p-3 text-center">
                    <div className="text-xs text-gray-200 mb-1">Vendor Total</div>
                    <div className="text-lg font-bold text-white">₹{vendorTotal.toFixed(2)}</div>
                  </div>
                </div>
              </div>

            </div>
            <div className="flex justify-end p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <Button color="light" onClick={() => {
                  setIsModalOpen(false)
                  setModalErrorMessage('')
                  setModalSuccessMessage('')
                }}>Cancel</Button>
                <Button color="blue" size="lg" onClick={handleSave} className="px-8 font-semibold">Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionScreen
