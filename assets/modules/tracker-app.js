import {
    API_ROUTES,
    DOM_IDS,
    DOM_SELECTORS,
    HIDE_SUGGESTIONS_DELAY_MS,
    MIN_SEARCH_LENGTH,
    UI_TEXT
} from './constants.js';
import { DataModalController } from './data-modal-controller.js';
import { ItemDetailsModal } from './item-details-modal.js';
import { SearchPanel } from './search-panel.js';
import { renderTrackerItemRow } from './templates.js';
import { TrackerStore } from './tracker-store.js';

export class TrackerApp {
    constructor(doc = document) {
        this.document = doc;
        this.elements = {
            searchInput: doc.getElementById(DOM_IDS.searchInput),
            searchResults: doc.getElementById(DOM_IDS.searchResults),
            trackerList: doc.getElementById(DOM_IDS.trackerList),
            itemModal: doc.getElementById(DOM_IDS.itemModal),
            itemModalBody: doc.getElementById(DOM_IDS.itemModalBody),
            itemModalCloseButton: doc.getElementById(DOM_IDS.itemModalCloseButton),
            dataModal: doc.getElementById(DOM_IDS.dataModal),
            dataModalContent: doc.querySelector(DOM_SELECTORS.dataModalContent),
            dataModalStatus: doc.getElementById(DOM_IDS.dataModalStatus),
            importInput: doc.getElementById(DOM_IDS.importInput),
            exportButton: doc.getElementById(DOM_IDS.exportButton),
            importButton: doc.getElementById(DOM_IDS.importButton),
            shareButton: doc.getElementById(DOM_IDS.shareButton),
            dataModalCloseButton: doc.getElementById(DOM_IDS.dataModalCloseButton),
            floatingButton: doc.querySelector(DOM_SELECTORS.floatingButton)
        };

        this.store = new TrackerStore();
        this.searchPanel = new SearchPanel(this.elements.searchResults);
        this.itemModal = new ItemDetailsModal(
            this.elements.itemModal,
            this.elements.itemModalBody,
            this.elements.itemModalCloseButton
        );
        this.dataModal = new DataModalController({
            modal: this.elements.dataModal,
            content: this.elements.dataModalContent,
            status: this.elements.dataModalStatus,
            fileInput: this.elements.importInput,
            exportButton: this.elements.exportButton,
            importButton: this.elements.importButton,
            shareButton: this.elements.shareButton,
            closeButton: this.elements.dataModalCloseButton,
            floatingButton: this.elements.floatingButton
        }, this.store, async () => {
            this.renderTracker();
            await this.hydrateStoredItems();
        });
    }

    init() {
        this.bindEvents();
        this.itemModal.bind();
        this.dataModal.bind();
        this.renderTracker();
        this.hydrateStoredItems();
    }

    bindEvents() {
        this.elements.searchInput.addEventListener('input', event => this.searchItems(event.target.value));
        this.elements.searchInput.addEventListener('blur', event => this.hideSuggestions(event));

        this.elements.trackerList.addEventListener('change', event => {
            const checkbox = event.target.closest(DOM_SELECTORS.trackerCheckbox);
            if (checkbox) {
                this.toggleProgress(checkbox.dataset.id);
            }
        });

        this.elements.trackerList.addEventListener('click', event => {
            const info = event.target.closest(DOM_SELECTORS.itemInfo);
            if (info) {
                this.itemModal.open(decodeURIComponent(info.dataset.name));
                return;
            }

            const deleteButton = event.target.closest(DOM_SELECTORS.deleteButton);
            if (deleteButton) {
                this.removeItem(parseInt(deleteButton.dataset.index, 10));
            }
        });

        this.elements.searchResults.addEventListener('click', event => {
            const row = event.target.closest(DOM_SELECTORS.suggestionRow);
            if (!row) {
                return;
            }

            const name = decodeURIComponent(row.dataset.name);
            const qtyButton = event.target.closest(DOM_SELECTORS.suggestionQtyButton);
            if (qtyButton) {
                this.searchPanel.updateQty(name, parseInt(qtyButton.dataset.delta, 10));
                return;
            }

            if (event.target.closest(DOM_SELECTORS.suggestionName)) {
                this.selectSuggestion(name);
            }
        });
    }

    renderTracker() {
        const items = this.store.getItems();
        const progress = this.store.getProgress();
        this.elements.trackerList.innerHTML = items.length === 0
            ? UI_TEXT.emptyTracker
            : '';

        items.forEach((item, index) => {
            const row = this.document.createElement('div');
            row.className = `item-row ${progress[item.id] ? 'completed' : ''}`;
            row.id = `row-${item.id}`;
            row.innerHTML = renderTrackerItemRow(item, index, Boolean(progress[item.id]));
            this.elements.trackerList.appendChild(row);
        });
    }

    async hydrateStoredItems() {
        const missingDisplayNames = this.store.getItems()
            .filter(item => item && item.name && !item.displayName)
            .map(item => item.name);

        if (missingDisplayNames.length === 0) {
            return;
        }

        try {
            const response = await fetch(API_ROUTES.translate, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texts: missingDisplayNames })
            });
            const res = await response.json();
            const hasChanges = this.store.applyTranslations(res.translations || {});
            if (hasChanges) {
                this.renderTracker();
            }
        } catch (error) {
            console.error(error);
        }
    }

    async searchItems(query) {
        if (query.length < MIN_SEARCH_LENGTH) {
            this.searchPanel.clear();
            return;
        }

        try {
            const response = await fetch(`${API_ROUTES.search}?q=${encodeURIComponent(query)}`);
            const results = await response.json();

            if (results && results.length > 0) {
                this.searchPanel.setResults(results);
            } else {
                this.searchPanel.hide();
            }
        } catch (error) {
            console.error(error);
        }
    }

    selectSuggestion(name) {
        const qty = this.searchPanel.getQty(name);
        const selectedItem = this.searchPanel.findSuggestion(name);
        const displayName = selectedItem?.display_name || name;

        this.store.addItem(name, displayName, qty);

        this.elements.searchInput.value = '';
        this.searchPanel.clear();
        this.renderTracker();
    }

    removeItem(index) {
        this.store.removeItem(index);
        this.renderTracker();
    }

    toggleProgress(id) {
        const isCompleted = this.store.toggleProgress(id);
        this.document.getElementById(`row-${id}`)?.classList.toggle('completed', isCompleted);
    }

    hideSuggestions(event) {
        const nextFocus = event?.relatedTarget || null;
        if (nextFocus?.closest(DOM_SELECTORS.searchBox)) {
            return;
        }

        setTimeout(() => {
            this.searchPanel.hide();
        }, HIDE_SUGGESTIONS_DELAY_MS);
    }
}
