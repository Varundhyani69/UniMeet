import './App.css';
import RegisterLogin from './components/RegisterLogin';
import Dashboard from './components/Dashboard';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<RegisterLogin />} />
        <Route path='/dashboard' element={<Dashboard />} />
        {/* <Route path='/admin' element={<div>Admin Dashboard (To be implemented by you)</div>} /> for you */}
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;