import { useEffect, useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import NavBar from "../../components/navBar";
import "./dashboard.css";
import { getUserByToken, logout } from "../../routes/authApi";

export const DashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<{
        name: string;
        username: string;
        phoneNumber: string;
        accessType: string;
        roles: string[];
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Fetching user data...");

        getUserByToken()
            .then((response) => {
                if (!response?.data?.data?.findUser) {
                    throw new Error("Invalid user data");
                }

                const userData = response?.data?.data?.findUser;
                setUser({
                    name: userData.fullName || "User",
                    username: userData.username || "No Username",
                    phoneNumber: userData.phoneNumber || "No Phone",
                    accessType: userData.accessType,
                    roles: userData.roles || [],
                });
            })
            .catch((error) => {
                navigate("/login"); // ✅ Redirect on failure
            })
            .finally(() => setLoading(false));
    }, [navigate]);
    
    const logoutUser = () => {
        logout()
            .then(() => navigate("/login"))
            .catch((error) => console.error("Logout failed:", error));
    };

    if (loading) return <p>Loading...</p>;
    if (!user) return <Navigate to="/login" />;

    return (
        <>
            <NavBar />
            <div className="d-flex vh-100">
                {/* Sidebar */}
                <nav className="bg-dark text-white p-3 sidebar">
                    <h4>Dashboard</h4>
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/dashboard">Home</Link>
                        </li>
                        {user?.accessType === "Admin" && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/service/create">Create Service</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/service">View Services</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/order/create">Create Order</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/orders">Orders</Link>
                                </li>
                            </>
                        )}
                        {user?.accessType === "Employee" && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/dailySchedule">Daily Schedule</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/dailyReport">Daily Reports</Link>
                                </li>
                            </>
                        )}
                        <li className="nav-item">
                            <button className="btn btn-danger mt-3 w-100" onClick={logoutUser}>Logout</button>
                        </li>
                    </ul>
                </nav>

                {/* Main Content */}
                <main className="main-content p-4">
                    <h3>Welcome, {user?.name}</h3>
                    <p>Your Access Type: {user?.accessType}</p>
                </main>
            </div>
        </>
    );
};
