import { STATUS_ERROR_COLOR, STATUS_SUCCESS_COLOR, UI_TEXT, URLS } from './constants.js';

export class DataModalController {
    constructor(elements, store, onImport) {
        this.modal = elements.modal;
        this.content = elements.content;
        this.status = elements.status;
        this.fileInput = elements.fileInput;
        this.exportButton = elements.exportButton;
        this.importButton = elements.importButton;
        this.shareButton = elements.shareButton;
        this.closeButton = elements.closeButton;
        this.floatingButton = elements.floatingButton;
        this.store = store;
        this.onImport = onImport;
    }

    bind() {
        this.modal.addEventListener('click', () => this.close());
        this.content.addEventListener('click', event => event.stopPropagation());
        this.exportButton.addEventListener('click', () => this.exportJson());
        this.importButton.addEventListener('click', () => this.triggerImport());
        this.shareButton.addEventListener('click', () => this.shareTrackerUrl());
        this.closeButton.addEventListener('click', () => this.close());
        this.fileInput.addEventListener('change', event => this.importJson(event));
        this.floatingButton.addEventListener('click', () => this.open());
    }

    open() {
        this.status.textContent = '';
        this.fileInput.value = '';
        this.modal.style.display = 'flex';
    }

    close() {
        this.modal.style.display = 'none';
    }

    setStatus(message, isError = false) {
        this.status.textContent = message;
        this.status.style.color = isError ? STATUS_ERROR_COLOR : STATUS_SUCCESS_COLOR;
    }

    exportJson() {
        try {
            const payload = this.store.exportPayload();
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `totk-tracker-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            this.setStatus(UI_TEXT.exportSuccess);
        } catch (error) {
            console.error(error);
            this.setStatus(UI_TEXT.exportError, true);
        }
    }

    triggerImport() {
        this.fileInput.click();
    }

    importJson(event) {
        const file = event?.target?.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const parsed = JSON.parse(String(reader.result || '{}'));
                this.store.importPayload(parsed);
                await this.onImport();
                this.setStatus(UI_TEXT.importSuccess);
            } catch (error) {
                console.error(error);
                this.setStatus(UI_TEXT.importInvalid, true);
            }
        };

        reader.onerror = () => {
            this.setStatus(UI_TEXT.importReadError, true);
        };

        reader.readAsText(file);
    }

    shareTrackerUrl() {
        try {
            const encoded = btoa(JSON.stringify(this.store.sharePayload()));
            const url = window.location.origin + window.location.pathname + URLS.shareHashPrefix + encodeURIComponent(encoded);
            navigator.clipboard.writeText(url).then(() => {
                this.setStatus(UI_TEXT.shareSuccess);
            }).catch(() => {
                this.setStatus(UI_TEXT.shareFallback + url);
            });
        } catch (error) {
            console.error(error);
            this.setStatus(UI_TEXT.shareError, true);
        }
    }
}
