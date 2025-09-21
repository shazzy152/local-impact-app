import { useEffect, useState, useRef } from 'react'
import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from 'flowbite-react'
import Header from '../components/Header'
import Toast from '../components/Toast'
import { getPartiesData, setPartiesData } from '../lib/storage'

function PartiesScreen() {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  // Form fields
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formAddress, setFormAddress] = useState('')

  // Drivers state
  const [drivers, setDrivers] = useState([{ id: crypto.randomUUID(), name: '', mobile: '', isEditing: true }])
  const [editingDriverId, setEditingDriverId] = useState(null)
  const farmersScrollRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (editingRow) {
      setFormName(editingRow.name)
      setFormPhone(editingRow.phone || '')
      setFormAddress(editingRow.address || '')
      setDrivers(editingRow.drivers || [{ id: crypto.randomUUID(), name: '', mobile: '', isEditing: true }])
    } else {
      setFormName('')
      setFormPhone('')
      setFormAddress('')
      setDrivers([{ id: crypto.randomUUID(), name: '', mobile: '', isEditing: true }])
    }
    setEditingDriverId(null)
  }, [editingRow])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) setIsModalOpen(false)
      if (e.key === 'Enter' && isModalOpen) handleSave()
    }
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalOpen])

  useEffect(() => {
    let data = getPartiesData()
    // Remove seed data - start with empty data after purge
    setRows(data)
  }, [])

  const handleSort = (key) => setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }))

  const filtered = rows.filter(r =>
    r.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (r.phone || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (r.address || '').toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sort.key] || ''
    const bVal = b[sort.key] || ''
    if (sort.dir === 'asc') return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
  })

  // Function to scroll farmers container to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      if (farmersScrollRef.current) {
        farmersScrollRef.current.scrollTop = farmersScrollRef.current.scrollHeight
      }
    }, 100) // Small delay to ensure DOM is updated
  }

  // Driver management functions
  const handleDriverChange = (driverId, field, value) => {
    setDrivers(prev => prev.map(driver =>
      driver.id === driverId ? { ...driver, [field]: value } : driver
    ))
  }

  const handleAddDriver = (driverId) => {
    const driver = drivers.find(d => d.id === driverId)
    if (!driver.name.trim() || !driver.mobile.trim()) {
      setToastMessage('Please fill in both farmer name and mobile number.')
      return
    }

    // Check for duplicate name (excluding current driver)
    const otherDrivers = drivers.filter(d => d.id !== driverId)
    const nameExists = otherDrivers.some(d =>
      d.name.trim().toLowerCase() === driver.name.trim().toLowerCase()
    )

    if (nameExists) {
      setToastMessage('A farmer with this name already exists. Please use a different name.')
      return
    }

    // Check for duplicate mobile number (excluding current driver)
    const mobileExists = otherDrivers.some(d =>
      d.mobile.trim() === driver.mobile.trim()
    )

    if (mobileExists) {
      setToastMessage('A farmer with this mobile number already exists. Please use a different number.')
      return
    }

    // Mark current driver as saved (not editing)
    setDrivers(prev => prev.map(driver =>
      driver.id === driverId ? { ...driver, isEditing: false } : driver
    ))

    // Always add new empty driver (no limit)
    setDrivers(prev => [...prev, { id: crypto.randomUUID(), name: '', mobile: '', isEditing: true }])

    // Scroll to bottom to show new farmer field
    scrollToBottom()
  }

  const handleEditDriver = (driverId) => {
    setEditingDriverId(driverId)
    setDrivers(prev => prev.map(driver =>
      driver.id === driverId ? { ...driver, isEditing: true } : driver
    ))
  }

  const handleSaveDriver = (driverId) => {
    const driver = drivers.find(d => d.id === driverId)
    if (!driver.name.trim() || !driver.mobile.trim()) {
      setToastMessage('Please fill in both farmer name and mobile number.')
      return
    }

    // Check for duplicate name (excluding current driver)
    const otherDrivers = drivers.filter(d => d.id !== driverId)
    const nameExists = otherDrivers.some(d =>
      d.name.trim().toLowerCase() === driver.name.trim().toLowerCase()
    )

    if (nameExists) {
      setToastMessage('A farmer with this name already exists. Please use a different name.')
      return
    }

    // Check for duplicate mobile number (excluding current driver)
    const mobileExists = otherDrivers.some(d =>
      d.mobile.trim() === driver.mobile.trim()
    )

    if (mobileExists) {
      setToastMessage('A farmer with this mobile number already exists. Please use a different number.')
      return
    }

    setDrivers(prev => prev.map(driver =>
      driver.id === driverId ? { ...driver, isEditing: false } : driver
    ))
    setEditingDriverId(null)
  }

  const handleDeleteDriver = (driverId) => {
    if (drivers.length > 1) {
      setDrivers(prev => prev.filter(driver => driver.id !== driverId))
    }
  }

  const handleEdit = (row) => { setEditingRow(row); setIsModalOpen(true) }
  const handleDelete = (row) => {
    if (window.confirm('Delete this group?')) {
      const updated = rows.filter(r => r.id !== row.id)
      setRows(updated)
      setPartiesData(updated)
      setToastMessage('Group deleted successfully!')
    }
  }

  const handleSave = () => {
    if (!formName) {
      setToastMessage('Please enter a group name.')
      return
    }

    if (!formPhone || !formPhone.trim()) {
      setToastMessage('Please enter a phone number.')
      return
    }

    // Check for duplicate name or phone (excluding the current editing row)
    const existingParties = editingRow ? rows.filter(r => r.id !== editingRow.id) : rows

    // Check if party name already exists
    const nameExists = existingParties.some(party =>
      party.name.toLowerCase() === formName.toLowerCase()
    )

    if (nameExists) {
      setToastMessage('A group with this name already exists. Please use a different name.')
      return
    }

    // Check if phone already exists
    const phoneExists = existingParties.some(party =>
      party.phone && party.phone.toLowerCase() === formPhone.toLowerCase()
    )

    if (phoneExists) {
      setToastMessage('A group with this phone number already exists. Please use a different phone number.')
      return
    }

    // Filter out empty drivers and ensure all drivers are saved
    const validDrivers = drivers.filter(driver => driver.name.trim() && driver.mobile.trim())

    const newRow = {
      id: editingRow ? editingRow.id : crypto.randomUUID(),
      name: formName,
      phone: formPhone,
      address: formAddress,
      drivers: validDrivers.map(driver => ({ ...driver, isEditing: false }))
    }
    const updated = editingRow ? rows.map(r => r.id === editingRow.id ? newRow : r) : [...rows, newRow]
    setRows(updated)
    setPartiesData(updated)

    // Clear form only for new entries (not edits)
    if (!editingRow) {
      setFormName('')
      setFormPhone('')
      setFormAddress('')
      setDrivers([{ id: crypto.randomUUID(), name: '', mobile: '', isEditing: true }])
    }

    setIsModalOpen(false)
    setEditingRow(null)
    setToastMessage(editingRow ? 'Group updated successfully!' : 'Group added successfully!')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onAddClick={() => { setEditingRow(null); setIsModalOpen(true); }} />

      <Toast
        message={toastMessage}
        type={toastMessage?.includes('successfully') ? 'success' : 'error'}
        onClose={() => setToastMessage('')}
      />

      <main className="w-full px-4 py-3 mx-8">

        <div className="mb-4">
          <TextInput placeholder="Search parties…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHead className="sticky top-0 bg-gray-800">
              <TableRow>
                <TableHeadCell onClick={() => handleSort('name')} className="cursor-pointer text-white">
                  Name {sort.key === 'name' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('phone')} className="cursor-pointer text-white">
                  Phone {sort.key === 'phone' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('address')} className="cursor-pointer text-white">
                  Address {sort.key === 'address' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell className="text-white">Actions</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((row, i) => (
                <TableRow key={row.id} className={i % 2 === 1 ? 'bg-gray-700' : 'bg-gray-800'}>
                  <TableCell className="text-white">{row.name}</TableCell>
                  <TableCell className="text-white">{row.phone}</TableCell>
                  <TableCell className="text-white">{row.address}</TableCell>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 modal-backdrop">
          <div className="bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">{editingRow ? 'Edit Group' : 'Add Group'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-1">Name *</label>
                <TextInput id="name" placeholder="Group name" value={formName} onChange={e => setFormName(e.target.value)} />
              </div>

              {/* Drivers Module */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Farmers</label>
                <div className="border border-gray-600 rounded-lg bg-gray-700">
                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-3 p-3 pb-2 border-b border-gray-600 bg-gray-600">
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-200">Name</label>
                    </div>
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-200">Mobile</label>
                    </div>
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-200">Actions</label>
                    </div>
                  </div>

                  {/* Scrollable Driver Rows */}
                  <div ref={farmersScrollRef} className="p-3 space-y-3" style={{ maxHeight: '170px', overflowY: 'auto' }}>
                    {drivers.map((driver, index) => (
                      <div key={driver.id} className="grid grid-cols-12 gap-3 items-center">
                        {/* Driver Name */}
                        <div className="col-span-4">
                          <TextInput
                            placeholder="Farmer name"
                            value={driver.name}
                            onChange={(e) => handleDriverChange(driver.id, 'name', e.target.value)}
                            disabled={!driver.isEditing}
                            className="text-sm"
                          />
                        </div>

                        {/* Driver Mobile */}
                        <div className="col-span-4">
                          <TextInput
                            placeholder="Mobile number"
                            value={driver.mobile}
                            onChange={(e) => handleDriverChange(driver.id, 'mobile', e.target.value)}
                            disabled={!driver.isEditing}
                            className="text-sm"
                          />
                        </div>

                        {/* Actions */}
                        <div className="col-span-4 flex gap-2">
                          {driver.isEditing ? (
                            <Button
                              size="sm"
                              color="blue"
                              onClick={() => driver.name.trim() && driver.mobile.trim() ? handleAddDriver(driver.id) : handleSaveDriver(driver.id)}
                              className="px-3 py-1 text-xs min-w-[60px]"
                            >
                              {driver.name.trim() && driver.mobile.trim() && index === drivers.length - 1 ? 'Add' : 'Save'}
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                color="gray"
                                onClick={() => handleEditDriver(driver.id)}
                                className="px-3 py-1 text-xs min-w-[50px]"
                              >
                                Edit
                              </Button>
                              {drivers.length > 1 && (
                                <Button
                                  size="sm"
                                  color="failure"
                                  onClick={() => handleDeleteDriver(driver.id)}
                                  className="px-3 py-1 text-xs min-w-[50px]"
                                >
                                  Del
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Farmer Button - Only show in edit mode when no farmer is currently being edited */}
                  {editingRow && !drivers.some(driver => driver.isEditing) && (
                    <div className="p-3 pt-0">
                      <Button
                        size="sm"
                        color="green"
                        onClick={() => {
                          setDrivers(prev => [...prev, { id: crypto.randomUUID(), name: '', mobile: '', isEditing: true }])
                          scrollToBottom()
                        }}
                        className="w-full"
                      >
                        + Add New Farmer
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-1">Phone *</label>
                <TextInput id="phone" placeholder="Phone" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-white mb-1">Address</label>
                <TextInput id="address" placeholder="Address" value={formAddress} onChange={e => setFormAddress(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-700">
              <Button color="light" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button color="blue" size="lg" onClick={handleSave} className="px-8 font-semibold">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PartiesScreen
