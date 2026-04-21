import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EtherscanTx {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  isError?: string;
  txreceipt_status?: string;
}

export interface EtherscanTokenTx extends EtherscanTx {
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
}

interface EtherscanResponse<T> {
  status: string;
  message: string;
  result: T[] | string;
}

const ETHERSCAN_V2_BASE_URL = 'https://api.etherscan.io/v2/api';
const SUPPORTED_CHAIN_IDS = new Set([1, 10, 137, 42161, 8453, 59144]);
const RETRY_DELAYS_MS = [250, 700, 1500];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class EtherscanService {
  private readonly logger = new Logger(EtherscanService.name);

  constructor(private readonly configService: ConfigService) {}

  fetchNormalTxs(address: string, chainId: number, startBlock?: bigint): Promise<EtherscanTx[]> {
    return this.fetchTransactions<EtherscanTx>('txlist', address, chainId, startBlock);
  }

  fetchTokenTxs(address: string, chainId: number, startBlock?: bigint): Promise<EtherscanTokenTx[]> {
    return this.fetchTransactions<EtherscanTokenTx>('tokentx', address, chainId, startBlock);
  }

  private async fetchTransactions<T extends EtherscanTx>(
    action: 'txlist' | 'tokentx',
    address: string,
    chainId: number,
    startBlock?: bigint,
  ): Promise<T[]> {
    if (!SUPPORTED_CHAIN_IDS.has(chainId)) {
      throw new InternalServerErrorException(`Unsupported chainId ${chainId}`);
    }

    const params = new URLSearchParams({
      chainid: String(chainId),
      module: 'account',
      action,
      address,
      page: '1',
      offset: '10000',
      sort: 'asc',
      startblock: String(startBlock ?? 0n),
    });

    const apiKey = this.configService.get<string>('etherscan.apiKey');
    if (apiKey) {
      params.set('apikey', apiKey);
    }

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
      const res = await fetch(`${ETHERSCAN_V2_BASE_URL}?${params.toString()}`);
      if (!res.ok) {
        throw new InternalServerErrorException(`Etherscan request failed with status ${res.status}`);
      }

      const data = (await res.json()) as EtherscanResponse<T>;
      if (data.status === '1') {
        return Array.isArray(data.result) ? data.result : [];
      }

      const message = `${data.message} ${typeof data.result === 'string' ? data.result : ''}`.trim().toLowerCase();
      if (message.includes('no transactions found')) {
        return [];
      }

      // Etherscan free keys can reject some chains (e.g. OP/Base) entirely.
      // Skip those chains instead of failing the whole sync pass.
      if (message.includes('free api access is not supported for this chain')) {
        this.logger.warn(
          `Skipping chain ${chainId} for ${action}: requires paid Etherscan plan for this network.`,
        );
        return [];
      }

      const isRateLimited = message.includes('max calls per sec rate limit reached') || message.includes('rate limit');
      if (isRateLimited && attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]!);
        continue;
      }

      throw new InternalServerErrorException(
        `Etherscan API error for chain ${chainId}: ${typeof data.result === 'string' ? data.result : data.message}`,
      );
    }

    return [];
  }
}
