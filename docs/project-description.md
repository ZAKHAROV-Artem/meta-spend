Idea: Crypto Expense Tracker (MetaMask-based)

I want to build a web app that connects to a user’s crypto wallet (starting with MetaMask) and turns raw blockchain transactions into something actually usable — like a normal finance app.

Right now, crypto wallets show transactions, but they’re unreadable for real-life usage. You can’t easily understand what you spent money on, how much you spend per category, or track your lifestyle like you would with a banking app.

This product solves that by transforming on-chain activity into structured financial data.

Core Concept
Connect wallet (MetaMask)
Fetch all transactions (multi-chain later)
Normalize and interpret them
Categorize them (automatically + manually)
Show clean reports and analytics

Basically:
“Turn crypto activity into a normal expense tracking experience.”

Main Features

1. Wallet Connection
   Connect via MetaMask (EVM wallets)
   Support multiple wallets per user (later)
   Detect network (Ethereum, Polygon, etc.)
2. Transaction Aggregation
   Fetch full transaction history via indexers (Etherscan, etc.)
   Include:
   native transfers
   ERC-20 transfers
   internal transactions
   contract interactions
   Normalize all transactions into a single format
3. Smart Categorization

Automatically classify transactions into:

Expenses (payments to others)
Transfers (own wallets)
Swaps (DEX activity)
Bridge transactions
Exchange deposits/withdrawals
Gas fees

Then allow:

manual category override
persistent rules (e.g. “this address = food”) 4. Address & Contract Labeling
Save labels for addresses (e.g. “Binance”, “Friend”, “Subscription”)
Detect known protocols (Uniswap, etc.)
Group repeated interactions 5. Expense Tracking (Core Value)
Show actual “spending”, not just transactions
Filter:
by category
by token
by date
Aggregate spending over time 6. Fiat Conversion
Convert all transactions into fiat (USD / PLN)
Use historical price at time of transaction
Show:
total spent
category breakdown
trends 7. Analytics & Reports
Monthly spending reports
Category breakdown (like banking apps)
Charts:
spending over time
token usage
biggest expenses 8. Rules Engine (Light Automation)
Define rules like:
“If address = X → category = Y”
“If token = USDT → mark as payment”
Apply rules automatically to future transactions 9. Manual Control (Important)
Edit any transaction
Override category
Merge/split transactions if needed 10. Multi-Chain Support (Later)
Ethereum
Polygon
Arbitrum
Base, etc.
Optional / Advanced Features
AI-based categorization (based on transaction patterns)
Detect subscriptions (recurring payments)
Budgeting (monthly limits per category)
Export (CSV / tax tools)
Mobile-friendly UI
Notifications (e.g. “you spent $500 this week”)
Tech Direction (High-Level)
Frontend: React / Next.js
Wallet connection: wagmi / viem (MetaMask)
Backend: Node.js (API layer)
Data source: Etherscan / other indexers
DB: Postgres
Price data: external API (historical prices)
Key Insight

Crypto data is public, but not usable.
This product adds a semantic layer on top of blockchain activity.

Positioning

Not a portfolio tracker.
Not a wallet.

👉 It’s a crypto-native expense tracker, like:

bank apps
but for Web3
