# @rhea-finance/cross-chain-sdk

Cross-chain lending SDK that supports unified lending operations across multiple blockchains, including EVM chains, Solana, Bitcoin, and NEAR.

## Features

- 🔗 **Cross-chain Support**: Supports multi-chain operations on EVM, Solana, Bitcoin, and NEAR
- 💰 **Lending Functions**: Provides complete lending functionality including Supply, Borrow, Repay, Withdraw, etc.
- 📊 **Data Queries**: Supports querying asset information, portfolio, prices, balances, and other data
- 🏥 **Health Factor**: Automatically calculates and manages lending health factors
- 💼 **Multi-chain Account (MCA)**: Supports creating and managing multi-chain accounts to unify multi-chain asset management
- 🔐 **Wallet Management**: Supports adding and removing multi-chain wallets
- 📈 **Liquidity Mining**: Supports liquidity mining and reward queries
- ⚡ **Batch Queries**: Provides batch view queries to reduce RPC call frequency

## Supported Blockchains

- **EVM Chains**: Ethereum, Arbitrum, Optimism, Base, Avalanche, BNB Chain, etc.
- **Solana**
- **Bitcoin**
- **NEAR Protocol**

## Installation

```bash
npm install @rhea-finance/cross-chain-sdk
# or
pnpm add @rhea-finance/cross-chain-sdk
# or
yarn add @rhea-finance/cross-chain-sdk
```

## Quick Start

### Basic Usage

```typescript
import {
  batchViews,
  getPortfolio,
  getAssets,
  getPrices,
  config_near,
  IChain,
} from "@rhea-finance/cross-chain-sdk";

// Query batch view data
const lendingData = await batchViews(accountId);
console.log(lendingData.account_all_positions);
console.log(lendingData.assets_paged_detailed);
console.log(lendingData.config);

// Get portfolio
const portfolio = getPortfolio(accountPositions);
console.log(portfolio.supplied);
console.log(portfolio.collateral);
console.log(portfolio.borrowed);
```

### Create Multi-chain Account (MCA)

```typescript
import {
  getCreateMcaCustomRecipientMsg,
  format_wallet,
  intentsQuotation,
  IChain,
} from "@rhea-finance/cross-chain-sdk";

// 1. Prepare wallet list
const wallets = chains.map((chain) => format_wallet({ chain, identityKey }));

// 2. Sign the wallet list
const signedMessages = await Promise.all(
  wallets.map((wallet) => sign_message({ chain, message: wallets }))
);

// 3. Get deposit address
const customRecipientMsg = getCreateMcaCustomRecipientMsg({
  useAsCollateral: true,
  wallets,
  signedMessages,
});

const quoteResult = await intentsQuotation({
  recipient: config_near.AM_CONTRACT,
  customRecipientMsg,
  // ... other parameters
});

// 4. Transfer to depositAddress
const depositAddress = quoteResult.quoteSuccessResult?.quote?.depositAddress;
```

### Cross-chain Supply

```typescript
import {
  getSupplyCustomRecipientMsg,
  format_wallet,
  intentsQuotation,
  config_near,
} from "@rhea-finance/cross-chain-sdk";

const wallet = format_wallet({ chain: "evm", identityKey });
const customRecipientMsg = getSupplyCustomRecipientMsg({
  useAsCollateral: true,
  w: wallet,
});

const quoteResult = await intentsQuotation({
  recipient: config_near.AM_CONTRACT, // or mca account address
  customRecipientMsg,
  // ... other parameters
});

// Transfer to depositAddress
const depositAddress = quoteResult.quoteSuccessResult?.quote?.depositAddress;
```

### Cross-chain Borrow

```typescript
import {
  prepareBusinessDataOnBorrow,
  postMultichainLendingRequests,
  pollingRelayerTransactionResult,
  format_wallet,
  serializationObj,
  NDeposit,
} from "@rhea-finance/cross-chain-sdk";

// Prepare borrow business data
const { businessMap, quoteResult } = await prepareBusinessDataOnBorrow({
  mca,
  recipient: outChainAccountId,
  tokenId,
  originAsset: nearChainAsset,
  destinationAsset: outChainAsset,
  amountBurrow,
  amountToken,
  config,
  simpleWithdrawData,
});

const wallet = format_wallet({ chain, identityKey });
const signedBusiness = await sign_message({
  chain,
  message: serializationObj(businessMap),
});

// Submit multi-chain lending request
const relayer_result = await postMultichainLendingRequests({
  mca_id: mca,
  wallet: serializationObj(wallet),
  request: [
    serializationObj({
      signer_wallet: wallet,
      business: businessMap,
      signature: signedBusiness,
      attach_deposit: NDeposit(TOKEN_STORAGE_DEPOSIT_READ),
    }),
  ],
});

// Poll transaction result
if (relayer_result?.code == 0) {
  const { status, tx_hash } = await pollingRelayerTransactionResult(
    relayer_result.data,
    2000
  );
  console.log("Transaction status:", status);
  console.log("Transaction hash:", tx_hash);
}
```

## Core API

### Actions

#### Account Management

- `createMca` - Create multi-chain account
- `addWallet` - Add wallet to MCA
- `removeWallet` - Remove wallet from MCA

#### Lending Operations

- `supply` - Supply (deposit)
- `borrow` - Borrow
- `repay` - Repay
- `repayFromSupplied` - Repay from supplied assets
- `withdraw` - Withdraw
- `adjust` - Adjust collateral
- `innnerWithdraw` - Inner withdraw
- `claim` - Claim rewards

### Views

- `batchViews` - Batch query views (account, assets, config, etc.)
- `getPortfolio` - Get portfolio
- `getAssets` - Get asset list
- `getPrices` - Get price information
- `getBalance` - Get balance
- `getFarms` - Get liquidity mining information
- `getConfig` - Get configuration
- `getBoosterTokens` - Get booster token information
- `getTokenDetail` - Get token details
- `getLiquidations` - Get liquidation information
- `getMultichainLendingHistory` - Get multi-chain lending history

### Utility Functions

#### Health Factor Calculation

- `recomputeHealthFactorSupply` - Calculate health factor after supply
- `recomputeHealthFactorBorrow` - Calculate health factor after borrow
- `recomputeHealthFactorRepay` - Calculate health factor after repay
- `recomputeHealthFactorWithdraw` - Calculate health factor after withdraw
- `recomputeHealthFactorAdjust` - Calculate health factor after adjusting collateral

#### Maximum Available Amount

- `getBorrowMaxAmount` - Get maximum borrowable amount
- `getWithdrawMaxAmount` - Get maximum withdrawable amount

#### Other Utilities

- `intentsQuotation` - Get cross-chain intent quotation
- `format_wallet` - Format wallet address
- `serializationObj` - Serialize object
- `computeRelayerGas` - Calculate relayer gas fee
- `pollingTransactionStatus` - Poll transaction status
- `postMultichainLendingRequests` - Submit multi-chain lending request
- `pollingRelayerTransactionResult` - Poll relayer transaction result
- `prepareBusinessDataOnBorrow` - Prepare borrow business data
- `getCreateMcaCustomRecipientMsg` - Get custom recipient message for creating MCA
- `getSupplyCustomRecipientMsg` - Get custom recipient message for supply
- `getRepayCustomRecipientMsg` - Get custom recipient message for repay

### Chain Interaction

- `view_on_near` - Call NEAR contract view method
- `getAccountBalance` - Get NEAR account balance

### Chain Configuration

- `config_near` - NEAR chain configuration
- `config_evm` - EVM chain configuration
- `config_solana` - Solana chain configuration
- `config_btc` - Bitcoin chain configuration

### Type Definitions

```typescript
// Chain type
type IChain = "evm" | "solana" | "btc";

// Wallet type
type IWallet = { EVM: string } | { Solana: string } | { Bitcoin: string };

// Business data
interface IBusiness {
  nonce: string;
  deadline: string;
  tx_requests: ITxRequest[];
}

// Account positions detailed
interface IAccountAllPositionsDetailed {
  supplied: IPortfolioAssetOrigin[];
  positions: IPositionsOrigin;
  farms: IFarm[];
  booster_staking: IBoosterStaking;
  booster_stakings: IBoosterStaking[];
  has_non_farmed_assets: boolean;
}

// Portfolio
interface Portfolio {
  supplied: { [tokenId: string]: PortfolioAsset };
  collateral: { [tokenId: string]: PortfolioAsset };
  borrowed: { [tokenId: string]: PortfolioAsset };
  positions: IPositions;
  farms: IFarm[];
  staking: IBoosterStaking;
  stakings: IBoosterStaking[];
  hasNonFarmedAssets: boolean;
}
```

## Usage Examples

Check out the [cross-chain-demo](./../cross-chain-demo) project for more complete usage examples.

### Example 1: Query Account Data

```typescript
import { batchViews, getPortfolio } from "@rhea-finance/cross-chain-sdk";

async function fetchAccountData(mcaId: string) {
  // Batch query
  const lendingData = await batchViews(mcaId);
  
  // Convert to portfolio format
  const portfolio = getPortfolio(lendingData.account_all_positions);
  
  return {
    assets: lendingData.assets_paged_detailed,
    config: lendingData.config,
    portfolio,
  };
}
```

### Example 2: Cross-chain Supply (from EVM to NEAR)

```typescript
import {
  getSupplyCustomRecipientMsg,
  format_wallet,
  intentsQuotation,
  config_near,
} from "@rhea-finance/cross-chain-sdk";

async function supplyFromEVM(
  mca: string,
  chain: IChain,
  identityKey: string,
  amount: string,
  symbol: string
) {
  const wallet = format_wallet({ chain, identityKey });
  const customRecipientMsg = getSupplyCustomRecipientMsg({
    useAsCollateral: true,
    w: wallet,
  });

  const quoteResult = await intentsQuotation({
    recipient: mca || config_near.AM_CONTRACT,
    customRecipientMsg,
    // ... other required parameters
  });

  const depositAddress = quoteResult.quoteSuccessResult?.quote?.depositAddress;
  
  // Execute transfer to depositAddress
  // ...
}
```

### Example 3: Calculate Health Factor

```typescript
import {
  recomputeHealthFactorBorrow,
  IAccountAllPositionsDetailed,
} from "@rhea-finance/cross-chain-sdk";

function checkBorrowSafety(
  accountPositions: IAccountAllPositionsDetailed,
  borrowAmount: string,
  tokenId: string,
  assets: Assets
) {
  const newHealthFactor = recomputeHealthFactorBorrow({
    account_all_positions: accountPositions,
    borrow_amount: borrowAmount,
    token_id: tokenId,
    assets,
  });

  if (newHealthFactor < 1.0) {
    throw new Error("Borrow would cause liquidation");
  }

  return newHealthFactor;
}
```

## Development

### Build

```bash
pnpm build
```

### Development Mode (watch file changes)

```bash
pnpm dev
```

### Type Check

```bash
pnpm type-check
```

### Code Formatting

```bash
pnpm prettier:fix
```

## Dependencies

Main dependencies include:

- `ethers` - EVM chain interaction
- `@solana/web3.js` - Solana chain interaction
- `near-api-js` - NEAR chain interaction
- `btc-wallet` - Bitcoin wallet support
- `bignumber.js` / `big.js` / `decimal.js` - Big number calculations
- `lodash` - Utility functions

## License

MIT

## Related Links

- Demo Project: [cross-chain-demo](./../cross-chain-demo)
- Rhea Finance: https://rhea.finance

## Contributing

Issues and Pull Requests are welcome!
