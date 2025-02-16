import axios from "axios"
import { getUserData} from './storage'

axios.defaults.baseURL = "http://localhost:6002/api/";
const REGISTER_URL = `admin/auth/signup`;
const LOGIN_URL = `admin/auth/login`;
const USER_DETAILS_URL = ``;

export const RegisterApi = async (inputs) => {
    try {
        const data = {
            fullName: inputs.fullName, // Updated: Combined firstName & lastName
            username: inputs.username,
            password: inputs.password,
            phoneNumber: inputs.phoneNumber, // Added: Phone number
            accessType: inputs.accessType, // Matches backend enum (admin, superAdmin)
            status: inputs.status || "Not Verified", // Default value
            avatar: inputs.avatar || "", // Optional
            roles: inputs.roles ? inputs.roles.split(",").map(role => role.trim()) : [], // Convert CSV to array
            permissions: inputs.permissions ? inputs.permissions.split(",").map(perm => perm.trim()) : [], // Convert CSV to array
        };

        const response = await axios.post(REGISTER_URL, data, {
            headers: { "Content-Type": "application/json" },
        });
        return response;
    } catch (error) {
        throw error; // Re-throw for handling in the caller
    }
};

export const LoginApi = (inputs)=>{
    let data  = {username:inputs.username,password:inputs.password }
    return axios.post(LOGIN_URL,data)
}
export const UserDetailsApi = ()=>{
    let data = {access_token:getUserData()}
    return axios.post(USER_DETAILS_URL,data)
}