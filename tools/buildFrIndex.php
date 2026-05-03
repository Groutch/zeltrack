<?php
/**
 * Rebuilds cache/fr_index.json from scratch.
 * CLI:     php tools/buildFrIndex.php
 * Browser: http://localhost/zeltrack/tools/buildFrIndex.php
 *
 * Safe to run at any time — idempotent rebuild of the translation index.
 */
require_once __DIR__ . '/../src/Translator.php';

if (php_sapi_name() !== 'cli') {
    header('Content-Type: text/plain; charset=utf-8');
}

$masterPath = Translator::masterPath();
if (!file_exists($masterPath) || filesize($masterPath) < 1000) {
    echo "Error: cache/master.json not found. Open index.php first to populate it.\n";
    exit(1);
}

echo "Building FR index...\n";
$start   = microtime(true);
$map     = Translator::buildFrIndex();
$elapsed = round(microtime(true) - $start, 2);

echo count($map) . " entries translated in {$elapsed}s.\n";
echo 'Saved to: ' . Translator::frIndexPath() . "\n";
