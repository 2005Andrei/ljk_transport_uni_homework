import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Homepage from './assets/Homepage';
import Login from './assets/auth/Login';
import Logout from './assets/auth/Logout';
import Register from './assets/auth/Register';
import Profile from './assets/auth/Profile';
import UnderConstruction from './assets/common/underConstruction';
import TransportForm from './assets/common/TransportForm';
import UserProfile from './assets/common/UserProfile';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/user" element={<UserProfile/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/programare" element={<TransportForm />} />
        <Route path="/contact" element={<UnderConstruction />} />
        <Route
          path="/profile"
          element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
