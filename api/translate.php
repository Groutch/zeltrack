<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../src/Translator.php';

$payload = json_decode(file_get_contents('php://input'), true);
$texts   = $payload['texts'] ?? [];

if (!is_array($texts)) {
    echo json_encode(['translations' => []]);
    exit;
}

echo json_encode(['translations' => Translator::translateMany($texts)]);
