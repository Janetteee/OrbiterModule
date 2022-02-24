import axios from 'axios'
import { accessLogger, errorLogger } from '../logger'

type Api = { endPoint: string; key: string }
type Transaction = {
  blockNumber: number
  timeStamp: number
  hash: string
  nonce: string
  blockHash: string
  transactionIndex: number
  from: string
  to: string
  value: string
  gas: number
  gasPrice: number
  isError: number
  txreceipt_status: number
  input: string
  contractAddress: string
  cumulativeGasUsed: number
  gasUsed: number
  confirmations: number
}
type Filter = {
  from?: string
  to?: string
}
type TransferCallbacks = {
  onConfirmation?: (transaction: Transaction) => any
  onReceived?: (transaction: Transaction) => any
}

const STARKNET_LISTEN_TRANSFER_DURATION = 5 * 1000

class StarknetListen {
  private api: Api
  private transferReceivedHashs: { [key: string]: boolean }
  private transferConfirmationedHashs: { [key: string]: boolean }
  private transferBreaker?: () => boolean
  private listens: {
    filter: Filter | undefined
    callbacks?: TransferCallbacks
    confirmationsTotal: number
  }[]

  constructor(api: Api) {
    this.api = api

    this.transferReceivedHashs = {}
    this.transferConfirmationedHashs = {}

    this.start()
  }

  start() {
    const ticker = async () => {
      const resp = await axios.get(`${this.api.endPoint}/api/txns?ps=50&p=1`)
      console.warn(resp)
    }

    setInterval(ticker, STARKNET_LISTEN_TRANSFER_DURATION)
  }

  setTransferBreaker(transferBreaker?: () => boolean) {
    this.transferBreaker = transferBreaker
    return this
  }

  transfer(
    filter: Filter | undefined,
    callbacks?: TransferCallbacks,
    confirmationsTotal = 3
  ) {
    this.listens.push({ filter, callbacks, confirmationsTotal })
    // const checkFilter = (from: string, to: string) => {
    //   if (!filter) {
    //     return true
    //   }
    //   if (filter.from && filter.from.toUpperCase() != from.toUpperCase()) {
    //     return false
    //   }
    //   if (filter.to && filter.to.toUpperCase() != to.toUpperCase()) {
    //     return false
    //   }
    //   return true
    // }
    // let isFirstTicker = true
    // const timer = setInterval(() => ticker(), STARKNET_LISTEN_TRANSFER_DURATION)
    // const ticker = async () => {
    //   try {
    //     if (this.transferBreaker && this.transferBreaker() === false) {
    //       clearInterval(timer)
    //       return
    //     }
    //     let startblock = ''
    //     if (this.blockProvider) {
    //       startblock = await this.blockProvider(isFirstTicker)
    //       isFirstTicker = false
    //     }
    //     const resp = await axios.get(this.api.endPoint, {
    //       params: {
    //         apiKey: this.api.key,
    //         module: 'account',
    //         action: 'txlist',
    //         address: this.address,
    //         page: 1,
    //         offset: 100,
    //         startblock,
    //         endblock: 'latest',
    //         sort: 'asc',
    //       },
    //       timeout: 16000,
    //     })
    //     const { data } = resp
    //     if (data.status != '1' || !data.result || data.result.length <= 0) {
    //       return
    //     }
    //     for (const item of data.result) {
    //       if (!checkFilter(item.from, item.to)) {
    //         continue
    //       }
    //       if (this.transferReceivedHashs[item.hash] === undefined) {
    //         this.transferReceivedHashs[item.hash] = true
    //         callbacks &&
    //           callbacks.onReceived &&
    //           callbacks.onReceived(<Transaction>item)
    //       }
    //       if (confirmationsTotal > 0) {
    //         if (
    //           this.transferConfirmationedHashs[item.hash] === undefined &&
    //           item.confirmations >= confirmationsTotal
    //         ) {
    //           this.transferConfirmationedHashs[item.hash] = true
    //           accessLogger.info(
    //             `Transaction [${item.hash}] was confirmed. confirmations: ${item.confirmations}`
    //           )
    //           callbacks &&
    //             callbacks.onConfirmation &&
    //             callbacks.onConfirmation(<Transaction>item)
    //         }
    //       }
    //     }
    //   } catch (error) {
    //     errorLogger.error(
    //       `Eth listen get transfer error: ${error.message}, api.endPoint: ${this.api.endPoint}, address: ${this.address}`
    //     )
    //   }
    // }
    // ticker()
  }
}

const factorys: { [key: string]: StarknetListen } = {}
export function factoryStarknetListen(api: Api) {
  const factoryKey = `${api.endPoint}:${api.key}`
  console.warn({factoryKey});
  return
  

  if (factorys[factoryKey]) {
    return factorys[factoryKey]
  } else {
    return (factorys[factoryKey] = new StarknetListen(api))
  }
}