import { OK } from "http-status";
import { PlayerServices } from "../players/services";
import { AgentServices } from "./services";
import { Credentials } from "@/types/request/players";
import { apiResponse } from "@/helpers/apiResponse";
import { AgentBankAccount } from "@/types/response/agent";
import { PlayersDAO } from "@/db/players";
import { NotFoundException } from "@/helpers/error";

export class AgentController {
  static async login(req: Req, res: Res, next: NextFn) {
    try {
      const credentials: Credentials = req.body;
      const user_agent = req.headers["user-agent"] ?? "";

      const { tokens } = await AgentServices.login(credentials, user_agent);

      res.status(OK).json(apiResponse({ access: tokens }));
    } catch (error) {
      next(error);
    }
  }

  static async releasePayment(req: Req, res: Res, next: NextFn) {
    try {
      const { id } = req.params;

      const payment = await AgentServices.releasePayment(id);

      res.status(OK).json(apiResponse(payment));
    } catch (error) {
      next(error);
    }
  }

  static async markPaymentAsPaid(req: Req, res: Res, next: NextFn) {
    try {
      const { id } = req.params;

      const payment = await AgentServices.markPaymentAsPaid(id);

      res.status(OK).json(apiResponse(payment));
    } catch (error) {
      next(error);
    }
  }

  static async getBankAccount(_req: Req, res: Res, next: NextFn) {
    try {
      const bankAccount = await AgentServices.getBankAccount();

      res.status(OK).json(apiResponse(bankAccount));
    } catch (error) {
      next(error);
    }
  }

  static async updateBankAccount(req: Req, res: Res, next: NextFn) {
    try {
      const data: AgentBankAccount = req.body;

      const bankAccount = await AgentServices.updateBankAccount(data);

      res.status(OK).json(apiResponse(bankAccount));
    } catch (error) {
      next(error);
    }
  }

  static async getCasinoBalance(_req: Req, res: Res, next: NextFn) {
    try {
      const balance = await AgentServices.getCasinoBalance();

      res.status(OK).json(apiResponse(balance));
    } catch (error) {
      next(error);
    }
  }

  static async getAlqBalance(_req: Req, res: Res, next: NextFn) {
    try {
      const balance = await AgentServices.getAlqBalance();

      res.status(OK).json(apiResponse(balance));
    } catch (error) {
      next(error);
    }
  }

  static async completePendingDeposits(_req: Req, res: Res, next: NextFn) {
    try {
      const deposits = await AgentServices.freePendingCoinTransfers();

      res.status(OK).json(apiResponse(deposits));
    } catch (error) {
      next(error);
    }
  }

  static async setOnCallBotFlow(req: Req, res: Res, next: NextFn) {
    try {
      const { active } = req.body;

      await AgentServices.setOnCallBotFlow(active);

      res.status(OK).send();
    } catch (error) {
      next(error);
    }
  }

  static async getOnCallStatus(_req: Req, res: Res, next: NextFn) {
    try {
      const onCall: boolean = await AgentServices.getOnCallStatus();

      res.status(OK).json(apiResponse(onCall));
    } catch (error) {
      next(error);
    }
  }

  static async getSupportNumbers(_req: Req, res: Res, next: NextFn) {
    try {
      const numbers = await AgentServices.getSupportNumbers();

      res.status(OK).json(apiResponse(numbers));
    } catch (error) {
      next(error);
    }
  }

  static async updateSupportNumbers(req: Req, res: Res, next: NextFn) {
    try {
      const data = req.body;

      const response = await AgentServices.updateSupportNumbers(data);

      res.status(OK).send(apiResponse(response));
    } catch (error) {
      next(error);
    }
  }

  static async resetPlayerPassword(req: Req, res: Res, next: NextFn) {
    try {
      const playerServices = new PlayerServices();
      const { new_password, user_id } = req.body;
      const user = await PlayersDAO._getById(user_id);

      if (!user) throw new NotFoundException();

      await playerServices.resetPassword(user, new_password);

      res.status(OK).send();
    } catch (error) {
      next(error);
    }
  }
}
