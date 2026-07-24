import { Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Kiosk from './components/Kiosk'
import Admin from './components/Admin'
import EditReaderForm from './components/EditReaderForm'
import CreateReaderForm from './components/CreateReaderForm'
import ReaderDashboard from './components/ReaderDashboard'
import ReaderLandingPage from './components/ReaderLandingPage'


export default function App() {
  return(
    <Routes>
      <Route path='' element={<Kiosk />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/admin' element={<Admin />} />
      <Route path='/edit-reader/:record_id' element={<EditReaderForm />} />
      <Route path='/create-reader' element={<CreateReaderForm />} />
      <Route path='/readers' element={<ReaderLandingPage />} />
      <Route path='/reader-dashboard/:reader_id' element={<ReaderDashboard />} />
    </Routes>
  )
}