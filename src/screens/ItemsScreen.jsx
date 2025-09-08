import { useEffect, useState } from 'react'
import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput, Toast, Select, Textarea } from 'flowbite-react'
import Header from '../components/Header'
import { getItemsData, setItemsData } from '../lib/storage'

function ItemsScreen() {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  // Form fields
  const [formName, setFormName] = useState('')
  const [formUnit, setFormUnit] = useState('kgs')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (editingRow) {
      setFormName(editingRow.name)
      setFormUnit(editingRow.unit)
    } else {
      setFormName('')
      setFormUnit('kgs')
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
    let data = getItemsData()
    // Remove seed data - start with empty data after purge
    setRows(data)
  }, [])

  const handleSort = (key) => {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }))
  }

  const filtered = rows.filter(r =>
    r.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sort.key]
    const bVal = b[sort.key]
    if (sort.dir === 'asc') return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
  })

  const handleEdit = (row) => { setEditingRow(row); setIsModalOpen(true) }
  const handleDelete = (row) => {
    if (window.confirm('Delete this item?')) {
      const updated = rows.filter(r => r.id !== row.id)
      setRows(updated)
      setItemsData(updated)
      setToastMessage('Item deleted successfully!')
      setTimeout(() => setToastMessage(''), 3000)
    }
  }

  const handleSave = () => {
    if (!formName || !formUnit) {
      alert('Please fill in all required fields.')
      return
    }
    const newRow = {
      id: editingRow ? editingRow.id : crypto.randomUUID(),
      name: formName,
      unit: formUnit
    }
    let updated
    if (editingRow) updated = rows.map(r => r.id === editingRow.id ? newRow : r)
    else updated = [...rows, newRow]
    setRows(updated)
    setItemsData(updated)
    setIsModalOpen(false)
    setEditingRow(null)
    setToastMessage(editingRow ? 'Item updated successfully!' : 'Item added successfully!')
    setTimeout(() => setToastMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onAddClick={() => { setEditingRow(null); setIsModalOpen(true); }} />

      <main className="w-full px-4 py-3 mx-8">

        <div className="mb-4">
          <TextInput placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHead className="sticky top-0 bg-gray-800">
              <TableRow>
                <TableHeadCell onClick={() => handleSort('name')} className="cursor-pointer text-white">
                  Name {sort.key === 'name' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell onClick={() => handleSort('unit')} className="cursor-pointer text-white">
                  Unit {sort.key === 'unit' && (sort.dir === 'asc' ? '▲' : '▼')}
                </TableHeadCell>
                <TableHeadCell className="text-white">Actions</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((row, i) => (
                <TableRow key={row.id} className={i % 2 === 1 ? 'bg-gray-700' : 'bg-gray-800'}>
                  <TableCell className="text-white">{row.name}</TableCell>
                  <TableCell className="text-white">{row.unit}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleEdit(row)} className="mr-2 min-h-11 min-w-11">Edit</Button>
                    <Button size="sm" color="failure" onClick={() => handleDelete(row)} className="min-h-11 min-w-11">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

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
              <h3 className="text-lg font-semibold text-white">{editingRow ? 'Edit Item' : 'Add Item'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-1">Name</label>
                <TextInput id="name" placeholder="Item name" value={formName} onChange={e => setFormName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-white mb-1">Unit</label>
                <Select id="unit" value={formUnit} onChange={e => setFormUnit(e.target.value)}>
                  <option value="kgs">kgs</option>
                </Select>
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

export default ItemsScreen
