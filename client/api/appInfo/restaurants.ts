export const getAllRestaurants = async ()=>{
    try {
        const resp = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/app/restaurants`,{
            method: "GET",
            headers:{
                "Content-Type": "application/json"
            }
        });
        return await resp.json();

    } catch (error) {
        console.log("Error fetching Restaurant Informations ", error)
    }
}


export const getRestaurantFullInfo = async (restaurantId: string | number) => {
  try {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/app/restaurants/${restaurantId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    return await res.json();
  } catch (error) {
    console.log(error);
  }
};