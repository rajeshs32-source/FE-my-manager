import { getUserByToken } from "./authApi";
import {removeUserData } from "./storage"


export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const response = await getUserByToken();
        return !!response?.data?.data?.findUser;
    } catch (error) {
        console.error("Error checking authentication:", error);
        return false;
    }
};

// export const logout = ()=>{
//     removeUserData();
// }