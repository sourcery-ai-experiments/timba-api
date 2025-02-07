import { OK } from "http-status";
import { Deposit, Player } from "@prisma/client";
import { DepositServices } from "./services";
import { DepositsDAO } from "@/db/deposits";
import { apiResponse } from "@/helpers/apiResponse";
import {
  DepositRequest,
  DepositUpdateRequest,
} from "@/types/request/transfers";
import { DepositResult } from "@/types/response/transfers";
import { extractResourceSearchQueryParams } from "@/helpers/queryParams";
import { hidePassword } from "@/utils/auth";

export class DepositController {
  static readonly index = async (req: Req, res: Res, next: NextFn) => {
    try {
      const { page, itemsPerPage, search, orderBy } =
        extractResourceSearchQueryParams<Deposit & { Player: Player }>(req);

      const depositServices = new DepositServices();
      const deposits = await depositServices.getAll<
        Deposit & { Player: Player }
      >(page, itemsPerPage, search, orderBy);
      const result = deposits.map((deposit) => ({
        ...deposit,
        Player: hidePassword(deposit.Player),
      }));
      const total = await DepositsDAO.count();

      res.status(OK).json(apiResponse({ result, total }));
    } catch (err) {
      next(err);
    }
  };

  static readonly show = async (req: Req, res: Res, next: NextFn) => {
    const depositId = req.params.id;
    try {
      const depositServices = new DepositServices();
      const deposit = await depositServices.show<Deposit & { Player: Player }>(
        depositId,
      );
      if (deposit) deposit[0].Player = hidePassword(deposit[0].Player);

      res.status(OK).json(apiResponse(deposit));
    } catch (err) {
      next(err);
    }
  };
  /**
   * Create new deposit or verify existing
   */
  static readonly upsert = async (req: Req, res: Res, next: NextFn) => {
    const deposit_id = req.params.id;
    const request: Omit<DepositRequest, "player_id"> = req.body;
    const player = req.user!;

    const depositServices = new DepositServices();
    try {
      let result: DepositResult;

      if (deposit_id) {
        result = await depositServices.confirm(player, deposit_id, request);
      } else {
        result = await depositServices.create(player, request);
      }

      res.status(OK).json(apiResponse(result));
    } catch (e) {
      next(e);
    }
  };

  static readonly update = async (req: Req, res: Res, next: NextFn) => {
    const deposit_id = req.params.id;
    const request: DepositUpdateRequest = req.body;
    const agent = req.user!;

    const depositServices = new DepositServices();
    try {
      const result = await depositServices.update(agent, deposit_id, request);
      res.status(OK).json(apiResponse(result));
    } catch (e) {
      next(e);
    }
  };

  /**
   * Show player's pending deposits
   */
  static readonly pending = async (req: Req, res: Res, next: NextFn) => {
    const player = req.user!;

    try {
      const deposits = await DepositServices.showPending(player.id);
      res.status(OK).json(apiResponse(deposits));
    } catch (err) {
      next(err);
    }
  };

  /**
   * Show total amount of pending coin transfers
   */
  static readonly pendingCoinTransfers = async (
    _req: Req,
    res: Res,
    next: NextFn,
  ) => {
    try {
      const amount = await DepositServices.pendingCoinTransfers();
      res.status(OK).json(apiResponse(amount));
    } catch (err) {
      next(err);
    }
  };
}
