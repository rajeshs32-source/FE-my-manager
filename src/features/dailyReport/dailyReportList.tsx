import { useState, useEffect } from "react";
import { getDailyReport, deleteDailyReport } from "../../routes/dailyReportApi";
import NavBar from "../../components/navBar";

interface BillDetail {
    name: string;
    description: string;
    amount: number;
    orderId?: string;
    billImage?: string;
    type: string;
}

interface DailyReport {
    _id?: string;
    date: Date;
    billDetails: BillDetail[];
}

export const DailyReportList = () => {
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [filteredReports, setFilteredReports] = useState<DailyReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof DailyReport | "", direction: "asc" | "desc" }>({ key: "", direction: "asc" });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await getDailyReport();
            console.log("Fetched Reports:", response);

            const formattedReports: DailyReport[] = response.map((report: any) => ({
                _id: report._id,
                date: report.date ? new Date(report.date) : new Date(),
                billDetails: report.billDetails ?? [],
            }));

            setReports(formattedReports);
            setFilteredReports(formattedReports);
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    };

    const handleViewClick = (report: DailyReport) => {
        setSelectedReport(report);
        setShowModal(true);
    };

    const confirmDelete = (id: string) => {
        setReportToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDeleteClick = async () => {
        if (!reportToDelete) return;
        try {
            await deleteDailyReport(reportToDelete);
            setReports(prevReports => prevReports.filter(report => report._id !== reportToDelete));
            setFilteredReports(prevReports => prevReports.filter(report => report._id !== reportToDelete));
        } catch (error) {
            console.error("Error deleting report:", error);
        }
        setShowDeleteModal(false);
        setReportToDelete(null);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        setSearch(searchValue);

        const filtered = reports.filter(report =>
            new Date(report.date).toLocaleDateString().includes(searchValue)
        );
        setFilteredReports(filtered);
    };

    const handleSort = (key: keyof DailyReport) => {
        if (!reports.length) return;

        let direction: "asc" | "desc" = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });

        const sorted = [...filteredReports].sort((a, b) => {
            const valA = a[key] ?? "";
            const valB = b[key] ?? "";
            return direction === "asc"
                ? String(valA).localeCompare(String(valB))
                : String(valB).localeCompare(String(valA));
        });
        setFilteredReports(sorted);
    };

    return (
        <div>
             <NavBar />
        <div className="container mt-5 p-4 bg-white shadow-lg rounded">
            <h2 className="mb-4 text-center">Daily Report</h2>
            <input
                type="text"
                placeholder="Search by Date..."
                value={search}
                onChange={handleSearch}
                className="form-control mb-4"
            />
            <div className="table-responsive">
                <table className="table table-striped table-hover table-bordered">
                    <thead className="table-dark text-center">
                        <tr>
                            <th onClick={() => handleSort("date")} style={{ cursor: "pointer" }}>
                                Date {sortConfig.key === "date" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th>Bill Details</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.map((report) => (
                            <tr key={report._id}>
                                <td>{new Date(report.date).toLocaleDateString()}</td>
                                <td>{report.billDetails.length} bills</td>
                                <td className="text-center">
                                    <button className="btn btn-outline-primary me-2" onClick={() => handleViewClick(report)}>
                                        View
                                    </button>
                                    <button className="btn btn-danger" onClick={() => report._id && confirmDelete(report._id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && selectedReport && (
                <div className="modal show d-block" tabIndex={-1}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Report Details</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Date:</strong> {new Date(selectedReport.date).toLocaleDateString()}</p>
                                <ul>
                                    {selectedReport.billDetails.map((bill, index) => (
                                        <li key={index}>
                                            <p><strong>Name:</strong> {bill.name}</p>
                                            <p><strong>Description:</strong> {bill.description}</p>
                                            <p><strong>Amount:</strong> ${bill.amount}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal show d-block" tabIndex={-1}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this report?</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-danger" onClick={handleDeleteClick}>Delete</button>
                                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};
