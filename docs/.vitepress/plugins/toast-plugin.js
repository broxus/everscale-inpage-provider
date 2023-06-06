import { createApp } from 'vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const toast = createApp(Toast);

export default {
  install(app) {
    app.provide('toast', toast);
  },
};
