/* @flow */

import type { ILoader, ContractData, GenericQuery } from '../interface/Loader';
import type { IAdapter } from '../interface/Adapter';
import type { IParser } from '../interface/Parser';
import type { IWallet } from '../interface/Wallet';
import type {
  ConstantSpecs,
  ContractSpec,
  EventSpecs,
  MethodSpecs,
} from '../interface/ContractSpec';
import type { Overrides } from '../interface/Overrides';

import {
  ADAPTER_NAME_MAP,
  LOADER_NAME_MAP,
  PARSER_NAME_MAP,
  WALLET_NAME_MAP,
} from './constants';

export type AdapterName = $Keys<typeof ADAPTER_NAME_MAP>;

export type AdapterSpec = {
  name?: AdapterName,
  options?: Object,
};

export type LoaderName = $Keys<typeof LOADER_NAME_MAP>;

export type LoaderSpec = {
  name?: LoaderName,
  options?: Object,
};

export type ParserName = $Keys<typeof PARSER_NAME_MAP>;

export type ParserSpec = {
  name?: ParserName,
  options?: Object,
};

export type WalletName = $Keys<typeof WALLET_NAME_MAP>;

export type WalletSpec = {
  name?: WalletName,
  options?: Object,
};

export type TailorCreateArgs = {
  adapter?: IAdapter | AdapterSpec,
  contractData?: ContractData,
  loader?: ILoader<*> | LoaderSpec,
  parser?: IParser | ParserSpec,
  query?: GenericQuery,
  wallet?: IWallet | WalletSpec,
} & Overrides;

export type TailorArgs = {
  adapter: IAdapter,
  contractData: ContractData,
  helpers: Object,
  parser: IParser,
  wallet: IWallet,
} & Overrides;

export type {
  ConstantSpecs,
  ContractData,
  ContractSpec,
  EventSpecs,
  GenericQuery,
  IAdapter,
  ILoader,
  IParser,
  IWallet,
  MethodSpecs,
  Overrides,
};
