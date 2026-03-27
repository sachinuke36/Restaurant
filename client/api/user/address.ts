import * as SecureStore from "expo-secure-store";


export const fetchAddress = async()=>{
    try {
        const token = await SecureStore.getItemAsync("auth_token");

        const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/address`,{
            method: "GET",
            headers:{
                "Content-Type":"application/json",
                Authorization: `Bearer ${token}`,
            }
        
            
        })
        return await res.json();
    } catch (error) {
        console.log("Error in fetching user's address ",error);
    }
}