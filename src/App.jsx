import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthGuard from './components/guards/AuthGuard';
import GuestGuard from './components/guards/GuestGuard';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Details from './pages/Details';
import Login from './pages/Login';
import Register from './pages/Register';
import Create from './pages/Create';
import Edit from './pages/Edit';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<Details />} />
          <Route path="/contact" element={<Contact />} />

          <Route element={<GuestGuard />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<AuthGuard />}>
            <Route path="/create" element={<Create />} />
            <Route path="/edit/:id" element={<Edit />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
