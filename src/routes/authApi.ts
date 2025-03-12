import axios from "axios"
// import { getUserData } from "./storage";

axios.defaults.baseURL = "http://localhost:6002/api/";
const REGISTER_URL = `admin/auth/signup`;
const LOGIN_URL = `admin/auth/login`;
// const USER_DETAILS_URL = ``;
const GET_USER_BY_TOKEN = `admin/auth/getUserByToken`;
const LOGOUT = `admin/auth/logout`;


export const RegisterApi = async (inputs: FormData) => {
    console.log("🚀 ~ RegisterApi ~ inputs:", inputs)
    try {

        const response = await axios.post(REGISTER_URL, inputs, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response;
    } catch (error) {
        throw error; // Re-throw for handling in the caller
    }
};

export const LoginApi = (inputs: any) => {
    let data = { username: inputs.username, password: inputs.password };

    return axios.post(LOGIN_URL, data, {
        withCredentials: true, // ✅ Send cookies with request
    });
};

// export const UserDetailsApi = () => {
//     let data = { access_token: getUserData() }
//     return axios.post(USER_DETAILS_URL, data)
// }

export const getUserByToken = async () => {
    try {
        const response = await axios.get(GET_USER_BY_TOKEN, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        });
        console.log("🚀 ~ getUserByToken ~ response:", response)
        return response;
    } catch (error) {
        console.log("🚀 ~ getUserByToken ~ error:", error)
        throw error; // Re-throw for handling in the caller
    }
};

export const logout = async ()=> {
    try{
        const response = await axios.post(LOGOUT,{}, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        });
        console.log("🚀 ~ getUserByToken ~ response:", response)
        return response;
    }
    catch (error) {
        console.log("🚀 ~ getUserByToken ~ error:", error)
        throw error; // Re-throw for handling in the caller
    }
}