import { useState, useEffect } from "react";
import { Service } from "./serviceTypes";
import { getServices } from "../../routes/serviceApi";
import NavBar from "../../components/navBar";
import { Input } from "../../components/common/input";

interface ServiceWithId extends Service {
  _id: string; // Assuming `id` is a string, adjust if it's a number
}
export const ServicesTable = () => {
  const [services, setServices] = useState<ServiceWithId[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceWithId[]>([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await getServices();
      console.log("🚀 ~ fetchServices ~ response:", response)

      // Ensure every service has a valid `_id`
      const formattedResponse: ServiceWithId[] = response.map((service) => ({
        ...service,
        _id: service._id ?? "", // Assign empty string if _id is undefined
      }));

      setServices(formattedResponse);
      setFilteredServices(formattedResponse);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };


  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearch(searchValue);

    try {
      const response = await fetch(`/api/services?search=${searchValue}`);
      const data = await response.json();
      setFilteredServices(data); // Update the state with backend results
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleSort = (key: "name" | "description" | "category") => {
    if (!services.length) return;

    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredServices].sort((a, b) => {
      const valA = key === "category" ? String(a[key]) : a[key] ?? "";
      const valB = key === "category" ? String(b[key]) : b[key] ?? "";

      return direction === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

    setFilteredServices(sorted);
  };

  return (
    <div>
            <NavBar />
    <div className="container mt-5 p-4 bg-white shadow-lg rounded">
      <h2 className="mb-4 text-center">Services</h2>
      <Input
        type="text"
        placeholder="Search services..."
        value={search}
        onChange={handleSearch}
        className="form-control mb-4"
      />
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered">
          <thead className="table-dark text-center">
            <tr>
              <th onClick={() => handleSort("name")} className="cursor-pointer">Name</th>
              <th onClick={() => handleSort("category")} className="cursor-pointer">Category</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((service, index) => (
              <tr key={service._id}>
                <td>{service.name}</td>
                <td>{service.category}</td>
                <td>
                  {service.tags.map((tag, idx) => (
                    <span key={idx} className="badge bg-primary me-1">
                      {tag}
                    </span>
                  ))}
                </td>
                <td className="text-center">
                <button className="btn btn-outline-primary me-2">Edit</button>
                <button className="btn btn-danger">Delete</button>
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