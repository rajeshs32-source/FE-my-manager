import { useState, useEffect } from "react";
import { getDailySchedule, deleteDailySchedule } from "../../routes/dailyScheduleApi";
import NavBar from "../../components/navBar";
import { useNavigate } from "react-router-dom";

interface Schedule {
    labourId: string;
    workAssigned: string;
    hours: number;
    isCompleted: boolean;
    reason?: string;
}

interface PersonalTaskDetail {
    personalTaskId?: string;
    labourId: string;
    workDescription: string;
    startDate: Date;
    progressPercentage: string;
}

export interface DailySchedule {
    orderId?: string;
    schedules: Schedule[];
    isPersonalTask: boolean;
    personalTaskDetails: PersonalTaskDetail[];
    date: Date;
}

export const DailyScheduleList = () => {
    const [schedules, setSchedules] = useState<DailySchedule[]>([]);
    const [filteredSchedules, setFilteredSchedules] = useState<DailySchedule[]>([]);
    const [selectedSchedule, setSelectedSchedule] = useState<DailySchedule | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof DailySchedule | "", direction: "asc" | "desc" }>({ key: "", direction: "asc" });

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await getDailySchedule();
            console.log("Fetched Schedules:", response);

            const formattedSchedules: DailySchedule[] = response.map((schedule: any) => ({
                orderId: schedule.orderId ?? "",
                schedules: schedule.schedules ?? [],
                isPersonalTask: schedule.isPersonalTask ?? false,
                personalTaskDetails: schedule.personalTaskDetails ?? [],
                date: schedule.date ? new Date(schedule.date) : new Date(),
            }));

            setSchedules(formattedSchedules);
            setFilteredSchedules(formattedSchedules);
        } catch (error) {
            console.error("Error fetching schedules:", error);
        }
    };

    const handleViewClick = (schedule: DailySchedule) => {
        setSelectedSchedule(schedule);
        setShowModal(true);
    };

    const handleDeleteClick = async (orderId?: string) => {
        if (!orderId) return;

        try {
            await deleteDailySchedule(orderId);
            setSchedules(prevSchedules => prevSchedules.filter(schedule => schedule.orderId !== orderId));
            setFilteredSchedules(prevSchedules => prevSchedules.filter(schedule => schedule.orderId !== orderId));
        } catch (error) {
            console.error("Error deleting schedule:", error);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        setSearch(searchValue);

        const filtered = schedules.filter(schedule =>
            schedule.orderId?.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredSchedules(filtered);
    };

    const handleSort = (key: keyof DailySchedule) => {
        if (!schedules.length) return;

        let direction: "asc" | "desc" = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });

        const sorted = [...filteredSchedules].sort((a, b) => {
            const valA = a[key] ?? "";
            const valB = b[key] ?? "";
            return direction === "asc"
                ? String(valA).localeCompare(String(valB))
                : String(valB).localeCompare(String(valA));
        });
        setFilteredSchedules(sorted);
    };

    return (
        <div>
             <NavBar/>
        <div className="container mt-5 p-4 bg-white shadow-lg rounded">
            <h2 className="mb-4 text-center">Daily Schedule</h2>
            <input
                type="text"
                placeholder="Search by Order ID..."
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
                            <th>Order ID</th>
                            <th>Personal Task</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSchedules.map((schedule, index) => (
                            <tr key={index}>
                                <td>{new Date(schedule.date).toLocaleDateString()}</td>
                                <td>{schedule.orderId || "N/A"}</td>
                                <td>{schedule.isPersonalTask ? "Yes" : "No"}</td>
                                <td className="text-center">
                                    <button className="btn btn-outline-primary me-2" onClick={() => handleViewClick(schedule)}>
                                        View
                                    </button>
                                    <button className="btn btn-outline-danger" onClick={() => handleDeleteClick(schedule.orderId)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    );
};
