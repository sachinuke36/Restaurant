

export const register = async (userData: { name: string; email: string; password: string, phone: number }) => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    return await response.json();
  } catch (error) {
    console.error("Error during registration:", error);
    
  }
}

export const login = async (userData: {email: string, password: string}) =>{
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/login`,{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData)
    })
    return await response.json();
  } catch (error) {
    console.log("Error during Login", error);
  }
}