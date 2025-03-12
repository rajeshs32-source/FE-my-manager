import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import React from "react";
import { serviceEnum } from "../../enum/serviceEnum";
import NavBar from "../../components/navBar";
import { addService } from "../../routes/serviceApi";
import classNames from "classnames";

export const ServiceForm = () => {
    const navigate = useNavigate();
    const initialState = {
        description: "",
        name: "",
        category: serviceEnum.painting, // Default category
        tags: [] as string[], // Tags array
    };

    const initialErrors = {
        name: { required: false },
        description: { required: false },
        category: { required: false },
        tags: { required: false },
    };

    const [inputs, setInputs] = useState(initialState);
    const [errors, setErrors] = useState(initialErrors);
    const [loading, setLoading] = useState(false);
    const [submitted] = useState(false);

    const handleInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setInputs((prevInputs) => ({
            ...prevInputs,
            [name]: value,
        }));
    };

    const handleTagsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
        setInputs((prevInputs) => ({
            ...prevInputs,
            tags: selectedOptions,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        let newErrors = { ...initialErrors };
        let hasError = false;

        if (!inputs.name) {
            newErrors.name.required = true;
            hasError = true;
        }
        if (!inputs.description) {
            newErrors.description.required = true;
            hasError = true;
        }
        if (!inputs.category) {
            newErrors.category.required = true;
            hasError = true;
        }
        if (inputs.tags.length === 0) {
            newErrors.tags.required = true;
            hasError = true;
        }

        setErrors(newErrors);

        if (!hasError) {
            setLoading(true);
            try {
                await addService(inputs);
                navigate("/services"); // ✅ Navigate after submission
            } catch (error) {
                console.error("Error adding service:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    if (submitted) {
        return <Navigate to="/services" />;
    }

    return (
        <div>
            <NavBar />
            <section className={classNames("service-block", "py-5", "form-container")} >
            <div className="form-container">
                    <div className="row justify-content-center">
                        <div className="col-md-4 col-lg-4 max-w-md  ms-0 me-auto">
                            <div className="card shadow-lg p-4">
                                <h2 className="text-center mb-4">Add Service</h2>
                                <form onSubmit={handleSubmit}>
                                    {/* Service Name */}
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Service Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            onChange={handleInput}
                                            name="name"
                                            id="name"
                                            value={inputs.name}
                                        />
                                        {errors.name?.required && (
                                            <div className="text-danger">Service Name is required.</div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            onChange={handleInput}
                                            name="description"
                                            id="description"
                                            value={inputs.description}
                                            rows={3}
                                        ></textarea>
                                        {errors.description?.required && (
                                            <div className="text-danger">Description is required.</div>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div className="mb-3">
                                        <label htmlFor="category" className="form-label">Category</label>
                                        <select
                                            className="form-select"
                                            onChange={handleInput}
                                            name="category"
                                            id="category"
                                            value={inputs.category}
                                        >
                                            {Object.values(serviceEnum).map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category?.required && (
                                            <div className="text-danger">Category is required.</div>
                                        )}
                                    </div>

                                    {/* Tags (Multi-Select) */}
                                    <div className="mb-3">
                                        <label htmlFor="tags" className="form-label">Tags (Select multiple)</label>
                                        <select
                                            multiple
                                            className="form-select"
                                            onChange={handleTagsChange}
                                            name="tags"
                                            id="tags"
                                            value={inputs.tags}
                                        >
                                            <option value="home">Home</option>
                                            <option value="office">Office</option>
                                            <option value="repair">Repair</option>
                                            <option value="installation">Installation</option>
                                        </select>
                                        {errors.tags?.required && (
                                            <div className="text-danger">At least one tag is required.</div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            {loading ? "Adding..." : "Add Service"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

}
