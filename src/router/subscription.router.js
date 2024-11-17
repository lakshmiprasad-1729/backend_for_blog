import { Router } from "express";
import { toggleSubscription,currentUserSubscriptionStatus } from "../controllers/subscription.controllers.js";
import authmiddleware from "../middlewares/auth.middleware.js";


const subscriptionRouter = Router();

subscriptionRouter
.route('/get-current-user-subscription-status').get(authmiddleware,currentUserSubscriptionStatus)

subscriptionRouter
.route('/toggle-subscription').post(authmiddleware,toggleSubscription)

export default subscriptionRouter;