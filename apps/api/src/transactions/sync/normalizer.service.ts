import { Injectable } from '@nestjs/common';
import { TxType } from '@crypto-tracker/db';
import { EtherscanTokenTx, EtherscanTx } from './etherscan.service';

const UNISWAP_ROUTERS = new Set([
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
  '0xe592427a0aece92de3edee1f18e0157c05861564',
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
]);

const BRIDGE_CONTRACTS = new Set([
  '0x99c9fc46f92e8a1c0dec1b1747d010903e884be1',
  '0x3154cf16ccdb4c6d922629664174b904d80f2c35',
  '0x4200000000000000000000000000000000000010',
  '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b',
]);

function hasTokenConversion(tokenTxs: EtherscanTokenTx[], walletAddress: string): boolean {
  const wallet = walletAddress.toLowerCase();
  const sentContracts = new Set<string>();
  const receivedContracts = new Set<string>();

  for (const tokenTx of tokenTxs) {
    const contract = tokenTx.contractAddress?.toLowerCase();
    if (!contract) continue;

    if (tokenTx.from.toLowerCase() === wallet) {
      sentContracts.add(contract);
    }
    if (tokenTx.to.toLowerCase() === wallet) {
      receivedContracts.add(contract);
    }
  }

  if (sentContracts.size === 0 || receivedContracts.size === 0) {
    return false;
  }

  for (const contract of sentContracts) {
    if (!receivedContracts.has(contract)) {
      return true;
    }
  }

  for (const contract of receivedContracts) {
    if (!sentContracts.has(contract)) {
      return true;
    }
  }

  return false;
}

@Injectable()
export class NormalizerService {
  classify(tx: EtherscanTx, walletAddress: string, tokenTxs: EtherscanTokenTx[]): TxType {
    const wallet = walletAddress.toLowerCase();
    const from = tx.from.toLowerCase();
    const to = tx.to.toLowerCase();
    const tokenSent = tokenTxs.some((tokenTx) => tokenTx.from.toLowerCase() === wallet);
    const tokenReceived = tokenTxs.some((tokenTx) => tokenTx.to.toLowerCase() === wallet);

    // Contract-initiated transfers (e.g. MetaMask Card / Baanx `transferFrom`)
    // never have the wallet as the outer tx sender or recipient. Fall back to
    // the emitted ERC-20 Transfer events to classify these correctly.
    if (from !== wallet && to !== wallet) {
      if (tokenSent && tokenReceived) {
        return TxType.TRANSFER_SELF;
      }
      if (tokenSent) {
        return TxType.TRANSFER_OUT;
      }
      if (tokenReceived) {
        return TxType.TRANSFER_IN;
      }
    }

    if (UNISWAP_ROUTERS.has(to)) {
      return TxType.SWAP;
    }

    if (BRIDGE_CONTRACTS.has(to)) {
      return TxType.BRIDGE;
    }

    if (hasTokenConversion(tokenTxs, wallet)) {
      return TxType.SWAP;
    }

    if (tokenTxs.length > 0) {
      if (tokenSent && tokenReceived) {
        return TxType.TRANSFER_SELF;
      }

      if (tokenSent) {
        return TxType.TRANSFER_OUT;
      }

      if (tokenReceived) {
        return TxType.TRANSFER_IN;
      }
    }

    if ((from === wallet && to === wallet) || (tx.from === tx.to && from === wallet)) {
      return TxType.TRANSFER_SELF;
    }

    if (from === wallet) {
      if (tx.value === '0' && tx.input === '0x') {
        return TxType.GAS_ONLY;
      }
      return TxType.TRANSFER_OUT;
    }

    if (to === wallet) {
      return TxType.TRANSFER_IN;
    }

    if (tx.value === '0' && tx.input !== '0x') {
      return TxType.CONTRACT_INTERACTION;
    }

    return TxType.UNKNOWN;
  }
}
