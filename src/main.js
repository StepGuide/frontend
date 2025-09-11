import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// TTS 플러그인 import 추가
import TTSPlugin from './plugins/tts';

const app = createApp(App);

app.use(createPinia());
app.use(router);
// TTS 플러그인 등록 추가
app.use(TTSPlugin);

app.mount('#app');
