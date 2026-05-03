export const STORAGE_KEYS = {
    items: 'totk_items',
    progress: 'totk_progress'
};

export const API_ROUTES = {
    search: 'api/search.php',
    itemDetails: 'api/item.php',
    translate: 'api/translate.php'
};

export const DOM_IDS = {
    searchInput: 'item-search',
    searchResults: 'search-results',
    trackerList: 'tracker-list',
    itemModal: 'modal',
    itemModalBody: 'modal-body',
    itemModalCloseButton: 'btn-close-modal',
    dataModal: 'data-modal',
    dataModalStatus: 'data-modal-status',
    importInput: 'import-json-input',
    exportButton: 'btn-export',
    importButton: 'btn-import',
    shareButton: 'btn-share',
    dataModalCloseButton: 'btn-close-data-modal'
};

export const DOM_SELECTORS = {
    dataModalContent: '.data-modal-content',
    floatingButton: '.floating-data-btn',
    searchBox: '.search-box',
    trackerCheckbox: 'input[type="checkbox"][data-id]',
    itemInfo: '.item-info[data-name]',
    deleteButton: '.btn-delete[data-index]',
    suggestionRow: '.suggestion-row[data-name]',
    suggestionQtyButton: '.suggestion-qty-btn[data-delta]',
    suggestionName: '.suggestion-name',
    itemModalContent: '.modal-content'
};

export const URLS = {
    objMapBase: 'https://objmap-totk.zeldamods.org/#/map/z3,0,0,Surface?q=',
    shareHashPrefix: '#s='
};

export const MIN_SEARCH_LENGTH = 2;
export const DEFAULT_QTY = 1;
export const RANDOM_ID_LENGTH = 5;
export const IMPORT_ID_SUFFIX_LENGTH = 4;
export const HIDE_SUGGESTIONS_DELAY_MS = 150;
export const STATUS_ERROR_COLOR = '#ff7777';
export const STATUS_SUCCESS_COLOR = '#9ff2ff';

export const UI_TEXT = {
    emptyTracker: "<p style='text-align:center; opacity:0.5; margin-top:20px;'>Aucun objet.</p>",
    loading: 'Chargement...',
    detailsNotFound: 'Détails introuvables.',
    unknownError: 'Erreur.',
    unknownLocation: 'Inconnue',
    mapItemLabel: 'Voir cet objet sur la map',
    panelObject: 'Objet',
    panelMonsters: 'Monstres',
    panelZones: 'Zones',
    exportSuccess: 'Export JSON terminé.',
    exportError: 'Erreur pendant l\'export JSON.',
    importSuccess: 'Import JSON terminé.',
    importInvalid: 'JSON invalide. Vérifie le fichier.',
    importReadError: 'Impossible de lire ce fichier.',
    shareSuccess: 'Lien copié dans le presse-papier !',
    shareFallback: 'Copiez ce lien : ',
    shareError: 'Erreur lors de la génération du lien.'
};
