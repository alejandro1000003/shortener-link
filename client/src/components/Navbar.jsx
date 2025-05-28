import React, { useState } from "react";
import "../styles/navbar.css";  // ajusta ruta si hace falta
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png"; // ajusta ruta si hace falta

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <nav className="topnav">
      <a href="#home" className="active">
        <img src={logo} alt="Logo" className="navbar_logo" />
      </a>

      <div className={isOpen ? "nav_links open" : "nav_links"}>
        <a href="#news" onClick={() => setIsOpen(false)}>Example</a>
        <a href="#contact" onClick={() => setIsOpen(false)}>Example</a>
        <a href="#about" onClick={() => setIsOpen(false)}>Example</a>
      </div>

      <button className="toggle_navbar" onClick={handleToggle} aria-label="Toggle navigation">
        {isOpen ? <X color="black" size={32} /> : <Menu color="black" size={32} />}
      </button>
    </nav>
  );
}

export default Navbar;
