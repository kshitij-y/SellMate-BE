import { Hono } from "hono";
import { addAddress, getAddress, updateAddress } from "../controllers/user.address.Controller";


const addressRoute = new Hono();

addressRoute.get("/getAddress", getAddress);
addressRoute.post("/addAddress", addAddress);
addressRoute.patch("/updateAddress", updateAddress);

export default addressRoute;
