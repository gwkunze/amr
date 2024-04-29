import './index.css';
import 'primevue/resources/themes/md-dark-deeppurple/theme.css';
import { createApp } from "vue";
import PrimeVue from 'primevue/config';
import Selector from "./components/Selector.vue";
import Tooltip from 'primevue/tooltip';

const app = createApp(Selector);
app.use(PrimeVue);
app.directive('tooltip', Tooltip);
app.mount('#app');
