import { TrackerApp } from './modules/tracker-app.js';
import { TrackerStore } from './modules/tracker-store.js';

TrackerStore.loadFromHash();

const app = new TrackerApp();
app.init();
