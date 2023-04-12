<template>
  <section class="accessor-container">
    <h3 class="name">{{ accessorData.name.toLowerCase() }}</h3>
    <code class="code-block">• get {{ accessorData.name }}(): <code v-html="accessorData.type"></code></code>
    <p v-if="accessorData.comment">{{ accessorData.comment }}</p>
    <div v-if="accessorData.returnComment" class="return-table">
      <h6>Returns</h6>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-html="accessorData.returnType"></td>
            <td>{{ accessorData.returnComment }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <DefinedInLink :definedIn="accessorData.definedIn" :definedInUrl="accessorData.definedInUrl" />
  </section>
</template>

<script>
import DefinedInLink from './../../shared/DefinedInLink.vue';

export default {
  name: 'AccessorComponent',
  props: {
    accessorData: {
      type: Object,
      required: true,
    },
  },
  components: {
    DefinedInLink,
  },
};
</script>

<style scoped>
/* .accessor {
  margin-bottom: 1.5rem;
} */
.accessor-container {
  border-bottom: 1px solid rgba(82, 82, 89, 0.32);
  padding-top: 0.75rem;
}
.accessor-container .name {
  margin-top: 0;
  margin-bottom: 0.5rem;
}
.accessor-container:last-child {
  border-bottom: none;
}
.code-block {
  margin: 0.7rem 0;
}
</style>
