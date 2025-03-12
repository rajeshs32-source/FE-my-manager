import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import NavBar from "../../components/navBar";
import { addDailySchedule } from "../../routes/dailyScheduleApi";
import classNames from "classnames";
import { getAllLabours } from "../../routes/labourApi";
import { Labour } from "../labour/labourType";
import { getOrders } from "../../routes/orderApi";
import { Order } from "../orders/orderTypes";
import Swal from "sweetalert2";

interface Schedule {
    labourId: string;
    workAssigned: string;
    hours: number;
    isCompleted: boolean;
    reason?: string;
}

interface PersonalTaskDetail {
    labourId: string;
    personalTaskId?: string;
    workDescription: string;
    startDate: Date;
    progressPercentage: string;
}

interface DailySchedule {
    orderId?: string;
    schedules: Schedule[];
    isPersonalTask: boolean;
    personalTaskDetails: PersonalTaskDetail[];
    date: Date;
}

export const DailyScheduleForm = () => {
    const navigate = useNavigate();

    // Initial state for the form
    const initialState: DailySchedule = {
        orderId: "",
        schedules: [
            {
                labourId: "",
                workAssigned: "",
                hours: 0,
                isCompleted: false,
                reason: "",
            },
        ],
        isPersonalTask: false,
        personalTaskDetails: [
            {
                personalTaskId: "",
                labourId: "",
                workDescription: "",
                startDate: new Date(),
                progressPercentage: "",
            },
        ],
        date: new Date(),
    };


    const [inputs, setInputs] = useState<DailySchedule>(initialState);
    const [loading, setLoading] = useState(false);
    const [submitted] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [labourOptions, setLabourOptions] = useState<Labour[]>([]);
    const [orderOptions, setOrderOptions] = useState<Order[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const labourData = await getAllLabours();
                setLabourOptions(labourData);

                const orderData = await getOrders();
                setOrderOptions(orderData);
            } catch (error) {
                console.error("Error fetching labour or order data:", error);
            }
        };
        fetchData();
    }, []);

    // Handler for top-level fields: orderId, date, isPersonalTask
    const handleInput = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setInputs((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };


    // Update a specific schedule entry
    const updateScheduleEntry = (
        index: number,
        field: keyof Schedule,
        value: string | number | boolean
    ) => {
        setInputs((prev) => {
            const updatedSchedules = [...prev.schedules];
            updatedSchedules[index] = {
                ...updatedSchedules[index],
                [field]: field === "hours" ? Number(value) : value,
            };
            return { ...prev, schedules: updatedSchedules };
        });
        setErrors((prev) => ({
            ...prev,
            [`schedules-${index}-${field}`]: "",
        }));
    };

    const addScheduleEntry = () => {
        setInputs((prev) => ({
            ...prev,
            schedules: [
                ...prev.schedules,
                { labourId: "", workAssigned: "", hours: 0, isCompleted: false, reason: "" },
            ],
        }));
    };

    const removeScheduleEntry = (index: number) => {
        setInputs((prev) => ({
            ...prev,
            schedules: prev.schedules.filter((_, i) => i !== index),
        }));
    };

    // Update a specific personal task detail entry
    const updatePersonalTaskEntry = (
        index: number,
        field: keyof PersonalTaskDetail,
        value: string | Date
    ) => {
        setInputs((prev) => {
            const updatedTasks = [...prev.personalTaskDetails];
            updatedTasks[index] = {
                ...updatedTasks[index],
                [field]: value,
            };
            return { ...prev, personalTaskDetails: updatedTasks }; // ✅ Ensure it updates personalTaskDetails
        });
        setErrors((prev) => ({
            ...prev,
            [`personalTaskDetails-${index}-${field}`]: "",
        }));
    };


    const addPersonalTaskEntry = () => {
        setInputs((prev) => ({
            ...prev,
            personalTaskDetails: [
                ...prev.personalTaskDetails,
                { personalTaskId: "", labourId: "", workDescription: "", startDate: new Date(), progressPercentage: "" },
            ],
        }));
    };

    const removePersonalTaskEntry = (index: number) => {
        setInputs((prev) => ({
            ...prev,
            personalTaskDetails: prev.personalTaskDetails.filter((_, i) => i !== index),
        }));
    };

    // Simple field validator
    const validateField = (name: string, value: string): string | undefined => {
        const trimmed = value.trim();
        if (!trimmed) return `${name} is required.`;
        return undefined;
    };

    // Validate current step fields
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};
        if (step === 1) {
            if (!inputs.date) newErrors.date = "Date is required.";
        } else if (step === 2) {
            inputs.schedules.forEach((schedule, index) => {
                const labourError = validateField("Labour ID", schedule.labourId);
                if (labourError) newErrors[`schedules-${index}-labourId`] = labourError;
                const workError = validateField("Work Assigned", schedule.workAssigned);
                if (workError) newErrors[`schedules-${index}-workAssigned`] = workError;
                if (schedule.hours <= 0) newErrors[`schedules-${index}-hours`] = "Hours must be greater than 0.";
            });
        } else if (step === 3 && inputs.isPersonalTask) {
            inputs.personalTaskDetails.forEach((task, index) => {
                const labourError = validateField("Labour ID", task.labourId);
                if (labourError) newErrors[`personalTaskDetails-${index}-labourId`] = labourError;
                const workDescError = validateField("Work Description", task.workDescription);
                if (workDescError) newErrors[`personalTaskDetails-${index}-workDescription`] = workDescError;
                if (!task.startDate) newErrors[`personalTaskDetails-${index}-startDate`] = "Start Date is required.";
                const progressError = validateField("Progress Percentage", task.progressPercentage);
                if (progressError) newErrors[`personalTaskDetails-${index}-progressPercentage`] = progressError;
            });
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        console.log("Inputs before API call:", inputs);
        const step1Valid = validateStep(1);
        const step2Valid = !inputs.isPersonalTask ? validateStep(2) : true;
        const step3Valid = inputs.isPersonalTask ? validateStep(3) : true;

        console.log("Validation Results:", { step1Valid, step2Valid, step3Valid });

        if (step1Valid && (step2Valid || step3Valid)) {
            try {
                await addDailySchedule({
                    orderId: inputs.orderId,
                    date: inputs.date,
                    isPersonalTask: inputs.isPersonalTask,
                    schedules: inputs.isPersonalTask ? [] : inputs.schedules, // ✅ Clear schedules when submitting personal tasks
                    personalTaskDetails: inputs.isPersonalTask ? inputs.personalTaskDetails : [], // ✅ Include personal tasks when needed
                });
        
                Swal.fire({
                    title: "Success!",
                    text: "Daily schedule is created.",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {
                    // Reset form inputs before navigating
                    setInputs({
                        orderId: "",
                        date: new Date(), // Reset to today's date
                        isPersonalTask: false,
                        schedules: [],
                        personalTaskDetails: [],
                    });
        
                    navigate("/dailySchedule/create"); // ✅ Redirect to the first form
                });
            } catch (error) {
                console.error("Error adding daily schedule:", error);
            } finally {
                setLoading(false);
            }
        } else {
            console.warn("Validation failed, API not called");
            setLoading(false);
        }
    };



    if (submitted) {
        return <Navigate to="/daily-schedules" />;
    }

    return (
        <div>
            <NavBar />
            <section
                className={classNames("order-block", "py-3", "form-container")}
                style={{ maxWidth: "600px", margin: "0 auto" }}
            >
                <div className="form-container">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <div className="card shadow-lg p-3">
                                <h2 className="text-center mb-3">Create Daily Schedule</h2>
                                <form onSubmit={handleSubmit}>
                                    {currentStep === 1 && (
                                        <>
                                            <div className="row mb-2">
                                                <div className="col-md-6">
                                                    <label className="form-label">Vehicle No (optional)</label>
                                                    <select name="orderId" className="form-control" value={inputs.orderId} onChange={handleInput}>
                                                        <option value="">Select Vehicle</option>
                                                        {orderOptions.map((order) => (
                                                            <option key={order._id} value={order._id}>{order.vehicle.licensePlate}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="date"
                                                    value={inputs.date ? new Date(inputs.date).toISOString().split("T")[0] : ""}
                                                    onChange={(e) => {
                                                        const selectedDate = new Date(e.target.value).toISOString(); // Convert to ISO format

                                                        // Create a synthetic event with the correct type
                                                        const syntheticEvent = {
                                                            ...e,
                                                            target: { ...e.target, value: selectedDate },
                                                        };

                                                        handleInput(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
                                                    }}
                                                />
                                                {errors.date && <div className="text-danger">{errors.date}</div>}
                                            </div>


                                            <div className="mb-2 form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    name="isPersonalTask"
                                                    onChange={(e) =>
                                                        setInputs((prev) => ({ ...prev, isPersonalTask: e.target.checked }))
                                                    }
                                                    checked={inputs.isPersonalTask}
                                                />
                                                <label className="form-check-label">Is Personal Task?</label>
                                            </div>
                                        </>
                                    )}

                                    {currentStep === 2 && (
                                        <>
                                            {inputs.isPersonalTask ? (
                                                <>
                                                    <h4>Personal Task Details</h4>
                                                    {inputs.personalTaskDetails.map((task, index) => (
                                                        <div key={index} className="mb-2 border p-2 rounded">
                                                            <h5>Personal Task #{index + 1}</h5>
                                                            <div className="d-flex flex-column align-items-center mb-2">
                                                                <label className="form-label text-center">Employee</label>
                                                                <select
                                                                    name="labourId"
                                                                    className="form-control text-center w-75"
                                                                    value={task.labourId || ""}
                                                                    onChange={(e) => {
                                                                        const selectedLabourId = e.target.value;
                                                                        setInputs((prev) => ({
                                                                            ...prev,
                                                                            personalTaskDetails: prev.personalTaskDetails.map((t, i) =>
                                                                                i === index ? { ...t, labourId: selectedLabourId } : t
                                                                            ),
                                                                        }));
                                                                    }}
                                                                >
                                                                    <option value="">Select Employee</option>
                                                                    {labourOptions.map((labour) => (
                                                                        <option key={labour._id} value={labour._id}>{labour.name}</option>
                                                                    ))}
                                                                </select>

                                                            </div>

                                                            <div className="mb-2">
                                                                <label className="form-label">Work Description</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="workDescription"
                                                                    value={task.workDescription}
                                                                    onChange={(e) => updatePersonalTaskEntry(index, "workDescription", e.target.value)}
                                                                />
                                                                {errors[`personalTaskDetails-${index}-workDescription`] && (
                                                                    <div className="text-danger">{errors[`personalTaskDetails-${index}-workDescription`]}</div>
                                                                )}
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label">Start Date</label>
                                                                <input
                                                                    type="date"
                                                                    className="form-control"
                                                                    name="startDate"
                                                                    value={task.startDate ? new Date(task.startDate).toISOString().split("T")[0] : ""}
                                                                    onChange={(e) =>
                                                                        updatePersonalTaskEntry(index, "startDate", new Date(e.target.value).toISOString())
                                                                    }
                                                                />
                                                                {errors[`personalTaskDetails-${index}-startDate`] && (
                                                                    <div className="text-danger">{errors[`personalTaskDetails-${index}-startDate`]}</div>
                                                                )}
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label">Progress Percentage</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="progressPercentage"
                                                                    value={task.progressPercentage}
                                                                    onChange={(e) => updatePersonalTaskEntry(index, "progressPercentage", e.target.value)}
                                                                />
                                                                {errors[`personalTaskDetails-${index}-progressPercentage`] && (
                                                                    <div className="text-danger">{errors[`personalTaskDetails-${index}-progressPercentage`]}</div>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => removePersonalTaskEntry(index)}
                                                            >
                                                                Remove Personal Task
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={addPersonalTaskEntry}
                                                    >
                                                        Add Personal Task
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <h4>Schedules</h4>
                                                    {inputs.schedules.map((schedule, index) => (
                                                        <div key={index} className="mb-2 border p-2 rounded">
                                                            <h5>Schedule Entry #{index + 1}</h5>
                                                            <div className="d-flex flex-column align-items-center mb-2">
                                                                <label className="form-label text-center">Employee</label>
                                                                <select name="labourId" className="form-control text-center w-75" value={inputs.schedules[0]?.labourId} onChange={(e) => {
                                                                    const selectedLabourId = e.target.value;
                                                                    const selectedLabour = labourOptions.find((labour) => labour._id === selectedLabourId);
                                                                    setInputs((prev) => ({
                                                                        ...prev,
                                                                        schedules: [{ ...prev.schedules[0], labourId: selectedLabour?._id || "" }],
                                                                    }));
                                                                }}>
                                                                    <option value="">Select Employee</option>
                                                                    {labourOptions.map((labour) => (
                                                                        <option key={labour.name} value={labour._id}>{labour.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div className="mb-2">
                                                                <label className="form-label">Work Assigned</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="workAssigned"
                                                                    value={schedule.workAssigned}
                                                                    onChange={(e) => updateScheduleEntry(index, "workAssigned", e.target.value)}
                                                                />
                                                                {errors[`schedules-${index}-workAssigned`] && (
                                                                    <div className="text-danger">{errors[`schedules-${index}-workAssigned`]}</div>
                                                                )}
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label">Hours</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    name="hours"
                                                                    value={schedule.hours || ""}
                                                                    onChange={(e) => updateScheduleEntry(index, "hours", e.target.value)}
                                                                />
                                                                {errors[`schedules-${index}-hours`] && (
                                                                    <div className="text-danger">{errors[`schedules-${index}-hours`]}</div>
                                                                )}
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label">Is Completed</label>
                                                                <select
                                                                    className="form-control"
                                                                    name="isCompleted"
                                                                    value={schedule.isCompleted ? "true" : "false"}
                                                                    onChange={(e) =>
                                                                        updateScheduleEntry(index, "isCompleted", e.target.value === "true")
                                                                    }
                                                                >
                                                                    <option value="false">No</option>
                                                                    <option value="true">Yes</option>
                                                                </select>
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label">Reason</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="reason"
                                                                    value={schedule.reason || ""}
                                                                    onChange={(e) => updateScheduleEntry(index, "reason", e.target.value)}
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => removeScheduleEntry(index)}
                                                            >
                                                                Remove Schedule
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={addScheduleEntry}
                                                    >
                                                        Add Schedule Entry
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}

                                    <div className="d-flex justify-content-between mt-3">
                                        {/* Back button (only shows on Step 2) */}
                                        {currentStep === 2 && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={prevStep}
                                            >
                                                Back
                                            </button>
                                        )}

                                        {/* Dynamic button (Next for Step 1, Submit for Step 2) */}
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${currentStep === 1 ? "btn-primary" : "btn-success"}`}
                                            onClick={currentStep === 1 ? nextStep : handleSubmit}
                                            disabled={loading}
                                        >
                                            {loading ? "Processing..." : currentStep === 1 ? "Next" : "Submit Daily Schedule"}
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
};

export default DailyScheduleForm;
