export const storeUserData = (token: string, role: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
};


export const removeUserData = ()=>{
     localStorage.removeItem('access_token')
}

export const getUserRole = () => {
    return localStorage.getItem("role");
};