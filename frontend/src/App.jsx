import './App.css';
import RegisterLogin from './components/RegisterLogin';
import Dashboard from './components/Dashboard';
import { Route, Routes } from 'react-router-dom';
import ProfilePage from './components/ProfilePage';
function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<RegisterLogin />} />
        <Route path='/Dashboard' element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
