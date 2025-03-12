import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../routes/auth"; // Ensure correct import
import { logout } from "../routes/authApi"; // Import logout function

const NavBar: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    isAuthenticated().then((authStatus) => {
      console.log("🔍 Navbar authenticated state:", authStatus);
      setAuthenticated(authStatus);
    });
  }, []);

  const logoutUser = () => {
    logout()
      .then(() => {
        console.log("✅ Successfully logged out");
        navigate("/login");
      })
      .catch((error) => console.error("Logout failed:", error));
  };

  if (authenticated === null) return <p>Loading Navbar...</p>;

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark">
      <div className="container" style={{ backgroundColor: "black", color: "white" }}>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="true"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="navbar-collapse show" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {authenticated ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/service">View Services</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/service/create">Create Service</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/orders">Orders</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/dailySchedule">Daily Schedule</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/dailyReport">Daily Reports</Link></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
              </>
            )}
          </ul>

          {authenticated && (
            <div className="d-flex">
              <button className="btn btn-outline-danger" onClick={logoutUser}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
