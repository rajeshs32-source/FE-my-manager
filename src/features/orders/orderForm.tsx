import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import NavBar from "../../components/navBar";
import classNames from "classnames";
import { addOrder } from "../../routes/orderApi";
import "./order.css";  // Adjust path if needed


// Define the Order type
type VehicleDetails = {
    make: string;
    model: string;
    year: string;
    licensePlate: string;
    insuranceService: boolean;
};

type User = {
    name: string;
    phone: string;
    address: Address;
}

type RevenueDetails = {
    serviceCategory: "Tingering" | "Painting";
    advancePayment: string;
    paymentDate: Date;
    paymentMode: "Upi" | "BankTransfer" | "Cash";
};

type ServiceDetails = {
    serviceType: "Tingering" | "Painting";
    description: string;
};

type Address = {
    addressLine1: string;
    addressLine2: string;
    city: string;
    postalCode: string;
};

type Order = {
    user: User;
    vehicle: VehicleDetails;
    orderDate: Date;
    revenueDetail: RevenueDetails[]; // Array of revenue objects
    services: ServiceDetails[]; // Array of service objects
};

export const OrderForm = () => {
    const navigate = useNavigate();

    // Define initial state
    const initialState: Order = {
        user: {
            name: "",
            phone: "",
            address: {
                addressLine1: "",
                addressLine2: "",
                city: "",
                postalCode: ""
            }
        },
        vehicle: {
            make: "",
            model: "",
            year: "",
            licensePlate: "",
            insuranceService: false,

        },
        orderDate: new Date(),
        revenueDetail: [], // Start with an empty array
        services: [] // Start with an empty array
    };

    const [inputs, setInputs] = useState<Order>(initialState);
    const [loading, setLoading] = useState(false);
    const [submitted] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // Track current step
    const [errors, setErrors] = useState<Record<string, string>>({}); // Track validation errors

    const handleInput = (
        e: React.ChangeEvent<HTMLInputElement>,
        path?: keyof Order | "user.address"
    ) => {
        const { name, value } = e.target;

        setInputs((prevState) => {
            const newState = { ...prevState };

            if (!path) {
                // Updating top-level Order fields (e.g., orderDate)
                (newState as any)[name] = value;
            } else if (path === "user") {
                // Updating user properties (e.g., name, phone)
                newState.user = { ...prevState.user, [name]: value };
            } else if (path === "user.address") {
                // Updating user.address properties (e.g., addressLine1, city)
                newState.user.address = { ...prevState.user.address, [name]: value };
            } else if (path === "vehicle") {
                // Updating vehicle properties (e.g., make, model, year)
                newState.vehicle = { ...prevState.vehicle, [name]: value };
            }

            return newState;
        });
    };





    const addRevenueEntry = () => {
        setInputs((prevInputs) => ({
            ...prevInputs,
            revenueDetail: [
                ...prevInputs.revenueDetail,
                {
                    serviceCategory: "Tingering", // Set a valid default
                    advancePayment: "",
                    paymentMode: "Upi", // Default value
                    paymentDate: new Date() // Default to today
                }
            ]
        }));
    };

    const addServiceEntry = () => {
        console.log("Adding service entry...");
        setInputs((prevInputs) => ({
            ...prevInputs,
            services: [
                ...prevInputs.services,
                { serviceType: "Tingering", description: "" }
            ]
        }));
    };
    
    // Update a specific revenue entry
    const updateRevenueEntry = (index: number, field: keyof RevenueDetails, value: string | Date) => {
        setInputs((prevInputs) => {
            const updatedRevenue = [...prevInputs.revenueDetail];
            updatedRevenue[index] = {
                ...updatedRevenue[index],
                [field]: value
            };
            return {
                ...prevInputs,
                revenueDetail: updatedRevenue
            };
        });

        // Clear validation error for the field
        setErrors((prevErrors) => ({
            ...prevErrors,
            [`revenue-${index}-${field}`]: "",
        }));
    };

    // Update a specific service entry
    const updateServiceEntry = (index: number, field: keyof ServiceDetails, value: string) => {
        setInputs((prevInputs) => {
            const updatedService = [...prevInputs.services];
            updatedService[index] = {
                ...updatedService[index],
                [field]: value
            };
            return {
                ...prevInputs,
                services: updatedService
            };
        });
        // Clear validation error for the field
        setErrors((prevErrors) => ({
            ...prevErrors,
            [`services-${index}-${field}`]: "",
        }));
    };

    // Remove a specific revenue entry
    const removeRevenueEntry = (index: number) => {
        setInputs((prevInputs) => ({
            ...prevInputs,
            revenue: prevInputs.revenueDetail.filter((_, i) => i !== index)
        }));
    };

    // Remove a specific service entry
    const removeServiceEntry = (index: number) => {
        setInputs((prevInputs) => ({
            ...prevInputs,
            service: prevInputs.services.filter((_, i) => i !== index)
        }));
    };

    // Validate a specific field
    const validateField = (name: string, value: string): string | undefined => {
        value = value.trim(); // Trim whitespace before validation
        console.log(name, value, "retyhtre")
        switch (name) {
            case "customerName":
                if (!value) return "Customer Name is required.";
                if (value.length < 3) return "Customer Name must be at least 3 characters.";
                break;
            case "customerMobile":
                if (!value) return "Customer Mobile is required.";
                if (!/^\d{10}$/.test(value)) return "Customer Mobile must be 10 digits.";
                break;
            case "addressLine1":
                if (!value) return "Address Line 1 is required.";
                break;
            case "city":
                if (!value) return "City is required.";
                break;
            case "postalCode":
                if (!value) return "Postal Code is required.";
                if (!/^\d{6}$/.test(value)) return "Postal Code must be 6 digits.";
                break;
            case "make":
            case "model":
            case "year":
            case "licensePlate":
                if (!value) return "This field is required.";
                break;
            case "serviceCategory":
            case "advancePayment":
            case "paymentMode":
                if (!value) return "This field is required.";
                break;
            case "serviceType":
            case "description":
                if (!value) return "This field is required.";
                break;
            default:
                break;
        }
        return undefined; // No error
    };

    // Validate the current step
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            // Ensure inputs.user and inputs.user.address are defined before accessing properties
            const user = inputs.user || {};
            const address = user.address || {};

            const fields = ["name", "phone", "addressLine1", "city", "postalCode"];
            fields.forEach((field) => {
                const value = ["addressLine1", "city", "postalCode"].includes(field)
                    ? address[field as keyof Address] || ""
                    : user[field as keyof User] || "";

                const error = validateField(field, value as string);
                if (error) newErrors[field] = error;
            });
        }
        else if (step === 2) {
            // Validate vehicle details (excluding insuranceService)
            const fields: (keyof Omit<VehicleDetails, "insuranceService">)[] = ["make", "model", "year", "licensePlate"];

            fields.forEach((field) => {
                const value = inputs.vehicle[field]; // Guaranteed to be a string
                const error = validateField(field, value);
                if (error) newErrors[field] = error;
            });
        } else if (step === 3) {
            // Validate revenue details
            inputs.revenueDetail.forEach((revenue, index) => {
                const fields = ["serviceCategory", "advancePayment", "paymentMode", "paymentDate"];
                fields.forEach((field) => {
                    let value: string = ""; // Ensure value is always a string

                    if (field === "paymentDate" && revenue.paymentDate instanceof Date) {
                        value = revenue.paymentDate.toISOString().split("T")[0]; // Convert Date to YYYY-MM-DD string
                    } else {
                        value = String(revenue[field as keyof RevenueDetails]); // Ensure it's a string
                    }

                    const error = validateField(field, value);
                    if (error) newErrors[`revenue-${index}-${field}`] = error;
                });
            });
        }
        else if (step === 4) {
            // Validate service details
            inputs.services.forEach((service, index) => {
                const fields = ["serviceType", "description"];
                fields.forEach((field) => {
                    const value = service[field as keyof ServiceDetails];
                    const error = validateField(field, value);
                    if (error) newErrors[`service-${index}-${field}`] = error;
                });
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    // Navigate to the next step
    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prevStep) => prevStep + 1);
        }
    };

    // Navigate to the previous step
    const prevStep = () => {
        setCurrentStep((prevStep) => prevStep - 1);
    };

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        // Validate all steps
        const isStep1Valid = validateStep(1);
        const isStep2Valid = validateStep(2);
        const isStep3Valid = validateStep(3);
        const isStep4Valid = validateStep(4);

        if (isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid) {
            try {
                await addOrder(inputs);
                navigate("/orders");
            } catch (error) {
                console.error("Error adding order:", error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    if (submitted) {
        return <Navigate to="/orders" />;
    }

    return (
        <div>
            <NavBar />
            <section className={classNames("order-block", "py-3", "form-container")} style={{ maxWidth: "600px", margin: "0 auto" }}>
                <div className="form-container">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <div className="card shadow-lg p-3">
                                <h2 className="text-center mb-3">Create Order</h2>
                                <form onSubmit={handleSubmit}>
                                    {/* Render the current step */}
                                    {currentStep === 1 && (
                                        <>
                                            <div className="mb-2">
                                                <label className="form-label">Customer Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    onChange={(e) => handleInput(e, "user")}
                                                    value={inputs.user.name}
                                                />
                                                {errors.name && <div className="text-danger">{errors.name}</div>}
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Customer Mobile</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="phone"
                                                    onChange={(e) => handleInput(e, "user")}
                                                    value={inputs.user.phone}
                                                />
                                                {errors.phone && <div className="text-danger">{errors.phone}</div>}
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Address Line 1</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="addressLine1"
                                                    onChange={(e) => handleInput(e, "user.address")}
                                                    value={inputs.user.address.addressLine1}
                                                />
                                                {errors.addressLine1 && <div className="text-danger">{errors.addressLine1}</div>}
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Address Line 2</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="addressLine2"
                                                    onChange={(e) => handleInput(e, "user.address")}
                                                    value={inputs.user.address.addressLine2}
                                                />
                                                {errors.addressLine2 && <div className="text-danger">{errors.addressLine2}</div>}
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">City</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="city"
                                                    onChange={(e) => handleInput(e, "user.address")}
                                                    value={inputs.user.address.city}
                                                />
                                                {errors.city && <div className="text-danger">{errors.city}</div>}
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Postal Code</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="postalCode"
                                                    onChange={(e) => handleInput(e, "user.address")}
                                                    value={inputs.user.address.postalCode}
                                                />
                                                {errors.postalCode && <div className="text-danger">{errors.postalCode}</div>}
                                            </div>
                                        </>
                                    )}
                                    {currentStep === 2 && (
                                        <>
                                            <h4>Vehicle Details</h4>
                                            {(["make", "model", "year", "licensePlate"] as (keyof Omit<VehicleDetails, "insuranceService">)[]).map((field) => (
                                                <div className="mb-2" key={field}>
                                                    <label className="form-label">{field}</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name={field}
                                                        onChange={(e) => handleInput(e, "vehicle")} // 🔥 FIX: Pass as an array
                                                        value={inputs.vehicle[field] as string} // Ensuring only string values
                                                    />
                                                    {errors[field] && <div className="text-danger">{errors[field]}</div>}
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {currentStep === 3 && (
                                        <>
                                            <h4>Revenue</h4>
                                            {inputs.revenueDetail.map((revenue, index) => (
                                                <div key={index} className="mb-2">
                                                    <h5>Revenue Entry #{index + 1}</h5>
                                                    {Object.keys(revenue).map((field) => (
                                                        <div key={field}>
                                                            <label className="form-label">{field}</label>

                                                            {/* Service Category Dropdown */}
                                                            {field === "serviceCategory" ? (
                                                                <select
                                                                    className="form-control"
                                                                    name={field}
                                                                    value={revenue.serviceCategory}
                                                                    onChange={(e) => updateRevenueEntry(index, "serviceCategory", e.target.value as "Tingering" | "Painting")}
                                                                >
                                                                    <option value="Tingering">Tingering</option>
                                                                    <option value="Painting">Painting</option>
                                                                </select>
                                                            ) : field === "paymentMode" ? (
                                                                <select
                                                                    className="form-control"
                                                                    name={field}
                                                                    value={revenue.paymentMode}
                                                                    onChange={(e) => updateRevenueEntry(index, "paymentMode", e.target.value as "Upi" | "BankTransfer" | "Cash")}
                                                                >
                                                                    <option value="Upi">UPI</option>
                                                                    <option value="BankTransfer">Bank Transfer</option>
                                                                    <option value="Cash">Cash</option>
                                                                </select>
                                                            ) : field === "paymentDate" ? (
                                                                <input
                                                                    type="date"
                                                                    className="form-control"
                                                                    name={field}
                                                                    value={revenue.paymentDate instanceof Date ? revenue.paymentDate.toISOString().split("T")[0] : ""}
                                                                    onChange={(e) => updateRevenueEntry(index, "paymentDate", new Date(e.target.value))}
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name={field}
                                                                    value={revenue[field as keyof RevenueDetails] as string}
                                                                    onChange={(e) => updateRevenueEntry(index, field as keyof RevenueDetails, e.target.value)}
                                                                />
                                                            )}

                                                            {errors[`revenue-${index}-${field}`] && <div className="text-danger">{errors[`revenue-${index}-${field}`]}</div>}
                                                        </div>
                                                    ))}

                                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeRevenueEntry(index)}>
                                                        Remove Revenue Entry
                                                    </button>
                                                </div>
                                            ))}
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={addRevenueEntry}>
                                                Add Revenue Entry
                                            </button>
                                        </>
                                    )}

                                    {currentStep === 4 && (
                                        <>
                                            <h4>Service</h4>
                                            {inputs.services.map((service, index) => (
                                                <div key={index} className="mb-2">
                                                    <h5>Service Entry #{index + 1}</h5>
                                                    {Object.keys(service).map((field) => (
                                                        <div key={field}>
                                                            <label className="form-label">{field}</label>

                                                            {/* Service Type Dropdown */}
                                                            {field === "serviceType" ? (
                                                                <select
                                                                    className="form-control"
                                                                    name={field}
                                                                    value={service.serviceType}
                                                                    onChange={(e) => updateServiceEntry(index, "serviceType", e.target.value as "Tingering" | "Painting")}
                                                                >
                                                                    <option value="Tingering">Tingering</option>
                                                                    <option value="Painting">Painting</option>
                                                                </select>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name={field}
                                                                    value={service[field as keyof ServiceDetails]}
                                                                    onChange={(e) => updateServiceEntry(index, field as keyof ServiceDetails, e.target.value)}
                                                                />
                                                            )}

                                                            {errors[`service-${index}-${field}`] && (
                                                                <div className="text-danger">{errors[`service-${index}-${field}`]}</div>
                                                            )}
                                                        </div>
                                                    ))}

                                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeServiceEntry(index)}>
                                                        Remove Service Entry
                                                    </button>
                                                </div>
                                            ))}
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={addServiceEntry}>
                                                Add Service Entry
                                            </button>
                                        </>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="d-flex justify-content-between mt-3">
                                        {currentStep > 1 && (
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={prevStep}>
                                                Back
                                            </button>
                                        )}
                                        {currentStep < 4 ? (
                                            <button type="button" className="btn btn-primary btn-sm" onClick={nextStep}>
                                                Next
                                            </button>
                                        ) : (
                                            <button type="submit" className="btn btn-success btn-sm" disabled={loading}>
                                                {loading ? "Processing..." : "Submit Order"}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};