import { useState } from 'react'
import { RegisterApi } from '../services/api';
import { isAuthenticated } from '../services/auth';
import { storeUserData } from '../services/storage';
import './registerPage.css'
import { Navigate } from 'react-router-dom';
import NavBar from '../components/navBar';

export default function RegisterPage() {
    const initialState = {
        fullName: "",
        username: "",
        password: "",
        phoneNumber: "",
        accessType: "Admin", // Default value
        status: "Not Verified", // Default value
        avatar: "",
        roles: [], // Array
        permissions: [], // Array
    };

    const initialErrors = {
        fullName: { required: false },
        username: { required: false },
        password: { required: false },
        accessType: { required: false },
    };

    const [inputs, setInputs] = useState(initialState);
    const [errors, setErrors] = useState(initialErrors);
    const [loading, setLoading] = useState(false);

    const handleInput = (event) => {
        const { name, value, type, checked } = event.target;

        setInputs((prevInputs) => ({
            ...prevInputs,
            [name]: type === "checkbox" ? checked : value, // Handle checkboxes properly
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let newErrors = { ...initialErrors };
        let hasError = false;

        if (!inputs.fullName) {
            newErrors.fullName.required = true;
            hasError = true;
        }
        if (!inputs.username) {
            newErrors.username.required = true;
            hasError = true;
        }
        if (!inputs.password) {
            newErrors.password.required = true;
            hasError = true;
        }
        if (!inputs.accessType) {
            newErrors.accessType.required = true;
            hasError = true;
        }

        setErrors(newErrors);

        if (!hasError) {
            setLoading(true);
            try {
                const response = await RegisterApi(inputs);
                storeUserData(response.data.access_token);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        }
    };

    if (isAuthenticated()) {
        // Redirect user to dashboard if already authenticated
        return <Navigate to="/dashboard" />;
    }

    return (
        <div>
            <NavBar />
            <section className="register-block">
                <div className="container">
                    <div className="row">
                        <div className="col register-sec">
                            <h2 className="text-center">Register Now</h2>
                            <form onSubmit={handleSubmit} className="register-form">
                                {/* Full Name */}
                                <div className="form-group">
                                    <label htmlFor="fullName" className="text-uppercase">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        onChange={handleInput}
                                        name="fullName"
                                        id="fullName"
                                        value={inputs.fullName}
                                    />
                                    {errors.fullName?.required && (
                                        <span className="text-danger">Full Name is required.</span>
                                    )}
                                </div>

                                {/* Username */}
                                <div className="form-group">
                                    <label htmlFor="username" className="text-uppercase">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        onChange={handleInput}
                                        name="username"
                                        id="username"
                                        value={inputs.username}
                                    />
                                    {errors.username?.required && (
                                        <span className="text-danger">Username is required.</span>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="form-group">
                                    <label htmlFor="password" className="text-uppercase">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        onChange={handleInput}
                                        name="password"
                                        id="password"
                                        value={inputs.password}
                                    />
                                    {errors.password?.required && (
                                        <span className="text-danger">Password is required.</span>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div className="form-group">
                                    <label htmlFor="phoneNumber" className="text-uppercase">Phone Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        onChange={handleInput}
                                        name="phoneNumber"
                                        id="phoneNumber"
                                        value={inputs.phoneNumber}
                                    />
                                </div>

                                {/* Access Type */}
                                <div className="form-group">
                                    <label htmlFor="accessType" className="text-uppercase">Access Type</label>
                                    <select
                                        className="form-control"
                                        onChange={handleInput}
                                        name="accessType"
                                        id="accessType"
                                        value={inputs.accessType}
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="SuperAdmin">Super Admin</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <div className="form-group">
                                    <label htmlFor="status" className="text-uppercase">Status</label>
                                    <select
                                        className="form-control"
                                        onChange={handleInput}
                                        name="status"
                                        id="status"
                                        value={inputs.status}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Not Verified">Not Verified</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Deleted">Deleted</option>
                                    </select>
                                </div>

                                {/* Avatar (Optional) */}
                                <div className="form-group">
                                    <label htmlFor="avatar" className="text-uppercase">Avatar URL</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        onChange={handleInput}
                                        name="avatar"
                                        id="avatar"
                                        value={inputs.avatar}
                                    />
                                </div>

                                {/* Roles */}
                                <div className="form-group">
                                    <label htmlFor="roles" className="text-uppercase">Roles</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        onChange={handleInput}
                                        name="roles"
                                        id="roles"
                                        value={inputs.roles}
                                        placeholder="Enter roles separated by commas"
                                    />
                                </div>

                                {/* Permissions */}
                                <div className="form-group">
                                    <label htmlFor="permissions" className="text-uppercase">Permissions</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        onChange={handleInput}
                                        name="permissions"
                                        id="permissions"
                                        value={inputs.permissions}
                                        placeholder="Enter permissions separated by commas"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button type="submit" disabled={loading}>
                                    {loading ? "Registering..." : "Register"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}