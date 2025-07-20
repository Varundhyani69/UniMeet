import './App.css';
import RegisterLogin from './components/RegisterLogin';
import Dashboard from './components/Dashboard';
import { Route, Routes } from 'react-router-dom';
function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<RegisterLogin />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
