import { jwtDecode, JwtPayload } from "jwt-decode";

export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) return true;

    const currentTime = Date.now() / 1000;

    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};