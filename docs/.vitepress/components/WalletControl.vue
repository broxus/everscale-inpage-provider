<template>
  <div class="walletControl">
    <button v-if="connected" @click="changeAccount">Change Account</button>
    <button class="disconnectBtn" v-if="connected" @click="disconnect">
      <DisconnectIcon :size="16" />
    </button>
    <button v-else @click="requestPermissions">Connect</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ProviderRpcClient } from 'everscale-inpage-provider';
import DisconnectIcon from './shared/DisconnectIcon.vue';

export default defineComponent({
  name: 'WalletControl',
  async setup() {
    const connected = ref(false);

    const provider = new ProviderRpcClient();
    provider.subscribe('permissionsChanged').then(subscription => {
      subscription.on('data', permissions => {
        console.log('permissionsChanged', permissions);
        connected.value = !!permissions.permissions;
      });
    });

    const providerState = await provider.getProviderState();
    connected.value = !!providerState.permissions;

    return { connected, provider };
  },
  components: {
    DisconnectIcon,
  },
  methods: {
    async requestPermissions() {
      await this.provider.requestPermissions({
        permissions: ['basic', 'accountInteraction'],
      });
    },
    async disconnect() {
      await this.provider.disconnect();
      this.connected = false;
    },
    async changeAccount() {
      await this.provider.changeAccount();
    },
  },
});
</script>

<style scoped>
.walletControl {
  display: flex;
  /* flex-direction: column; */
  align-items: center;
  margin: 1rem 0;
  margin-left: 1rem;
  transition: color 0.5s;
}

.walletControl button {
  background-color: var(--vp-c-bg-mute);
  transition: background-color 0.1s;
  padding: 5px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 0.9em;
  font-weight: 600;
  margin-right: 0.5rem;
}

.disconnectBtn {
  padding: 5px 8px !important;
}
.walletControl button:hover,
.walletControl button:focus {
  outline: none;
  color: var(--vp-c-brand);
  transition: color 0.25s;
  background-color: rgba(var(--vp-c-bg-mute), 0.8);
}
</style>
