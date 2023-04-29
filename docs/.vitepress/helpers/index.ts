import { Transaction } from 'everscale-inpage-provider';

export const testContract = {
  address: `0:2cee10f871e1c0e9327489e3d53314ebc57f3638ebd7b7b40e11fd28c75bd282`,
  ABI: {
    'ABI version': 2,
    version: '2.3',
    header: ['time'],
    functions: [
      {
        name: 'constructor',
        inputs: [
          { name: 'someParam', type: 'uint128' },
          { name: 'second', type: 'string' },
        ],
        outputs: [],
      },
      {
        name: 'getComplexState',
        inputs: [],
        outputs: [
          {
            components: [
              { name: 'first', type: 'uint32' },
              { name: 'second', type: 'string' },
            ],
            name: 'value0',
            type: 'tuple',
          },
        ],
      },
      {
        name: 'setVariable',
        inputs: [{ name: 'someParam', type: 'uint128' }],
        outputs: [],
      },
      {
        name: 'setVariableExternal',
        inputs: [{ name: 'someParam', type: 'uint128' }],
        outputs: [],
      },
      {
        name: 'getSecondElementWithPrefix',
        inputs: [{ name: 'prefix', type: 'string' }],
        outputs: [{ name: 'value0', type: 'string' }],
      },
      {
        name: 'computeSmth',
        inputs: [
          { name: 'answerId', type: 'uint32' },
          { name: 'offset', type: 'uint32' },
        ],
        outputs: [
          {
            components: [
              { name: 'first', type: 'uint32' },
              { name: 'second', type: 'string' },
            ],
            name: 'res',
            type: 'tuple',
          },
        ],
      },
      {
        name: 'simpleState',
        inputs: [],
        outputs: [{ name: 'simpleState', type: 'uint128' }],
      },
    ],
    data: [{ key: 1, name: 'nonce', type: 'uint32' }],
    events: [
      {
        name: 'StateChanged',
        inputs: [
          {
            components: [
              { name: 'first', type: 'uint32' },
              { name: 'second', type: 'string' },
            ],
            name: 'complexState',
            type: 'tuple',
          },
        ],
        outputs: [],
      },
    ],
    fields: [
      { name: '_pubkey', type: 'uint256' },
      { name: '_timestamp', type: 'uint64' },
      { name: '_constructorFlag', type: 'bool' },
      { name: 'nonce', type: 'uint32' },
      { name: 'simpleState', type: 'uint128' },
      {
        components: [
          { name: 'first', type: 'uint32' },
          { name: 'second', type: 'string' },
        ],
        name: 'complexState',
        type: 'tuple',
      },
    ],
  } as const,
  base64: `te6ccgECJAEABNsAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBCSK7VMg4wMgwP/jAiDA/uMC8gshBQQjAtztRNDXScMB+GaNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4aSHbPNMAAY4UgwjXGCD4KMjOzsn5AFj4QvkQ8qje0z8B+EMhufK0IPgjgQPoqIIIG3dAoLnytPhj0x8B2zzyPAsGA3rtRNDXScMB+GYi0NMD+kAw+GmpOAD4RH9vcYIImJaAb3Jtb3Nwb3T4ZNwhxwDjAiHXDR/yvCHjAwHbPPI8ICAGAiggghBBPtrLu+MCIIIQcQlrSrvjAg4HAzwgghBnB2AOuuMCIIIQbr9W0rrjAiCCEHEJa0q64wIMCggDcjD4RvLgTPhCbuMA0ds8IY4hI9DTAfpAMDHIz4cgzoIQ8QlrSs8LgQFvIgLLH8zJcPsAkTDi4wDyAB8JHQAE+EwCSDD4Qm7jAPhG8nPTf9TR+AAh+GsBgQPoqQi1HwFvAvhs2zzyAAsRAm7tRNDXScIBjqxw7UTQ9AVxIYBA9A5vkZPXCx/ecCCIbwL4bPhr+GqAQPQO8r3XC//4YnD4Y+MNIx8DKDD4RvLgTPhCbuMA03/R2zzbPPIAHw0RAUL4J28QaKb+YKG1f3L7Ats8+EnIz4WIzoBvz0DJgQCB+wATBFAgghARNw4AuuMCIIIQP+FoFbrjAiCCEEACL3K64wIgghBBPtrLuuMCHBQQDwFQMNHbPPhLIY4cjQRwAAAAAAAAAAAAAAAAME+2suDIzst/yXD7AN7yAB8DKDD4RvLgTPhCbuMA03/R2zzbPPIAHxIRAD74TPhL+Er4Q/hCyMv/yz/Pg8sfy38BbyICyx/Mye1UAQj4ANs8EwBmIPhrgQPoqQi1H/hMAW9QIPhsjQRwAAAAAAAAAAAAAAAAFM5yKWDIzgFvIgLLH8zJcPsAA2gw+Eby4Ez4Qm7jANTR2zwhjhsj0NMB+kAwMcjPhyDOghC/4WgVzwuBzMlw+wCRMOLjAPIAHxUdAQz4TG8R2zwWBDwB2zxY0F8y2zwzM5QgcddGjojVMV8y2zwzM+gw2zwaGRkXASSWIW+IwACzjoYh2zwzzxHoyTEYABxvjW+NWSBviJJvjJEw4gFSIc81pvkh10sgliNwItcxNN4wIbuOjVzXGDMjzjNd2zw0yDPfUxLObDEbATBvAAHQlSDXSsMAjonVAcjOUiDbPDLoyM4bADhREG+Inm+NIG+IhAehlG+MbwDfkm8A4lhvjG+MA/Aw+Eby4Ez4Qm7jANMf+ERYb3X4ZNMf0ds8IY4fI9DTAfpAMDHIz4cgzoIQkTcOAM8LgQFvIgLLH8zJcI40+EQgbxMhbxL4SVUCbxHIz4SAygDPhEDOAfoC9ACAas9A+ERvFc8LHwFvIgLLH8zJ+ERvFOL7AOMA8gAfHh0AKO1E0NP/0z8x+ENYyMv/yz/Oye1UAVoggQPoufLlOfhMbxCgtR9wiG8CAW9Q+ExvEW9RMPhEcG9ygERvdHBvcfhk+EwjAEDtRNDT/9M/0wAx0x/Tf9Mf1FlvAgHR+Gz4a/hq+GP4YgAK+Eby4EwCEPSkIPS98sBOIyIAFHNvbCAwLjY2LjAAAA==`,
  boc: `te6ccgECJAEABVQAAq+ABZ3CHw48OB0mTpE8eqZinXiv5scdevb2gcI/pRjrelBFjS9+hkTHXAAAAGmBdY7yEh23xBWmo7FjLZOuSyzxWmQsy2Iuh1QTrvQw03v4IzLNJK91loBAAwEBgfvlEQAVS8EtkmmQXS+aqup1WIq0Oaj5Ef1aKt620rWnAAABh8qr9wqAABHVgAAAAAAAAAAAAAAAAAAB9AAAAABAAgAIdGVzdAQkiu1TIOMDIMD/4wIgwP7jAvILIQUEIwLc7UTQ10nDAfhmjQhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE+Gkh2zzTAAGOFIMI1xgg+CjIzs7J+QBY+EL5EPKo3tM/AfhDIbnytCD4I4ED6KiCCBt3QKC58rT4Y9MfAds88jwLBgN67UTQ10nDAfhmItDTA/pAMPhpqTgA+ER/b3GCCJiWgG9ybW9zcG90+GTcIccA4wIh1w0f8rwh4wMB2zzyPCAgBgIoIIIQQT7ay7vjAiCCEHEJa0q74wIOBwM8IIIQZwdgDrrjAiCCEG6/VtK64wIgghBxCWtKuuMCDAoIA3Iw+Eby4Ez4Qm7jANHbPCGOISPQ0wH6QDAxyM+HIM6CEPEJa0rPC4EBbyICyx/MyXD7AJEw4uMA8gAfCR0ABPhMAkgw+EJu4wD4RvJz03/U0fgAIfhrAYED6KkItR8BbwL4bNs88gALEQJu7UTQ10nCAY6scO1E0PQFcSGAQPQOb5GT1wsf3nAgiG8C+Gz4a/hqgED0DvK91wv/+GJw+GPjDSMfAygw+Eby4Ez4Qm7jANN/0ds82zzyAB8NEQFC+CdvEGim/mChtX9y+wLbPPhJyM+FiM6Ab89AyYEAgfsAEwRQIIIQETcOALrjAiCCED/haBW64wIgghBAAi9yuuMCIIIQQT7ay7rjAhwUEA8BUDDR2zz4SyGOHI0EcAAAAAAAAAAAAAAAADBPtrLgyM7Lf8lw+wDe8gAfAygw+Eby4Ez4Qm7jANN/0ds82zzyAB8SEQA++Ez4S/hK+EP4QsjL/8s/z4PLH8t/AW8iAssfzMntVAEI+ADbPBMAZiD4a4ED6KkItR/4TAFvUCD4bI0EcAAAAAAAAAAAAAAAABTOcilgyM4BbyICyx/MyXD7AANoMPhG8uBM+EJu4wDU0ds8IY4bI9DTAfpAMDHIz4cgzoIQv+FoFc8LgczJcPsAkTDi4wDyAB8VHQEM+ExvEds8FgQ8Ads8WNBfMts8MzOUIHHXRo6I1TFfMts8MzPoMNs8GhkZFwEkliFviMAAs46GIds8M88R6MkxGAAcb41vjVkgb4iSb4yRMOIBUiHPNab5IddLIJYjcCLXMTTeMCG7jo1c1xgzI84zXds8NMgz31MSzmwxGwEwbwAB0JUg10rDAI6J1QHIzlIg2zwy6MjOGwA4URBviJ5vjSBviIQHoZRvjG8A35JvAOJYb4xvjAPwMPhG8uBM+EJu4wDTH/hEWG91+GTTH9HbPCGOHyPQ0wH6QDAxyM+HIM6CEJE3DgDPC4EBbyICyx/MyXCONPhEIG8TIW8S+ElVAm8RyM+EgMoAz4RAzgH6AvQAgGrPQPhEbxXPCx8BbyICyx/MyfhEbxTi+wDjAPIAHx4dACjtRNDT/9M/MfhDWMjL/8s/zsntVAFaIIED6Lny5Tn4TG8QoLUfcIhvAgFvUPhMbxFvUTD4RHBvcoBEb3Rwb3H4ZPhMIwBA7UTQ0//TP9MAMdMf03/TH9RZbwIB0fhs+Gv4avhj+GIACvhG8uBMAhD0pCD0vfLATiMiABRzb2wgMC42Ni4wAAA=`,
};

// export const getExampleContractAbi = () => {
//   return {
//     'ABI version': 2,
//     version: '2.3',
//     header: ['time'],
//     functions: [
//       {
//         name: 'constructor',
//         inputs: [
//           { name: 'someParam', type: 'uint128' },
//           { name: 'second', type: 'string' },
//         ],
//         outputs: [],
//       },
//       {
//         name: 'setVariable',
//         inputs: [{ name: 'someParam', type: 'uint128' }],
//         outputs: [],
//       },
//       {
//         name: 'computeSmth',
//         inputs: [
//           { name: 'answerId', type: 'uint32' },
//           { name: 'offset', type: 'uint32' },
//         ],
//         outputs: [
//           {
//             components: [
//               { name: 'first', type: 'uint32' },
//               { name: 'second', type: 'string' },
//             ],
//             name: 'res',
//             type: 'tuple',
//           },
//         ],
//       },
//       {
//         name: 'simpleState',
//         inputs: [],
//         outputs: [{ name: 'simpleState', type: 'uint128' }],
//       },
//     ],
//     data: [{ key: 1, name: 'nonce', type: 'uint32' }],
//     events: [
//       {
//         name: 'StateChanged',
//         inputs: [
//           {
//             components: [
//               { name: 'first', type: 'uint32' },
//               { name: 'second', type: 'string' },
//             ],
//             name: 'complexState',
//             type: 'tuple',
//           },
//         ],
//         outputs: [],
//       },
//     ],
//     fields: [
//       { name: '_pubkey', type: 'uint256' },
//       { name: '_timestamp', type: 'uint64' },
//       { name: '_constructorFlag', type: 'bool' },
//       { name: 'nonce', type: 'uint32' },
//       { name: 'simpleState', type: 'uint128' },
//       {
//         components: [
//           { name: 'first', type: 'uint32' },
//           { name: 'second', type: 'string' },
//         ],
//         name: 'complexState',
//         type: 'tuple',
//       },
//     ],
//   } as const;
// };

export const loadBase64FromFile = async (filePath: string) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load file: ${response.statusText}`);
    }
    const text = await response.text();
    return text.split('\n').join('');
  } catch (e) {
    return undefined;
  }
};

export const tryLoadTvcFromFile = async (filePath: string) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load file: ${response.statusText}`);
    }
    return await response.text();
  } catch (e) {
    return undefined;
  }
};

export const toNano = (value: number) => String(value * 1e9);

export const errorExtractor = async <T extends { transaction: Transaction; output?: Record<string, unknown> }>(
  transactionResult: Promise<T>,
): Promise<T> => {
  return transactionResult.then(res => {
    if (res.transaction.aborted) {
      throw {
        message: `Transaction aborted with code ${res.transaction.exitCode}`,
        name: 'TransactionAborted',
        transaction: res,
      };
    }
    return res;
  });
};
