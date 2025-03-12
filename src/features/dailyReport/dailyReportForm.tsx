import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/navBar";
import classNames from "classnames";
import { DailyReportTypeEnum, DailyIncomeExpenseTypeEnum } from "./dailyReportTypes";
import { addDailyReport } from "../../routes/dailyReportApi";
import { getOrders } from "../../routes/orderApi";
import { Order } from "../orders/orderTypes";
import Swal from "sweetalert2";

interface BillDetail {
    name: DailyIncomeExpenseTypeEnum;
    description: string;
    amount: number;
    orderId?: string;
    billImage?: string;
    type: DailyReportTypeEnum;
}

interface DailyReport {
    date: Date;
    billDetails: BillDetail[];
}

export const DailyReportForm = () => {
    const navigate = useNavigate();

    // Define initial state for the daily report form
    const initialState: DailyReport = {
        date: new Date(),
        billDetails: [
            {
                name: DailyIncomeExpenseTypeEnum.PAINTING_MATERIAL, // default value, adjust as needed
                description: "",
                amount: 0,
                orderId: "",
                billImage: "",
                type: DailyReportTypeEnum.EXPENSE, // default value
            },
        ],
    };

    const [inputs, setInputs] = useState<DailyReport>(initialState);
    const [loading, setLoading] = useState(false);
    const [orderOptions, setOrderOptions] = useState<Order[]>([]);
    const [currentStep] = useState(1); // 1: General Info, 2: Bill Details
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const orderData = await getOrders();
                setOrderOptions(orderData);
            } catch (error) {
                console.error("Error fetching labour or order data:", error);
            }
        };
        fetchData();
    }, []);

    // Generic input handler for top-level fields
    const handleInput = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
        const { name, value } = e.target;
        setInputs((prevState) => ({
          ...prevState,
          [name]: name === "totalExpense" || name === "totalIncome" || name === "amount" ? Number(value) : value,
        }));
      };
      
    // Handler for updating nested BillDetail entries (we update the first entry for simplicity)
    const updateBillDetailEntry = (
        index: number,
        field: keyof BillDetail,
        value: string | number
    ) => {
        setInputs((prevInputs) => {
            const updatedDetails = [...prevInputs.billDetails];
    
            if (!updatedDetails[index]) {
                updatedDetails[index] = {
                    name: DailyIncomeExpenseTypeEnum.PAINTING_MATERIAL,
                    description: "",
                    amount: 0,
                    orderId: "",
                    billImage: "",
                    type: DailyReportTypeEnum.EXPENSE,
                };
            }
    
            updatedDetails[index] = {
                ...updatedDetails[index],
                [field]: field === "amount" ? Number(value) : value,  // Convert amount to number
            };
    
            return { ...prevInputs, billDetails: updatedDetails };
        });
    };
    


    const addBillDetailEntry = () => {
        setInputs((prevInputs) => ({
            ...prevInputs,
            billDetails: [
                ...prevInputs.billDetails || [],
                {
                    name: DailyIncomeExpenseTypeEnum.PAINTING_MATERIAL,
                    description: "",
                    amount: 0,
                    orderId: "",
                    billImage: "",
                    type: DailyReportTypeEnum.EXPENSE,
                },
            ],
        }));
    };

    const removeBillDetailEntry = (index: number) => {
        setInputs((prevInputs) => ({
            ...prevInputs,
            billDetails: prevInputs.billDetails.filter((_, i) => i !== index),
        }));
    };

    // Simple field validation
    const validateField = (name: string, value: string| number): string | undefined => {
        const valueStr = typeof value === "number" ? value.toString() : value;
        const trimmed = valueStr.trim();
        switch (name) {
            case "totalExpense":
                if (!trimmed || Number(trimmed) <= 0) return "Total Expense must be greater than 0.";
                break;
            case "totalIncome":
                if (!trimmed || Number(trimmed) <= 0) return "Total Income must be greater than 0.";
                break;
            case "date":
                if (!trimmed) return "Date is required.";
                break;
            case "description":
                if (!trimmed) return "Description is required.";
                break;
            case "amount":
                if (!trimmed || Number(trimmed) <= 0) return "Amount must be greater than 0.";
                break;
            default:
                if (!trimmed) return `${name} is required.`;
        }
        return undefined;
    };

    // Validate current step fields
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 2) {
            inputs.billDetails.forEach((bill, index) => {
                const descError = validateField("description", bill.description);
                if (descError) newErrors[`billDetails-${index}-description`] = descError;
                const amountError = validateField("amount", bill.amount);
                if (amountError) newErrors[`billDetails-${index}-amount`] = amountError;
                const dateError = validateField("date", inputs.date.toISOString());
                if (dateError) newErrors.date = dateError;
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Validate all steps (for simplicity, validating steps 1 and 2 only)
        if (validateStep(1) && validateStep(2)) {
            try {
                await addDailyReport(inputs);
                Swal.fire({
                    icon: "success",
                    title: "Daily Report Added!",
                    text: "Your daily report has been successfully submitted.",
                    confirmButtonColor: "#28a745",
                    timer: 3000,
                }).then(() => {
                    window.location.reload(); // Reload the form page
                    // OR use react-router: navigate('/your-form-page');
                });
                navigate("/dailyReport/create");
            } catch (error) {
                console.error("Error adding daily report:", error);
                Swal.fire({
                    icon: "error",
                    title: "Submission Failed!",
                    text: "Something went wrong. Please try again.",
                    confirmButtonColor: "#d33",
                });
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

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
                                <h2 className="text-center mb-3">Create Daily Report</h2>
                                <form onSubmit={handleSubmit}>


                                    {currentStep === 1 && (
                                        <>
                                            <h4>Bill Details</h4>
                                            {inputs.billDetails.map((bill, index) => (
                                                <div key={index} className="mb-2 border p-2 rounded">
                                                    <h5>Bill Entry #{index + 1}</h5>
                                                    <div className="mb-2">
                                                        <label className="form-label">Name</label>
                                                        <select
                                                            className="form-control"
                                                            name="name"
                                                            value={bill.name}
                                                            onChange={(e) =>
                                                                updateBillDetailEntry(index, "name", e.target.value)
                                                            }
                                                        >
                                                            {Object.values(DailyIncomeExpenseTypeEnum).map((val) => (
                                                                <option key={val} value={val}>
                                                                    {val}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-2">
                                                        <label className="form-label">Description</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="description"
                                                            value={bill.description}
                                                            onChange={(e) =>
                                                                updateBillDetailEntry(index, "description", e.target.value)
                                                            }
                                                        />
                                                        {errors[`billDetails-${index}-description`] && (
                                                            <div className="text-danger">
                                                                {errors[`billDetails-${index}-description`]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mb-2">
                                                        <label className="form-label">Amount</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            name="amount"
                                                            value={bill.amount || ""}
                                                            onChange={(e) =>
                                                                updateBillDetailEntry(index, "amount", e.target.value)
                                                            }
                                                        />
                                                        {errors[`billDetails-${index}-amount`] && (
                                                            <div className="text-danger">
                                                                {errors[`billDetails-${index}-amount`]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <select
                                                        name="orderId"
                                                        className="form-control"
                                                        value={bill.orderId} // Bind it directly to the current bill entry
                                                        onChange={(e) => updateBillDetailEntry(index, "orderId", e.target.value)}
                                                    >
                                                        <option value="">Select Vehicle</option>
                                                        {orderOptions.map((order) => (
                                                            <option key={order._id} value={order._id}>
                                                                {order.vehicle.licensePlate}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="mb-2">
                                                        <label className="form-label">Bill Image URL</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="billImage"
                                                            value={bill.billImage || ""}
                                                            onChange={(e) =>
                                                                updateBillDetailEntry(index, "billImage", e.target.value)
                                                            }
                                                        />
                                                    </div>
                                                    <div className="mb-2">
                                                        <label className="form-label">Type</label>
                                                        <select
                                                            className="form-control"
                                                            name="type"
                                                            value={bill.type}
                                                            onChange={(e) =>
                                                                updateBillDetailEntry(index, "type", e.target.value)
                                                            }
                                                        >
                                                            {Object.values(DailyReportTypeEnum).map((val) => (
                                                                <option key={val} value={val}>
                                                                    {val}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {currentStep === 1 && (
                                                        <>
                                                            <div className="mb-2">
                                                                <label className="form-label">Date</label>
                                                                <input
                                                                    type="date"
                                                                    className="form-control"
                                                                    name="date"
                                                                    onChange={handleInput}
                                                                    value={inputs.date.toISOString().split("T")[0] || ""}
                                                                />
                                                                {errors.date && <div className="text-danger">{errors.date}</div>}
                                                            </div>
                                                        </>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => removeBillDetailEntry(index)}
                                                    >
                                                        Remove Bill Entry
                                                    </button>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={addBillDetailEntry}
                                            >
                                                Add Bill Entry
                                            </button>
                                        </>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="d-flex justify-content-end mt-3">
                                        {(
                                            <button
                                                type="submit"
                                                className="btn btn-success btn-sm"
                                                disabled={loading}
                                            >
                                                {loading ? "Processing..." : "Submit Daily Report"}
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
}