import { SuperAgentTest } from "supertest";
import { Bonus, Player, PrismaClient } from "@prisma/client";
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from "http-status";
import { initAgent } from "./helpers";
import CONFIG from "@/config";
import { AuthServices } from "@/components/auth/services";
import { BonusServices } from "@/components/bonus/services";
import { CoinTransferResult } from "@/types/response/transfers";
import { CasinoCoinsService } from "@/services/casino-coins.service";

let agent: SuperAgentTest;
let pendingBonus: Bonus;
let playerAccessToken: string;
let prisma: PrismaClient;
let player: Player;
beforeAll(initialize);

afterAll(cleanUp);

describe("[UNIT] => BONUS ROUTER", () => {
  const mockBonus: Bonus = {
    id: "foo",
    amount: 1,
    percentage: 100,
    player_id: "baz",
    status: CONFIG.SD.BONUS_STATUS.ASSIGNED,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const mockCreateBonus = jest.fn(async () => mockBonus);
  jest
    .spyOn(BonusServices.prototype, "create")
    .mockImplementation(mockCreateBonus);

  describe("POST /bonus", () => {
    it("Should create a bonus", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bonus`)
        .send({ player_id: player.id })
        .set("Authorization", "Bearer " + playerAccessToken);

      expect(response.status).toBe(CREATED);
      expect(response.body.data.id).toBe("foo");
      expect(mockCreateBonus).toHaveBeenCalledTimes(1);
    });

    it("Should return 400 unknown_fields", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bonus`)
        .send({ foo: "bar", player_id: player.id })
        .set("Authorization", "Bearer " + playerAccessToken);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].type).toBe("unknown_fields");
    });

    it("Should return 400 invalid player id", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bonus`)
        .send({ player_id: "foo" })
        .set("Authorization", "Bearer " + playerAccessToken);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe("invalid player ID");
    });

    it("Should return 401", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bonus`)
        .send({ player_id: player.id });

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("GET /bonus/:id/redeem", () => {
    const mockCoinTransferResult: CoinTransferResult = {
      ok: true,
      player_balance: 1,
    };
    const mockBonusAgentToPlayer = jest.fn(async () => mockCoinTransferResult);
    jest
      .spyOn(CasinoCoinsService.prototype, "bonusAgentToPlayer")
      .mockImplementation(mockBonusAgentToPlayer);

    it("Should redeem a bonus", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/bonus/${pendingBonus.id}/redeem`)
        .set("Authorization", "Bearer " + playerAccessToken);

      expect(response.status).toBe(OK);
      expect(response.body.data.bonus.status).toBe(
        CONFIG.SD.BONUS_STATUS.REDEEMED,
      );
      expect(response.body.data.player_balance).toBe(1);
      expect(mockBonusAgentToPlayer).toHaveBeenCalledTimes(1);
    });
  });
});
async function initialize() {
  agent = await initAgent();
  prisma = new PrismaClient();
  const authServices = new AuthServices();

  const found = await prisma.player.findFirst();
  if (!found) throw new Error("Player not found");
  player = found;

  pendingBonus = await prisma.bonus.create({
    data: {
      amount: 1,
      percentage: 100,
      player_id: player!.id,
      status: CONFIG.SD.BONUS_STATUS.PENDING,
    },
  });

  const { tokens } = await authServices.tokens(player!.id, "jest_test");
  playerAccessToken = tokens.access;
}

async function cleanUp() {
  await prisma.bonus.delete({
    where: { id: pendingBonus.id },
  });
}
