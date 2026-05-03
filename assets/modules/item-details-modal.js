import { API_ROUTES, DOM_SELECTORS, UI_TEXT, URLS } from './constants.js';

export class ItemDetailsModal {
    constructor(modal, body, closeButton) {
        this.modal = modal;
        this.body = body;
        this.closeButton = closeButton;
        this.content = modal.querySelector(DOM_SELECTORS.itemModalContent);
    }

    bind() {
        this.modal.addEventListener('click', () => this.close());
        this.content.addEventListener('click', event => event.stopPropagation());
        this.closeButton.addEventListener('click', () => this.close());
    }

    close() {
        this.modal.style.display = 'none';
    }

    async open(itemName) {
        this.modal.style.display = 'flex';
        this.body.innerHTML = UI_TEXT.loading;

        try {
            const response = await fetch(`${API_ROUTES.itemDetails}?item=${encodeURIComponent(itemName)}`);
            const res = await response.json();
            this.body.innerHTML = res.data ? this.renderContent(res.data, itemName) : UI_TEXT.detailsNotFound;
        } catch (_) {
            this.body.innerHTML = UI_TEXT.unknownError;
        }
    }

    renderContent(data, itemName) {
        const itemNameEn = data.name || itemName;
        const sourceMonsters = Array.isArray(data.source_monsters) ? data.source_monsters : [];
        const sourceMonsterEn = Array.isArray(data.source_monsters_en) ? data.source_monsters_en : sourceMonsters;
        const commonLocations = Array.isArray(data.common_locations) ? data.common_locations : [];
        const commonLocationEn = Array.isArray(data.common_locations_en) ? data.common_locations_en : commonLocations;
        const isMonsterDrop = sourceMonsters.length > 0;

        const itemMapLink = `
            <a href="${URLS.objMapBase}${encodeURIComponent(itemNameEn)}" target="_blank" rel="noopener noreferrer"
                class="modal-item-link">
                <span class="modal-item-icon">🧭</span>
                <span>${UI_TEXT.mapItemLabel}</span>
            </a>`;

        const monsterItems = sourceMonsters.map((monster, index) => `
            <a href="${URLS.objMapBase}${encodeURIComponent(sourceMonsterEn[index] ?? monster)}" target="_blank" rel="noopener noreferrer"
                class="modal-item-link">
                <span class="modal-item-icon">🐲</span>
                <span>${monster}</span>
            </a>`).join('');

        const locationItems = commonLocations.length > 0
            ? commonLocations.map((location, index) => `
            <a href="${URLS.objMapBase}${encodeURIComponent(commonLocationEn[index] ?? location)}" target="_blank" rel="noopener noreferrer"
                class="modal-item-link">
                <span class="modal-item-icon">📍</span>
                <span>${location}</span>
            </a>`).join('')
            : `<div class="modal-item-row"><span class="modal-item-icon">📍</span><span>${UI_TEXT.unknownLocation}</span></div>`;

        return `
            <img src="${data.image}" style="width:120px; border-radius:10px;">
            <h2 style="color:#00e5ff; margin:15px 0;">${data.display_name || data.name}</h2>
            <p style="font-size:0.9em;">${data.description}</p>
            ${!isMonsterDrop ? `
            <div class="modal-panel">
                <strong class="modal-panel-title">${UI_TEXT.panelObject}</strong>
                <div class="modal-panel-list">
                    ${itemMapLink}
                </div>
            </div>
            ` : ''}
            ${sourceMonsters.length > 0 ? `
            <div class="modal-panel">
                <strong class="modal-panel-title">${UI_TEXT.panelMonsters}</strong>
                <div class="modal-panel-list">
                    ${monsterItems}
                </div>
            </div>` : ''}
            <div class="modal-panel">
                <strong class="modal-panel-title">${UI_TEXT.panelZones}</strong>
                <div class="modal-panel-list">
                    ${locationItems}
                </div>
            </div>
        `;
    }
}
