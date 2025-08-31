import { useEffect, useState } from 'react'
import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput, Textarea, Toast } from 'flowbite-react'
import Header from '../components/Header'
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
  const [formNotes, setFormNotes] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (editingRow) {
      setFormName(editingRow.name)
      setFormPhone(editingRow.phone || '')
      setFormAddress(editingRow.address || '')
      setFormNotes(editingRow.notes || '')
    } else {
      setFormName('')
      setFormPhone('')
      setFormAddress('')
      setFormNotes('')
    }
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

  const handleEdit = (row) => { setEditingRow(row); setIsModalOpen(true) }
  const handleDelete = (row) => {
    if (window.confirm('Delete this party?')) {
      const updated = rows.filter(r => r.id !== row.id)
      setRows(updated)
      setPartiesData(updated)
      setToastMessage('Party deleted successfully!')
      setTimeout(() => setToastMessage(''), 3000)
    }
  }

  const handleSave = () => {
    if (!formName) {
      alert('Please enter a party name.')
      return
    }
    const newRow = {
      id: editingRow ? editingRow.id : crypto.randomUUID(),
      name: formName,
      phone: formPhone,
      address: formAddress,
      notes: formNotes
    }
    const updated = editingRow ? rows.map(r => r.id === editingRow.id ? newRow : r) : [...rows, newRow]
    setRows(updated)
    setPartiesData(updated)
    setIsModalOpen(false)
    setEditingRow(null)
    setToastMessage(editingRow ? 'Party updated successfully!' : 'Party added successfully!')
    setTimeout(() => setToastMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

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
                <TableHeadCell className="text-white">Notes</TableHeadCell>
                <TableHeadCell className="text-white">Actions</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((row, i) => (
                <TableRow key={row.id} className={i % 2 === 1 ? 'bg-gray-700' : 'bg-gray-800'}>
                  <TableCell className="text-white">{row.name}</TableCell>
                  <TableCell className="text-white">{row.phone}</TableCell>
                  <TableCell className="text-white">{row.address}</TableCell>
                  <TableCell className="text-white">{row.notes}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleEdit(row)} className="mr-2 min-h-11 min-w-11">Edit</Button>
                    <Button size="sm" color="failure" onClick={() => handleDelete(row)} className="min-h-11 min-w-11">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button
          className="fixed bottom-5 right-5 rounded-full h-14 w-14 text-xl shadow-lg"
          onClick={() => { setEditingRow(null); setIsModalOpen(true) }}
        >
          +
        </Button>

        {toastMessage && (
          <Toast className="fixed top-5 right-5">
            <div className="flex items-center">
              <div className="ml-3 text-sm font-normal">{toastMessage}</div>
            </div>
          </Toast>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 modal-backdrop">
          <div className="bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">{editingRow ? 'Edit Party' : 'Add Party'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-1">Name</label>
                <TextInput id="name" placeholder="Party name" value={formName} onChange={e => setFormName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-1">Phone</label>
                <TextInput id="phone" placeholder="Phone" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-white mb-1">Address</label>
                <TextInput id="address" placeholder="Address" value={formAddress} onChange={e => setFormAddress(e.target.value)} />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-white mb-1">Notes</label>
                <Textarea id="notes" placeholder="Notes" value={formNotes} onChange={e => setFormNotes(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-700">
              <Button color="light" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PartiesScreen
