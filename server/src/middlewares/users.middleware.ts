import { NextFunction, Request, Response } from "express"
import  jwt  from "jsonwebtoken";
import { AuthRequest } from "../../types/express";

export const UsersMiddleware = async (req: AuthRequest, res: Response, next: NextFunction)=>{
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader) return res.status(401).json({message: "Authorization Token is missing!"})
        const token = authHeader.split(" ")[1];
        if(!token) return res.status(401).json({message: "Invalid Token format!"});
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = {
            id: decoded.id,
        }
        next()
    } catch (error) {
        console.log(error)
         return res.status(401).json({
      message: "Unauthorized",
    });
    }
}