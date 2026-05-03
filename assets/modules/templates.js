export function renderTrackerItemRow(item, index, isCompleted) {
    const displayName = item.displayName || item.name;
    return `
        <input type="checkbox" ${isCompleted ? 'checked' : ''} data-id="${item.id}">
        <div class="item-info" data-name="${encodeURIComponent(item.name)}">
            <span class="qty">${item.qty}x</span>
            <span class="label">${displayName}</span>
        </div>
        <button class="btn-delete" data-index="${index}">×</button>
    `;
}

export function renderSuggestionRow(item, qty) {
    return `
        <div class="suggestion-row" data-name="${encodeURIComponent(item.name)}">
            <button type="button" class="suggestion-name">${item.display_name || item.name}</button>
            <div class="suggestion-qty">
                <button type="button" class="suggestion-qty-btn" data-delta="-1">-</button>
                <span class="suggestion-qty-value">${qty}</span>
                <button type="button" class="suggestion-qty-btn" data-delta="1">+</button>
            </div>
        </div>`;
}
