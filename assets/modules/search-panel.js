import { DEFAULT_QTY } from './constants.js';
import { renderSuggestionRow } from './templates.js';

export class SearchPanel {
    constructor(container) {
        this.container = container;
        this.currentSuggestions = [];
        this.suggestionQuantities = {};
    }

    clear() {
        this.currentSuggestions = [];
        this.suggestionQuantities = {};
        this.hide();
    }

    hide() {
        this.container.style.display = 'none';
    }

    setResults(results) {
        this.currentSuggestions = results;
        this.suggestionQuantities = Object.fromEntries(
            results.map(item => [item.name, this.suggestionQuantities[item.name] || DEFAULT_QTY])
        );
        this.render();
        this.container.style.display = 'block';
    }

    render() {
        this.container.innerHTML = this.currentSuggestions
            .map(item => renderSuggestionRow(item, this.getQty(item.name)))
            .join('');
    }

    getQty(name) {
        return this.suggestionQuantities[name] || DEFAULT_QTY;
    }

    updateQty(name, delta) {
        this.suggestionQuantities[name] = Math.max(DEFAULT_QTY, this.getQty(name) + delta);
        this.render();
    }

    findSuggestion(name) {
        return this.currentSuggestions.find(item => item.name === name);
    }
}
