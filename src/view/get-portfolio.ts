import {
  IAccountAllPositionsDetailed,
  Portfolio,
  IPortfolioAssetOrigin,
  PortfolioAsset,
  IPositionsOrigin,
  IPositions,
  ViewMethodsLogic,
} from "../types";
import { DEFAULT_POSITION } from "../config/constantConfig";
import { hasZeroSharesFarmRewards } from "../utils";
import { view_on_near } from "../chains";
import { config_near } from "../config";
const convertAssetArrayToObject = (
  assets: IPortfolioAssetOrigin[]
): { [tokenId: string]: PortfolioAsset } => {
  const result: { [tokenId: string]: PortfolioAsset } = {};
  for (const asset of assets) {
    result[asset.token_id] = {
      apr: asset.apr,
      balance: asset.balance,
      shares: asset.shares,
    };
  }
  return result;
};

const convertPositions = (positionsOrigin: IPositionsOrigin): IPositions => {
  const result: IPositions = {};
  for (const shadowId in positionsOrigin) {
    const position = positionsOrigin[shadowId];
    result[shadowId] = {
      collateral: convertAssetArrayToObject(position.collateral),
      borrowed: convertAssetArrayToObject(position.borrowed),
    };
  }
  return result;
};

/**
 * Convert IAccountAllPositionsDetailed to Portfolio
 * @param accountPositions - Account all positions detailed data
 * @returns Portfolio object with array converted to object structure
 */
export const getPortfolio = (
  accountPositions: IAccountAllPositionsDetailed
) => {
  const supplied = convertAssetArrayToObject(accountPositions.supplied);
  const positions = convertPositions(accountPositions.positions);
  const defaultPosition = positions[DEFAULT_POSITION] || {
    collateral: {},
    borrowed: {},
  };
  const collateral = defaultPosition.collateral;
  const borrowed = defaultPosition.borrowed;
  return {
    supplied,
    collateral,
    borrowed,
    positions,
    farms: accountPositions.farms,
    staking: accountPositions.booster_staking,
    stakings: accountPositions.booster_stakings,
    hasNonFarmedAssets:
      accountPositions.has_non_farmed_assets ||
      hasZeroSharesFarmRewards(accountPositions.farms),
  };
};

export const getAccountAllPositions = async (
  account_id: string
): Promise<IAccountAllPositionsDetailed> => {
  const accountDetailed = (await view_on_near({
    contractId: config_near.LOGIC_CONTRACT_NAME,
    methodName: ViewMethodsLogic[ViewMethodsLogic.get_account_all_positions],
    args: {
      account_id,
    },
  })) as IAccountAllPositionsDetailed;
  return accountDetailed;
};
