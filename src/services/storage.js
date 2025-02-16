export const storeUserData = (data)=>{
    localStorage.setItem('access_token',data)
}

export const getUserData = ()=>{
    return localStorage.getItem('access_token');
}

export const removeUserData = ()=>{
     localStorage.removeItem('access_token')
}