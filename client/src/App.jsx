import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Navbar from "./components/Navbar";
import Form from "./components/Form";

import './App.css';

function Home() {
  return (
    <>
      <Navbar />
      <h1 className="main-title">Link Shortener</h1>
      <p className="welcome-text">Welcome to the Link Shortener app!</p>
      <Form />
      <p className="welcome-text">Made with ❤️</p>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
