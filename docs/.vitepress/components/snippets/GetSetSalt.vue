<template>
  <div class="demo">
    <div>
      <label for="code">Code:</label>
      <input id="code" type="text" v-model="base64" />
    </div>
    <div>
      <label for="salt">Salt:</label>
      <input id="salt" type="text" v-model="salt" />
    </div>
    <button @click="setCodeSalt">Set Code Salt</button>
    <button @click="getCodeSalt">Get Code Salt</button>

    <pre v-if="saltedCode">Salted Code: {{ saltedCode }}</pre>
    <pre v-if="hash">Salted Code Hash: {{ hash }}</pre>
    <pre v-if="retrievedSalt">Retrieved Code Salt: {{ retrievedSalt }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ProviderRpcClient } from 'everscale-inpage-provider';

import { testContract } from '../../helpers';

const provider = new ProviderRpcClient();

export default defineComponent({
  setup() {
    const base64 = ref(testContract.base64);
    const salt = ref(testContract.base64);
    const saltedCode = ref('');
    const hash = ref('');
    const retrievedSalt = ref('');

    return { base64, salt, saltedCode, hash, retrievedSalt };
  },

  methods: {
    async setCodeSalt() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: [`basic`] });
      const ABI = [{ name: 's', type: 'string' }] as const;
      const saltParams = { structure: ABI, data: { s: 'vasya' } };
      const { boc } = await provider.packIntoCell(saltParams);
      const tvc = await provider.codeToTvc(testContract.base64);
      const { code, hash } = await provider.setCodeSalt({
        code: tvc,
        salt: boc,
      });
      this.saltedCode = code;
      this.hash = hash;
    },

    async getCodeSalt() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: [`basic`] });

      const codeSalt = await provider.getCodeSalt({ code: testContract.boc });
      this.retrievedSalt = codeSalt;
    },
  },
});
</script>
