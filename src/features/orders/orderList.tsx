import { useState, useEffect } from "react";
import { deleteOrder, getOrders } from "../../routes/orderApi";
import NavBar from "../../components/navBar";

type User = {
    name: string;
    phone: string;
};

type VehicleDetails = {
    make: string;
    model: string;
    year: string;
    licensePlate: string;
    insuranceService: boolean;
};

type ServiceDetails = {
    serviceType: "Tingering" | "Painting";
    description: string;
};

type RevenueDetails = {
    serviceCategory: "Tingering" | "Painting";
    advancePayment: string;
    paymentDate: Date;
    paymentMode: "Upi" | "BankTransfer" | "Cash";
};

interface Order {
    _id: string;
    user: User;
    vehicle: VehicleDetails;
    services: ServiceDetails[];
    revenueDetail: RevenueDetails[];
    orderDate: Date;
    status: string;
}

export const OrderList = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof Order | "", direction: "asc" | "desc" }>({ key: "", direction: "asc" });

    useEffect(() => {
        fetchOrders();
    }, []);



    const handleViewClick = (order: Order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const handleDelete = async (orderId: string) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            try {
                await deleteOrder(orderId);
                alert("Order deleted successfully.");
                fetchOrders(); // Refresh orders list after deletion
            } catch (error) {
                console.error("Error deleting order:", error);
                alert("Failed to delete order.");
            }
        }
    };


    const fetchOrders = async () => {
        try {
            const response = await getOrders();
            console.log("Fetched Orders:", response);

            const formattedOrders: Order[] = response.map((order: any) => ({
                _id: order._id ?? "",
                user: order.user ?? { name: "", phone: "" },
                vehicle: order.vehicle ?? {
                    make: "",
                    model: "",
                    year: "",
                    licensePlate: "",
                    insuranceService: false,
                },
                services: order.services ?? { serviceType: "Tingering", description: "" },
                revenueDetail: order.revenueDetail ?? {
                    serviceCategory: "Tingering",
                    advancePayment: "",
                    paymentDate: new Date(),
                    paymentMode: "Cash",
                },
                orderDate: order.orderDate && !isNaN(new Date(order.orderDate).getTime())
                    ? new Date(order.orderDate)
                    : new Date(), // Fallback to current date
                status: order.status ?? "Pending",
            }));
            console.log("🚀 ~ constformattedOrders:Order[]=response.map ~ formattedOrders:", formattedOrders)

            setOrders(formattedOrders);
            setFilteredOrders(formattedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };


    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        setSearch(searchValue);

        const filtered = orders.filter(order =>
            order.user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            order.status.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredOrders(filtered);
    };

    const handleSort = (key: keyof Order) => {
        if (!orders.length) return;

        let direction: "asc" | "desc" = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });

        const sorted = [...filteredOrders].sort((a, b) => {
            const valA = a[key] ?? "";
            const valB = b[key] ?? "";

            return direction === "asc"
                ? String(valA).localeCompare(String(valB))
                : String(valB).localeCompare(String(valA));
        });
        console.log("🚀 ~ sorted ~ sorted:", sorted)

        setFilteredOrders(sorted);
    };

    return (
        <div>
            <NavBar />
        <div className="container mt-5 p-4 bg-white shadow-lg rounded">
            <h2 className="mb-4 text-center">Orders</h2>
            <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={handleSearch}
                className="form-control mb-4"
            />
            <div className="table-responsive">
                <table className="table table-striped table-hover table-bordered">
                    <thead className="table-dark text-center">
                        <tr>
                            <th onClick={() => handleSort("user")} style={{ cursor: "pointer" }}>
                                Customer {sortConfig.key === "user" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th onClick={() => handleSort("vehicle")} style={{ cursor: "pointer" }}>
                                Vehicle {sortConfig.key === "vehicle" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th>Services</th>
                            <th onClick={() => handleSort("orderDate")} style={{ cursor: "pointer" }}>
                                Order Date {sortConfig.key === "orderDate" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                                Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order._id}>
                                <td>{order.user.name}</td>
                                <td>{order.vehicle.make} {order.vehicle.model} ({order.vehicle.licensePlate})</td>
                                <td>
                                    {order.services.length > 0
                                        ? order.services.map((service) => service.serviceType).join(", ")
                                        : "No services"}
                                </td>
                                <td>
                                    {order.orderDate
                                        ? new Intl.DateTimeFormat("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        }).format(new Date(order.orderDate))
                                        : "No date"}
                                </td>
                                <td>{order.status}</td>
                                <td className="text-center">
                                    <button
                                        className="btn btn-outline-primary me-2"
                                        onClick={() => handleViewClick(order)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(order._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <div className="modal d-block">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Order Details</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Customer:</strong> {selectedOrder.user.name}</p>
                                <p><strong>Vehicle:</strong> {selectedOrder.vehicle.make} {selectedOrder.vehicle.model} ({selectedOrder.vehicle.licensePlate})</p>
                                <h3>Service Details</h3>
                                <div className="service-details-container">
                                    {selectedOrder?.services?.length > 0 ? (
                                        <table className="service-details-table">
                                            <thead>
                                                <tr>
                                                    <th>Service Type</th>
                                                    <th>Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.services.map((service, index) => (
                                                    <tr key={index}>
                                                        <td>{service.serviceType ?? "N/A"}</td>
                                                        <td>{service.description ?? "N/A"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p>No service details available</p>
                                    )}
                                </div>
                                <p></p>
                                {/* Revenue Details Section */}
                                <h3>Revenue Details</h3>
                                {selectedOrder?.revenueDetail?.length > 0 ? (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Service Category</th>
                                                <th>Advance Payment</th>
                                                <th>Payment Date</th>
                                                <th>Payment Mode</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.revenueDetail.map((detail, index) => (
                                                <tr key={index}>
                                                    <td>{detail.serviceCategory ?? "N/A"}</td>
                                                    <td>{detail.advancePayment ?? "N/A"}</td>
                                                    <td>
                                                        {detail.paymentDate
                                                            ? new Date(detail.paymentDate).toLocaleDateString()
                                                            : "N/A"}
                                                    </td>
                                                    <td>{detail.paymentMode ?? "N/A"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No revenue details available</p>
                                )}
                                <p></p>
                                <p><strong>Order Date:</strong> {new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(selectedOrder.orderDate))}</p>
                                <p><strong>Status:</strong> {selectedOrder.status}</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};
