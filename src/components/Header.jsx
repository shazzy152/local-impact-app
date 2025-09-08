import { Link, useLocation } from 'react-router-dom'
import { Button } from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import { setTodayData, setTransactionsData, setPartiesData, setItemsData } from '../lib/storage'
import { getDummyData } from '../lib/dummyData'

function Header({ onAddClick, onCalculateClick }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const btnRef = useRef(null)
  const location = useLocation()

  // Check if current route supports adding
  const getCanAdd = () => {
    return ['/transactions', '/parties', '/items'].includes(location.pathname)
  }

  // Get current screen name based on route
  const getScreenName = () => {
    switch (location.pathname) {
      case '/':
        return 'Overview'
      case '/transactions':
        return 'Transactions'
      case '/reports':
        return 'Reports'
      case '/parties':
        return 'Parties'
      case '/items':
        return 'Items'
      default:
        return 'App'
    }
  }

  const handlePurge = () => {
    if (window.confirm('Are you sure you want to purge all data? This action cannot be undone.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const handleLoadDummy = () => {
    if (window.confirm('Load dummy data? This will replace existing data.')) {
      const dummyData = getDummyData()
      setPartiesData(dummyData.parties)
      setItemsData(dummyData.items)
      setTodayData(dummyData.today)
      setTransactionsData(dummyData.transactions)
      window.location.reload()
    }
  }

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return
      if (menuRef.current && !menuRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth >= 640 && open) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <header className="sticky top-0 bg-gray-800 shadow-sm z-10">
      <div className="w-full px-4 py-3 mx-8">
        <div className="flex justify-between items-center relative">
          {/* Left: Nav (desktop) / Hamburger (mobile) */}
          <div className="flex items-center">
            {/* Hamburger on mobile */}
            <button
              ref={btnRef}
              className="hamburger-menu items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Inline nav on desktop */}
            <div className="desktop-nav space-x-2">
              <Link to="/">
                <Button size="sm" color="light">Overview</Button>
              </Link>
              <Link to="/transactions">
                <Button size="sm" color="light">Transactions</Button>
              </Link>
              <Link to="/reports">
                <Button size="sm" color="light">Reports</Button>
              </Link>
              <Link to="/parties">
                <Button size="sm" color="light">Parties</Button>
              </Link>
              <Link to="/items">
                <Button size="sm" color="light">Items</Button>
              </Link>
            </div>
          </div>

          {/* Center: Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-xl font-bold text-white">{getScreenName()}</h1>
          </div>

          {/* Right: Action buttons */}
          <div className="header-action-buttons items-center space-x-2">
            {onCalculateClick && (
              <Button 
                size="sm" 
                color="blue"
                onClick={onCalculateClick}
                className="text-sm font-medium"
              >
                Calculate
              </Button>
            )}
            {getCanAdd() && onAddClick && (
              <Button 
                size="sm" 
                className="rounded-full h-10 w-10 text-xl font-bold border-2 border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
                onClick={onAddClick}
              >
                +
              </Button>
            )}
            <div className="hidden sm:flex items-center space-x-2">
              <Button size="sm" color="failure" onClick={handlePurge}>
                Purge
              </Button>
              <Button size="sm" color="info" onClick={handleLoadDummy}>
                Dummy
              </Button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {open && (
            <div ref={menuRef} className="mobile-dropdown absolute left-0 right-0 top-full mt-2 z-20">
              <div className="mx-auto w-full max-w-sm bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-2">
                <div className="flex flex-col gap-2">
                  <Link to="/" onClick={() => setOpen(false)}>
                    <Button color="light" className="w-full justify-center">Overview</Button>
                  </Link>
                  <Link to="/transactions" onClick={() => setOpen(false)}>
                    <Button color="light" className="w-full justify-center">Transactions</Button>
                  </Link>
                  <Link to="/reports" onClick={() => setOpen(false)}>
                    <Button color="light" className="w-full justify-center">Reports</Button>
                  </Link>
                  <Link to="/parties" onClick={() => setOpen(false)}>
                    <Button color="light" className="w-full justify-center">Parties</Button>
                  </Link>
                  <Link to="/items" onClick={() => setOpen(false)}>
                    <Button color="light" className="w-full justify-center">Items</Button>
                  </Link>
                  <div className="border-t border-gray-700 my-2"></div>
                  <Button color="failure" onClick={() => { handlePurge(); setOpen(false); }} className="w-full justify-center">
                    Purge
                  </Button>
                  <Button color="info" onClick={() => { handleLoadDummy(); setOpen(false); }} className="w-full justify-center">
                    Dummy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
