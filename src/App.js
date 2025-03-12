import './App.css';
// import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RegisterPage } from './features/auth/register/registerPage';
import { DashboardPage } from "./features/dashboard/dashboard";
import { LoginPage } from "./features/auth/login/loginpage";
import { ServiceForm } from "./features/services/serviceForm"
import { ServicesTable } from "./features/services/serviceList"
import { OrderForm } from "./features/orders/orderForm"
import { OrderList } from "./features/orders/orderList"
import { DailyReportForm } from "./features/dailyReport/dailyReportForm"
import { DailyScheduleForm } from "./features/dailySchedule/dailyScheduleForm"
import { DailyScheduleList} from "./features/dailySchedule/dailyScheduleList"
import { DailyReportList} from "./features/dailyReport/dailyReportList"

// function App() {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     fetch('http://localhost:6002/api/admin/auth/getAllUsers')
//       .then((response) => response.json())  // First then for parsing JSON
//       .then((json) => {
//         console.log("API Response:", json.data); // Log the API response to verify
//         setUsers(json.data); // Set users state with the fetched data
//       })
//       .catch((error) => {
//         console.error("Error fetching users:", error); // Catch any errors
//       });
//   }, []);
//   return (
//     <div className="App">
//       <table className='bp4-html-table modifier'>
//         <thead>
//           <th>Name</th>
//           <th>accessType</th>
//           <th>status</th>
//           <th>countryCode</th>
//           <th>isAdmin</th>
//         </thead>
//         <tbody>
//           {users.map(user =>
//             <tr key={user.id}>
//               <td>{user.username}</td>
//               <td>{user.accessType}</td>
//               <td>{user.status}</td>
//               <td>{user.countryCode}</td>
//               <td>{String(user.isAdmin)}</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/service/create" element={<ServiceForm />} />
          <Route path="/service" element={<ServicesTable />} />
          <Route path="/order/create" element={<OrderForm />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/dailyReport/create" element={<DailyReportForm />} />
          <Route path="/dailySchedule/create" element={<DailyScheduleForm />} />
          <Route path="/dailySchedule" element={<DailyScheduleList />} />
          <Route path="/dailyReport" element={<DailyReportList />} />
          <Route path="/" element={<h1>Home</h1>} />
        </Routes>
      </BrowserRouter>


    </div>
  );
}

export default App;
