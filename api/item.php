<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../src/Translator.php';

$masterPath = Translator::masterPath();
$target     = isset($_GET['item']) ? strtolower(trim($_GET['item'])) : '';

if ($target === '' || !file_exists($masterPath)) {
    die(json_encode(['data' => null]));
}

$data              = json_decode(file_get_contents($masterPath), true)['data'] ?? [];
$matchedEntry      = null;
$sourceMonsters    = [];
$fallbackImage     = null;
$fallbackLocations = ['Inconnue'];

foreach ($data as $entry) {
    if (!is_array($entry)) continue;

    if (isset($entry['name']) && strtolower($entry['name']) === $target) {
        $matchedEntry = $entry;
    }

    foreach ($entry['drops'] ?? [] as $drop) {
        if (strtolower($drop) === $target) {
            $sourceMonsters[] = ucwords($entry['name']);
            if ($fallbackImage === null) {
                $fallbackImage     = $entry['image'] ?? null;
                $fallbackLocations = $entry['common_locations'] ?? ['Inconnue'];
            }
        }
    }
}

if ($matchedEntry !== null) {
    $locationsEn = $matchedEntry['common_locations'] ?? [];
    $matchedEntry['display_name']        = Translator::translate($matchedEntry['name'] ?? '');
    $matchedEntry['description']         = Translator::translate($matchedEntry['description'] ?? '');
    $matchedEntry['common_locations']    = Translator::translateList($locationsEn);
    $matchedEntry['common_locations_en'] = $locationsEn;
    if (!empty($sourceMonsters)) {
        $uniqueMonsters = array_values(array_unique($sourceMonsters));
        $matchedEntry['source_monsters']    = Translator::translateList($uniqueMonsters);
        $matchedEntry['source_monsters_en'] = $uniqueMonsters;
    }
    die(json_encode(['data' => $matchedEntry]));
}

if (!empty($sourceMonsters)) {
    $uniqueMonsters = array_values(array_unique($sourceMonsters));
    die(json_encode(['data' => [
        'name'                => $target,
        'display_name'        => Translator::translate($target),
        'description'         => Translator::translate('Dropped by: ' . implode(', ', $uniqueMonsters)),
        'image'               => $fallbackImage,
        'common_locations'    => Translator::translateList($fallbackLocations),
        'common_locations_en' => $fallbackLocations,
        'source_monsters'     => Translator::translateList($uniqueMonsters),
        'source_monsters_en'  => $uniqueMonsters,
    ]]));
}

echo json_encode(['data' => null]);
