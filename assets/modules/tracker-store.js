import {
    DEFAULT_QTY,
    IMPORT_ID_SUFFIX_LENGTH,
    RANDOM_ID_LENGTH,
    STORAGE_KEYS,
    URLS
} from './constants.js';

export class TrackerStore {
    constructor(storage = window.localStorage) {
        this.storage = storage;
        this.items = this.readItems();
    }

    static loadFromHash(location = window.location, historyState = window.history, storage = window.localStorage) {
        try {
            const hash = location.hash;
            if (!hash.startsWith(URLS.shareHashPrefix)) {
                return;
            }

            const encoded = decodeURIComponent(hash.slice(URLS.shareHashPrefix.length));
            const parsed = JSON.parse(atob(encoded));
            if (!Array.isArray(parsed.items)) {
                return;
            }

            storage.setItem(STORAGE_KEYS.items, JSON.stringify(parsed.items));
            if (parsed.progress && typeof parsed.progress === 'object') {
                storage.setItem(STORAGE_KEYS.progress, JSON.stringify(parsed.progress));
            }

            historyState.replaceState(null, '', location.pathname + location.search);
        } catch (_) {}
    }

    static randomSuffix(length) {
        return Math.random().toString(36).slice(2, 2 + length);
    }

    static createItemId() {
        return `${Date.now()}${TrackerStore.randomSuffix(RANDOM_ID_LENGTH)}`;
    }

    static createImportedItemId(index) {
        return `${Date.now()}-${index}-${TrackerStore.randomSuffix(IMPORT_ID_SUFFIX_LENGTH)}`;
    }

    readItems() {
        const parsed = JSON.parse(this.storage.getItem(STORAGE_KEYS.items) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    }

    getItems() {
        return this.items;
    }

    saveItems() {
        this.storage.setItem(STORAGE_KEYS.items, JSON.stringify(this.items));
    }

    getProgress() {
        const parsed = JSON.parse(this.storage.getItem(STORAGE_KEYS.progress) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    }

    saveProgress(progress) {
        this.storage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
    }

    applyTranslations(translations) {
        let hasChanges = false;

        this.items = this.items.map(item => {
            if (!item || !item.name || item.displayName) {
                return item;
            }

            hasChanges = true;
            return {
                ...item,
                displayName: translations[item.name] || item.name
            };
        });

        if (hasChanges) {
            this.saveItems();
        }

        return hasChanges;
    }

    addItem(name, displayName, qty) {
        const existingItem = this.items.find(item => item.name === name);

        if (existingItem) {
            existingItem.qty = (parseInt(existingItem.qty, 10) || 0) + qty;
            existingItem.displayName = existingItem.displayName || displayName;
        } else {
            this.items.push({
                id: TrackerStore.createItemId(),
                name,
                displayName,
                qty
            });
        }

        this.saveItems();
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.saveItems();
    }

    toggleProgress(id) {
        const progress = this.getProgress();
        progress[id] = !progress[id];
        this.saveProgress(progress);
        return progress[id];
    }

    exportPayload() {
        return {
            version: 1,
            exportedAt: new Date().toISOString(),
            items: this.items,
            progress: this.getProgress()
        };
    }

    sharePayload() {
        return {
            items: this.items,
            progress: this.getProgress()
        };
    }

    importPayload(parsed) {
        const incomingItems = Array.isArray(parsed.items) ? parsed.items : [];
        const incomingProgress = parsed.progress && typeof parsed.progress === 'object' ? parsed.progress : {};

        this.items = incomingItems
            .filter(item => item && typeof item.name === 'string')
            .map((item, index) => {
                const safeQty = Math.max(DEFAULT_QTY, parseInt(item.qty, 10) || DEFAULT_QTY);
                const safeId = typeof item.id === 'string' && item.id.trim() !== ''
                    ? item.id
                    : TrackerStore.createImportedItemId(index);

                return {
                    id: safeId,
                    name: item.name,
                    displayName: typeof item.displayName === 'string' ? item.displayName : item.name,
                    qty: safeQty
                };
            });

        this.saveItems();
        this.saveProgress(incomingProgress);
    }
}
