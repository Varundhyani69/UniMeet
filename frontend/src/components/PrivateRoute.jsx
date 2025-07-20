import './App.css';
import RegisterLogin from './components/RegisterLogin';
import Dashboard from './components/Dashboard';
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <Routes>
            <Route path="/login" element={<RegisterLogin />} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />
        </Routes>
    );
}

export default App;
