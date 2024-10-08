<template>
  <a :href="link" class="card">
    <div class="title">{{ title }}</div>
    <div class="divider"></div>
    <p class="description">{{ description }}</p>
  </a>
</template>

<script>
export default {
  name: 'ProjectCard',
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
};
</script>
<style scoped lang="scss">
.card {
  display: block;
  padding: 16px 24px;
  background-color: rgba(183, 183, 183, 0.1);
  text-decoration: none;
  border-radius: 8px;
  transition: transform 0.3s ease;

  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
    text-decoration: none;
    transform: scale(1.05);
  }

  .title {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: var(--vp-c-brand);
  }

  .divider {
    height: 1px;
    margin-bottom: 10px;
    background-color: #dfdfd8;
  }

  .description {
    margin: 0;
    color: var(--vp-c-text-4);
  }
}
</style>
