import "./loginPage.css";
import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import React from "react";
import { LoginApi } from "../../../routes/authApi";
import { isAuthenticated } from "../../../routes/auth";
import NavBar from "../../../components/navBar";

export const LoginPage = () => {
    const navigate = useNavigate();
    
    // State for authentication check
    const [authChecked, setAuthChecked] = useState(false);
    const [isAuth, setIsAuth] = useState(false);
    const [role, setRole] = useState("");

    // State for form inputs & errors
    const [inputs, setInputs] = useState({ username: "", password: "" });
    const [errors, setErrors] = useState({
        username: { required: false },
        password: { required: false },
        custom_error: null as string | null
    });
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputs({ ...inputs, [event.target.name]: event.target.value });
    };

    // Check authentication on component mount
    useEffect(() => {
        const checkAuth = async () => {
            if (await isAuthenticated()) {
                // const userRole = getUserRole();
                setIsAuth(true);
                // setRole(userRole);
            }
            setAuthChecked(true);
        };
        checkAuth();
    }, []);

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newErrors = {
            username: { required: inputs.username === "" },
            password: { required: inputs.password === "" },
            custom_error: null as string | null
        };

        if (newErrors.username.required || newErrors.password.required) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await LoginApi(inputs);
            if (response.status === 200) {
                console.log("✅ Login successful, navigating...");
                setTimeout(() => navigate("/dashboard"), 1000);
            }
        } catch (err) {
            setErrors({ ...newErrors, custom_error: "Invalid credentials" });
        } finally {
            setLoading(false);
        }
    };

    // Redirect if authenticated
    if (authChecked && isAuth) {
        return <Navigate to={role === "admin" ? "/admin-dashboard" : "/dashboard"} />;
    }

    return (
        <div>
            <NavBar />
            <section className="login-block py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-5 login-sec p-4 shadow bg-white rounded">
                            <h2 className="text-center text-primary mb-4">Login Now</h2>
                            <form onSubmit={handleSubmit} className="login-form">
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label text-uppercase">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        onChange={handleInput}
                                        name="username"
                                        placeholder="Enter your username"
                                    />
                                    {errors.username.required && (
                                        <div className="text-danger">Username is required.</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label text-uppercase">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        onChange={handleInput}
                                        name="password"
                                        placeholder="Enter your password"
                                        id="password"
                                    />
                                    {errors.password.required && (
                                        <div className="text-danger">Password is required.</div>
                                    )}
                                </div>

                                <div className="mb-3 text-center">
                                    {loading && (
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    )}
                                    {errors.custom_error && (
                                        <div className="text-danger mt-2">{errors.custom_error}</div>
                                    )}
                                </div>

                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    Login
                                </button>

                                <div className="text-center mt-3">
                                    <small>Create new account? Please <Link to="/register">Register</Link></small>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
