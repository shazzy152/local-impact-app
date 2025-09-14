import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TodayScreen from './screens/TodayScreen.jsx'
import TransactionScreen from './screens/TransactionScreen.jsx'
import PartiesScreen from './screens/PartiesScreen.jsx'
import ItemsScreen from './screens/ItemsScreen.jsx'
import ReportsScreen from './screens/ReportsScreen.jsx'
import AdvanceScreen from './screens/AdvanceScreen.jsx'

function App() {
  console.log('App component rendering')
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TodayScreen />} />
        <Route path="/transactions" element={<TransactionScreen />} />
        <Route path="/parties" element={<PartiesScreen />} />
        <Route path="/items" element={<ItemsScreen />} />
        <Route path="/reports" element={<ReportsScreen />} />
        <Route path="/advance" element={<AdvanceScreen />} />
      </Routes>
    </Router>
  )
}

export default App
