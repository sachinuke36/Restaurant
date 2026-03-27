

export const getAllCategories = async()=>{
    try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/category`,{
            method: "GET",
            headers:{
                "Content-Type": "application/json"
            }
        })
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}