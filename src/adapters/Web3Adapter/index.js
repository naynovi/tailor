// @flow
import PromiEvent from 'web3-core-promievent';
import type EventEmitter from 'eventemitter3';
import type {
  EstimateOptions,
  FunctionArguments,
  FunctionCall,
  SignedTransaction,
  SubscriptionOptions,
  TransactionData,
  TransactionReceipt,
} from '../../interface/Adapter';
import type { ContractData } from '../../interface/Loader';
import Adapter from '../Adapter';

export default class Web3Adapter extends Adapter {
  _web3: any;

  _contract: any;

  static get name() {
    return 'web3';
  }

  constructor({ web3 }: { web3: any } = {}) {
    super();
    this._web3 = web3;
  }

  initialize(contractData: ContractData) {
    this._contract = new this._web3.eth.Contract(
      contractData.abi,
      contractData.address,
    );
  }

  encodeDeploy(args: FunctionArguments) {
    return this.contract.deploy({ arguments: args }).encodeABI();
  }

  encodeFunctionCall(functionCall: FunctionCall) {
    if (!this.contract.methods[functionCall.method])
      throw new Error(
        `Method "${functionCall.method}" not defined on this contract`,
      );

    return this.contract.methods[functionCall.method](
      ...functionCall.args,
    ).encodeABI();
  }

  decodeFunctionCallData(functionCallData: TransactionData) {
    const methodSig = functionCallData.slice(0, 10);
    // eslint-disable-next-line no-underscore-dangle
    const methodInterface = this.contract._jsonInterface.find(
      el => el.signature === methodSig,
    );

    if (!methodInterface)
      throw new Error(
        `No method with signature "${methodSig}" defined on this contract`,
      );

    const paramTypes = methodInterface.inputs.map(param => param.type);
    const paramData = `0x${functionCallData.slice(10)}`;
    const paramsResult = this._web3.eth.abi.decodeParameters(
      paramTypes,
      paramData,
    );

    const params = [];
    for (let i = 0; i < paramTypes.length; i += 1) {
      params.push(paramsResult[i]);
    }

    return { method: methodInterface.name, args: params };
  }

  async estimate(options: EstimateOptions) {
    return this._web3.eth.estimateGas(
      Object.assign({}, options, {
        to: options.to || this.contract.options.address,
      }),
    );
  }

  // adapted from https://github.com/ethereum/web3.js/blob/1.0/packages/web3-eth-contract/src/index.js#L836
  _decodeReceipt(receipt: any): TransactionReceipt {
    if (!(receipt.logs && receipt.logs.length)) {
      return receipt;
    }

    const logs = receipt.logs.map(log =>
      // eslint-disable-next-line no-underscore-dangle
      this.contract._decodeEventABI(
        {
          name: 'ALLEVENTS',
          jsonInterface: this.contract.options.jsonInterface,
        },
        log,
      ),
    );

    const decodedReceipt = Object.assign({}, receipt);
    decodedReceipt.events = {};

    let count = 0;
    logs.forEach(log => {
      // anonymous log
      if (!log.event) {
        decodedReceipt.events[count] = log;
        count += 1;
        return;
      }

      // use array if same event emitted multiple times
      if (decodedReceipt.events[log.event]) {
        if (Array.isArray(decodedReceipt.events[log.event])) {
          decodedReceipt.events[log.event].push(log);
        } else {
          decodedReceipt.events[log.event] = [
            decodedReceipt.events[log.event],
            log,
          ];
        }
      } else {
        decodedReceipt.events[log.event] = log;
      }
    });

    return decodedReceipt;
  }

  sendSignedTransaction(transaction: SignedTransaction) {
    const promiEvent = new PromiEvent();
    const txPromiEvent = this._web3.eth.sendSignedTransaction(transaction);

    txPromiEvent.on('transactionHash', hash =>
      promiEvent.eventEmitter.emit('transactionHash', hash),
    );
    txPromiEvent.on('receipt', receipt =>
      promiEvent.eventEmitter.emit('receipt', this._decodeReceipt(receipt)),
    );
    txPromiEvent.on('confirmation', (confirmationNumber, receipt) =>
      promiEvent.eventEmitter.emit(
        'confirmation',
        confirmationNumber,
        this._decodeReceipt(receipt),
      ),
    );
    txPromiEvent.on('error', error =>
      promiEvent.eventEmitter.emit('error', error),
    );

    txPromiEvent.catch(promiEvent.reject);
    txPromiEvent.then(receipt =>
      promiEvent.resolve(this._decodeReceipt(receipt)),
    );

    return promiEvent;
  }

  async call(functionCall: FunctionCall) {
    if (!this.contract.methods[functionCall.method])
      throw new Error(
        `Method "${functionCall.method}" not defined on this contract`,
      );

    const rawResult = await this.contract.methods[functionCall.method](
      ...functionCall.args,
    ).call();

    // convert Result object to array
    const result = [];
    for (let i = 0; i < functionCall.args.length; i += 1) {
      result.push(rawResult[i]);
    }

    return result;
  }

  async subscribe(options: SubscriptionOptions = {}) {
    const contract = this.contract.clone();

    if (options.address) {
      contract.options.address = options.address;
    }

    if (options.event) {
      if (!contract.events[options.event])
        throw new Error(
          `Event "${options.event}" not defined on this contract`,
        );
      return (contract.events[options.event](): EventEmitter);
    }
    return (contract.events.allEvents(): EventEmitter);
  }

  getCurrentNetwork() {
    return this._web3.eth.net.getId();
  }

  get contract() {
    if (this._contract) return this._contract;
    throw new Error('Adapter not initialized! Call `.initialize()` first.');
  }
}