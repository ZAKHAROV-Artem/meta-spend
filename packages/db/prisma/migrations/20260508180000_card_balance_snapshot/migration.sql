-- Snapshot of MetaMask Card balance text from extension sync (display currency e.g. mUSD).

ALTER TABLE "portfolio_accounts" ADD COLUMN "cardBalanceAmount" DECIMAL(24, 8);
ALTER TABLE "portfolio_accounts" ADD COLUMN "cardBalanceCurrency" TEXT;
