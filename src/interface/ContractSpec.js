/* @flow */

import type { ParamsSpec } from './Params';

export type MethodSpec = {
  input: ParamsSpec,
  isPayable: boolean,
  name: string,
  output: ParamsSpec,
};

export type EventSpec = {
  name: string,
  output: ParamsSpec,
};

export type ConstantSpec = {
  name: string,
  input: ParamsSpec,
  output: ParamsSpec,
};

export type EventSpecs = {
  [eventName: string]: Array<EventSpec>,
};

export type MethodSpecs = {
  [methodName: string]: Array<MethodSpec>,
};

export type ConstantSpecs = {
  [constantName: string]: Array<ConstantSpec>,
};

export type PartialMethodSpec = {
  input?: ParamsSpec,
  isPayable?: boolean,
  name?: string,
  output?: ParamsSpec,
};

export type PartialEventSpec = {
  name?: string,
  output?: ParamsSpec,
};

export type PartialConstantSpec = {
  name?: string,
  input?: ParamsSpec,
  output?: ParamsSpec,
};

export type PartialEventSpecs = {
  [eventName: string]: Array<PartialEventSpec>,
};

export type PartialMethodSpecs = {
  [methodName: string]: Array<PartialMethodSpec>,
};

export type PartialConstantSpecs = {
  [constantName: string]: Array<PartialConstantSpec>,
};

export type ContractSpec = {
  address: string,
  events: EventSpecs,
  methods: MethodSpecs,
  constants: ConstantSpecs,
};