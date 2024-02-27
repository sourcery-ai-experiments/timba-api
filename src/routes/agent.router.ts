import { Router } from "express";
import { checkExact } from "express-validator";
import passport from "passport";
import { AgentController } from "@/components/agent/controller";
import { validateCredentials } from "@/components/players/validators";
import { validatePaymentIndex } from "@/components/agent/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";

const agentRouter = Router();

agentRouter.post(
  "/login",
  validateCredentials(),
  checkExact(),
  throwIfBadRequest,
  AgentController.login,
);
agentRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
agentRouter.get("/payments", AgentController.showPayments);
agentRouter.put(
  "/payments/:id/paid",
  validatePaymentIndex(),
  checkExact(),
  throwIfBadRequest,
  AgentController.markAsPaid,
);
agentRouter.get("/deposits", AgentController.showDeposits);
agentRouter.get("/qr", AgentController.qr);

export default agentRouter;