import { Transaction } from 'everscale-inpage-provider';

export const testContract = {
  address: `0:06c404998bb4a6f5cfe465939e3e3562ed573e27f7906355b1a9e1cf61f5ba2e`,
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
        outputs: [{ name: 'value0', type: 'uint32' }],
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
  base64: `te6ccgECJAEABQIAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBCSK7VMg4wMgwP/jAiDA/uMC8gshBQQjAtztRNDXScMB+GaNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4aSHbPNMAAY4UgwjXGCD4KMjOzsn5AFj4QvkQ8qje0z8B+EMhufK0IPgjgQPoqIIIG3dAoLnytPhj0x8B2zzyPAsGA3rtRNDXScMB+GYi0NMD+kAw+GmpOAD4RH9vcYIImJaAb3Jtb3Nwb3T4ZNwhxwDjAiHXDR/yvCHjAwHbPPI8ICAGAiggghBAAi9yu+MCIIIQcQlrSrvjAg0HAzwgghBBPtrLuuMCIIIQbr9W0rrjAiCCEHEJa0q64wIMCggDcjD4RvLgTPhCbuMA0ds8IY4hI9DTAfpAMDHIz4cgzoIQ8QlrSs8LgQFvIgLLH8zJcPsAkTDi4wDyAB8JHQAE+EwCSDD4Qm7jAPhG8nPTf9TR+AAh+GsBgQPoqQi1HwFvAvhs2zzyAAsZAm7tRNDXScIBjqxw7UTQ9AVxIYBA9A5vkZPXCx/ecCCIbwL4bPhr+GqAQPQO8r3XC//4YnD4Y+MNIx8BUDDR2zz4SyGOHI0EcAAAAAAAAAAAAAAAADBPtrLgyM7Lf8lw+wDe8gAfBFAgghARNw4AuuMCIIIQONrQ7LrjAiCCED/haBW64wIgghBAAi9yuuMCHBgQDgMoMPhG8uBM+EJu4wDTf9HbPNs88gAfDxkBCvgA2zwwGwNoMPhG8uBM+EJu4wDU0ds8IY4bI9DTAfpAMDHIz4cgzoIQv+FoFc8LgczJcPsAkTDi4wDyAB8RHQEM+ExvEds8EgQ8Ads8WNBfMts8MzOUIHHXRo6I1TFfMts8MzPoMNs8FhUVEwEkliFviMAAs46GIds8M88R6MkxFAAcb41vjVkgb4iSb4yRMOIBUiHPNab5IddLIJYjcCLXMTTeMCG7jo1c1xgzI84zXds8NMgz31MSzmwxFwEwbwAB0JUg10rDAI6J1QHIzlIg2zwy6MjOFwA4URBviJ5vjSBviIQHoZRvjG8A35JvAOJYb4xvjANsMPhG8uBM+EJu4wDTf9HbPCGOHCPQ0wH6QDAxyM+HIM6CELja0OzPC4HLH8lw+wCRMOLbPPIAHxoZAD74TPhL+Er4Q/hCyMv/yz/Pg8sfy38BbyICyx/Mye1UAUL4J28QaKb+YKG1f3L7Ats8+EnIz4WIzoBvz0DJgQCB+wAbAG4g+GuBA+ipCLUf+EwBb1Ag+GyNBHAAAAAAAAAAAAAAAAAUznIpYMjOAW8iAssfzMlw+wD4TG8QA/Aw+Eby4Ez4Qm7jANMf+ERYb3X4ZNMf0ds8IY4fI9DTAfpAMDHIz4cgzoIQkTcOAM8LgQFvIgLLH8zJcI40+EQgbxMhbxL4SVUCbxHIz4SAygDPhEDOAfoC9ACAas9A+ERvFc8LHwFvIgLLH8zJ+ERvFOL7AOMA8gAfHh0AKO1E0NP/0z8x+ENYyMv/yz/Oye1UAVoggQPoufLlOfhMbxCgtR9wiG8CAW9Q+ExvEW9RMPhEcG9ygERvdHBvcfhk+EwjAEDtRNDT/9M/0wAx0x/Tf9Mf1FlvAgHR+Gz4a/hq+GP4YgAK+Eby4EwCEPSkIPS98sBOIyIAFHNvbCAwLjY2LjAAAA==`,
  boc: `te6ccgECJAEABTQAAm/ABa6sNOewgryrkdU0TOaY1mC6iKaQKSjzR+vis5Uw53fCxpe/QyQJvEgAAEI95RgZCQ63LPjTQAMBAYH75REAFUvBLZJpkF0vmqrqdViKtDmo+RH9WirettK1pwAAAYiYwOcZgAB13wAAAAAAAAAAAAAAAAAAAfQAAAAAQAIACHRlc3QEJIrtUyDjAyDA/+MCIMD+4wLyCyEFBCMC3O1E0NdJwwH4Zo0IYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPhpIds80wABjhSDCNcYIPgoyM7OyfkAWPhC+RDyqN7TPwH4QyG58rQg+COBA+iogggbd0CgufK0+GPTHwHbPPI8CwYDeu1E0NdJwwH4ZiLQ0wP6QDD4aak4APhEf29xggiYloBvcm1vc3BvdPhk3CHHAOMCIdcNH/K8IeMDAds88jwgIAYCKCCCEEE+2su74wIgghBxCWtKu+MCDgcDPCCCEGcHYA664wIgghBuv1bSuuMCIIIQcQlrSrrjAgwKCANyMPhG8uBM+EJu4wDR2zwhjiEj0NMB+kAwMcjPhyDOghDxCWtKzwuBAW8iAssfzMlw+wCRMOLjAPIAHwkdAAT4TAJIMPhCbuMA+Ebyc9N/1NH4ACH4awGBA+ipCLUfAW8C+GzbPPIACxECbu1E0NdJwgGOrHDtRND0BXEhgED0Dm+Rk9cLH95wIIhvAvhs+Gv4aoBA9A7yvdcL//hicPhj4w0jHwMoMPhG8uBM+EJu4wDTf9HbPNs88gAfDREBQvgnbxBopv5gobV/cvsC2zz4ScjPhYjOgG/PQMmBAIH7ABMEUCCCEBE3DgC64wIgghA/4WgVuuMCIIIQQAIvcrrjAiCCEEE+2su64wIcFBAPAVAw0ds8+EshjhyNBHAAAAAAAAAAAAAAAAAwT7ay4MjOy3/JcPsA3vIAHwMoMPhG8uBM+EJu4wDTf9HbPNs88gAfEhEAPvhM+Ev4SvhD+ELIy//LP8+Dyx/LfwFvIgLLH8zJ7VQBCPgA2zwTAGYg+GuBA+ipCLUf+EwBb1Ag+GyNBHAAAAAAAAAAAAAAAAAUznIpYMjOAW8iAssfzMlw+wADaDD4RvLgTPhCbuMA1NHbPCGOGyPQ0wH6QDAxyM+HIM6CEL/haBXPC4HMyXD7AJEw4uMA8gAfFR0BDPhMbxHbPBYEPAHbPFjQXzLbPDMzlCBx10aOiNUxXzLbPDMz6DDbPBoZGRcBJJYhb4jAALOOhiHbPDPPEejJMRgAHG+Nb41ZIG+Ikm+MkTDiAVIhzzWm+SHXSyCWI3Ai1zE03jAhu46NXNcYMyPOM13bPDTIM99TEs5sMRsBMG8AAdCVINdKwwCOidUByM5SINs8MujIzhsAOFEQb4ieb40gb4iEB6GUb4xvAN+SbwDiWG+Mb4wD8DD4RvLgTPhCbuMA0x/4RFhvdfhk0x/R2zwhjh8j0NMB+kAwMcjPhyDOghCRNw4AzwuBAW8iAssfzMlwjjT4RCBvEyFvEvhJVQJvEcjPhIDKAM+EQM4B+gL0AIBqz0D4RG8VzwsfAW8iAssfzMn4RG8U4vsA4wDyAB8eHQAo7UTQ0//TPzH4Q1jIy//LP87J7VQBWiCBA+i58uU5+ExvEKC1H3CIbwIBb1D4TG8Rb1Ew+ERwb3KARG90cG9x+GT4TCMAQO1E0NP/0z/TADHTH9N/0x/UWW8CAdH4bPhr+Gr4Y/hiAAr4RvLgTAIQ9KQg9L3ywE4jIgAUc29sIDAuNjYuMAAA`,
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

export * from './toast';
