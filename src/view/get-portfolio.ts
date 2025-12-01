import {
  IAccountAllPositionsDetailed,
  Portfolio,
  IPortfolioAssetOrigin,
  PortfolioAsset,
  IPositionsOrigin,
  IPositions,
} from "../types";
import { DEFAULT_POSITION } from "../config/constantConfig";
import { hasZeroSharesFarmRewards } from "../utils";

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
