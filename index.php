<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zelda TotK Tracker</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>

<div class="container">
    <h1>Armor Upgrade Tracker</h1>

    <div class="search-container">
        <div class="search-box">
            <input type="text" id="item-search" placeholder="Chercher un objet (ex: hinox...)">
            <div id="search-results" class="suggestions"></div>
        </div>
    </div>

    <div id="tracker-list"></div>
</div>

<div id="modal" class="modal-overlay">
    <div class="modal-content">
        <div id="modal-body">Chargement...</div>
        <button id="btn-close-modal">Fermer</button>
    </div>
</div>

<div id="data-modal" class="modal-overlay">
    <div class="modal-content data-modal-content">
        <h3>Save / Load JSON</h3>
        <p class="data-modal-help">Exporter ou importer ta progression locale.</p>

        <div class="data-modal-actions">
            <button type="button" id="btn-export">Exporter JSON</button>
            <button type="button" id="btn-import">Importer JSON</button>
            <button type="button" id="btn-share">Partager le lien</button>
        </div>

        <input id="import-json-input" type="file" accept="application/json,.json">
        <div id="data-modal-status" class="data-modal-status"></div>

        <button type="button" id="btn-close-data-modal">Fermer</button>
    </div>
</div>

<button
    type="button"
    class="floating-data-btn"
    title="Save/Load JSON"
    aria-label="Save or load tracker JSON"
>⇅</button>

<script type="module" src="assets/main.js"></script>
</body>
</html>