import { Hono } from "hono";
import { addReview, deleteReview, getReviewsByProduct, updateReview } from "../controllers/user.review.Controllers";

const reviewRouter = new Hono();

reviewRouter.post("/addReview", addReview);
reviewRouter.get("/:product_id", getReviewsByProduct);
reviewRouter.put("/:review_id", updateReview);
reviewRouter.delete("/:review_id", deleteReview);

export default reviewRouter;