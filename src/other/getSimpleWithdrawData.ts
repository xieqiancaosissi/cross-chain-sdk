import _ from "lodash";
import { Assets, Portfolio } from "../types";
import { computeRelayerGas } from "./computeRelayerGas";
export const getSimpleWithdrawData = async ({
  nearStorageAmount,
  mca,
  relayerGasFees,
  assets,
  portfolio,
}: {
  nearStorageAmount: string | number;
  mca: string;
  relayerGasFees: Record<string, string>;
  assets: Assets;
  portfolio: Portfolio;
}) => {
  const gasData = await computeRelayerGas({
    nearStorageAmount,
    mca,
    relayerGasFees,
    assets,
    portfolio,
  });
  const simpleWithdrawData = gasData
  ? {
      tokenId: gasData.tokenId,
      amount: gasData.amount,
      amountToken: gasData.amountToken,
      amountBurrow: gasData.amountBurrow,
    }
  : null;
  return simpleWithdrawData;
};


