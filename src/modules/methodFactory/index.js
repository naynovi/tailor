/* @flow */

import type { MethodSpec } from '../../interface/ContractSpec';
import type Lighthouse from '../../Lighthouse';
import { getTransaction } from '../transactions';

/*
 * Given a specification for a method function, eeturn an async function
 * which can be called with any valid input.
 */
export default function methodFactory(
  lighthouse: Lighthouse,
  { name, input = {}, isPayable, type }: MethodSpec,
) {
  const functionSignatures = Object.keys(input);

  // If input wasn't provided, use the method name (presumed to be the
  // function signature) to produce the function parameters we need.
  const functionParams =
    functionSignatures.length === 0 ? { [name]: [] } : input;

  const { class: Tx, options } = getTransaction(type);

  const fn = Tx.getMethodFn({
    lighthouse,
    functionParams,
    isPayable,
    ...options,
  });

  // Allow each function signature to be called specifically by adding
  // properties to the method function
  functionSignatures.forEach(functionSignature => {
    fn[functionSignature] = Tx.getMethodFn({
      lighthouse,
      functionParams: {
        [functionSignature]: functionParams[functionSignature],
      },
      isPayable,
    });
  });

  return fn;
}
