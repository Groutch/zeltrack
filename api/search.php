<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../src/Translator.php';

$masterPath = Translator::masterPath();
$cacheDir   = dirname($masterPath) . '/';

if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

if (!file_exists($masterPath) || filesize($masterPath) < 1000) {
    $url = 'https://botw-compendium.herokuapp.com/api/v3/compendium/all?game=totk';
    $ch  = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_USERAGENT      => 'Mozilla/5.0',
    ]);
    $response = curl_exec($ch);
    if ($response && str_starts_with($response, '{')) {
        file_put_contents($masterPath, $response);
    }
}

$query = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';
if (strlen($query) < 2) {
    die(json_encode([]));
}

$data    = json_decode(file_get_contents($masterPath), true)['data'] ?? [];
$frIndex = Translator::loadFrIndex();

// Keyed by EN name to deduplicate naturally
$results = [];

foreach ($data as $item) {
    $category = $item['category'] ?? '';

    if ($category !== 'monsters') {
        $name   = trim($item['name'] ?? '');
        if ($name === '') continue;
        $frName = $frIndex[$name] ?? $name;
        if (Translator::matches($name, [$query]) || Translator::matches($frName, [$query])) {
            $results[$name] = $frName;
        }
    } else {
        foreach ($item['drops'] ?? [] as $drop) {
            $drop = trim($drop);
            if ($drop === '' || strlen($drop) > 40) continue; // skip corrupted concatenated drops
            $frDrop = $frIndex[$drop] ?? $drop;
            if (Translator::matches($drop, [$query]) || Translator::matches($frDrop, [$query])) {
                $results[$drop] = $frDrop;
            }
        }
    }
}

$payload = array_map(
    fn($name, $frName) => ['name' => $name, 'display_name' => $frName],
    array_keys($results),
    array_values($results)
);

usort($payload, fn($a, $b) => strcasecmp($a['display_name'], $b['display_name']));

echo json_encode(array_slice($payload, 0, 15));
