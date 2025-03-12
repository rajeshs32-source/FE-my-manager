import { useState } from "react";
import { Navigate } from "react-router-dom";
import React from "react";
import { RegisterApi } from "../../../routes/authApi";
import { storeUserData } from "../../../routes/storage";
import { isAuthenticated } from "../../../routes/auth";
import NavBar from "../../../components/navBar";

export const RegisterPage = async () => {
    const initialErrors: Record<string, { required: boolean; message?: string }> = {
        fullName: { required: false, message: "" },
        username: { required: false, message: "" },
        password: { required: false, message: "" },
        phoneNumber: { required: false, message: "" },
        avatar: { required: false, message: "" },
    };

    const [inputs, setInputs] = useState<{
        fullName: string;
        username: string;
        password: string;
        phoneNumber: string;
        accessType: string;
        status: string;
        avatar: File | null; // ✅ Allow both File and null
    }>({
        fullName: "",
        username: "",
        password: "",
        phoneNumber: "",
        accessType: "Admin",
        status: "Not Verified",
        avatar: null, // Initially null
    });

    const [errors, setErrors] = useState(initialErrors);
    const [loading, setLoading] = useState(false);

    const handleInput = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = event.target as HTMLInputElement;
        setInputs((prevInputs) => ({
            ...prevInputs,
            [target.name]: target.value,
        }));
    };
    const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setInputs((prevInputs) => ({
                ...prevInputs,
                avatar: file, // Store file instead of a URL
            }));
        }
    };


    const validateInputs = () => {
        let hasError = false;
        const newErrors = { ...initialErrors };

        // Full Name: Only letters allowed
        if (!inputs.fullName.trim()) {
            newErrors.fullName = { required: true, message: "Full Name is required." };
            hasError = true;
        } else if (!/^[A-Za-z\s]+$/.test(inputs.fullName)) {
            newErrors.fullName = { required: true, message: "Full Name should contain only letters." };
            hasError = true;
        }

        // Phone Number: 10 digits only
        if (!inputs.phoneNumber.trim()) {
            newErrors.phoneNumber = { required: true, message: "Phone Number is required." };
            hasError = true;
        } else if (!/^\d{10}$/.test(inputs.phoneNumber)) {
            newErrors.phoneNumber = { required: true, message: "Phone Number must be exactly 10 digits." };
            hasError = true;
        }

        setErrors(newErrors);
        return hasError;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (validateInputs()) {
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();

            Object.entries(inputs).forEach(([key, value]) => {
                if (value !== undefined && value !== null) { // Avoid appending undefined/null values
                    if (value instanceof File) {
                        formData.append(key, value); // Properly append file
                    } else if (typeof value === "object" && !Array.isArray(value)) {
                        formData.append(key, JSON.stringify(value)); // Only stringify objects
                    } else {
                        formData.append(key, value.toString()); // Convert other values to string
                    }
                }
            });

            // Debugging: Check what is being sent
            console.log("FormData Entries:");
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]); // Key, Value
            }

            const response = await RegisterApi(formData);
            storeUserData(response.data.access_token, inputs.accessType);

            alert("Registration successful! Redirecting to login page...");
            window.location.href = "/login";
        } catch (error: any) {
            console.error("Registration failed", error);

            if (error.response && error.response.data) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    username: { required: true, message: error.response.data.errors },
                }));
            } else {
                alert("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };


    if (await isAuthenticated()) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div>
            <NavBar />
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow p-4">
                            <h2 className="text-center mb-4">Register Now</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    {/* Full Name */}
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="fullName" className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            onChange={handleInput}
                                            name="fullName"
                                            id="fullName"
                                            value={inputs.fullName}
                                        />
                                        {errors.fullName?.message && (
                                            <small className="text-danger">{errors.fullName.message}</small>
                                        )}
                                    </div>

                                    {/* Username */}
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            onChange={handleInput}
                                            name="username"
                                            id="username"
                                            value={inputs.username}
                                        />
                                        {errors.username?.message && <p className="text-danger">{errors.username.message}</p>}
                                    </div>

                                    {/* Password */}
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            onChange={handleInput}
                                            name="password"
                                            id="password"
                                            value={inputs.password}
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            onChange={handleInput}
                                            name="phoneNumber"
                                            id="phoneNumber"
                                            value={inputs.phoneNumber}
                                        />
                                        {errors.phoneNumber?.message && (
                                            <small className="text-danger">{errors.phoneNumber.message}</small>
                                        )}
                                    </div>

                                    {/* Avatar Upload */}
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="avatar" className="form-label">Upload Avatar</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleFileInput}
                                            name="avatar"
                                            id="avatar"
                                            accept="image/*"
                                        />
                                        {errors.avatar?.message && (
                                            <small className="text-danger">{errors.avatar.message}</small>
                                        )}
                                    </div>

                                    {/* Access Type */}
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="accessType" className="form-label">Access Type</label>
                                        <select
                                            className="form-select"
                                            onChange={handleInput}
                                            name="accessType"
                                            id="accessType"
                                            value={inputs.accessType}
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="SuperAdmin">SuperAdmin</option>
                                            <option value="Employee">Employee</option>
                                        </select>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                            {loading ? "Registering..." : "Register"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
