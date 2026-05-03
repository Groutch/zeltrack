<?php

class Translator
{
    private const MAX_DROP_LENGTH = 40;

    private static ?array $cache   = null;
    private static ?array $frIndex = null;

    private static function cacheDir(): string
    {
        $dir = __DIR__ . '/../cache/';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        return $dir;
    }

    // ── Cache ─────────────────────────────────────────────────────────────────

    private static function cachePath(): string
    {
        return self::cacheDir() . 'translations_fr.json';
    }

    private static function readCache(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }
        $path = self::cachePath();
        if (!file_exists($path)) {
            self::$cache = [];
            return self::$cache;
        }
        $decoded     = json_decode(file_get_contents($path), true);
        self::$cache = is_array($decoded) ? $decoded : [];
        return self::$cache;
    }

    private static function writeCache(array $cache): void
    {
        self::$cache = $cache;
        file_put_contents(
            self::cachePath(),
            json_encode($cache, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
    }

    private static function cacheKey(string $text, string $from, string $to): string
    {
        return "{$from}|{$to}|{$text}";
    }

    private static function getCached(array $cache, string $text, string $from, string $to): ?string
    {
        $key = self::cacheKey($text, $from, $to);
        if (isset($cache[$key])) {
            return $cache[$key];
        }
        // Legacy key written without direction prefix
        if ($from === 'en' && $to === 'fr' && isset($cache[$text])) {
            return $cache[$text];
        }
        return null;
    }

    // ── Glossary ──────────────────────────────────────────────────────────────

    private static function glossary(): array
    {
        return [
            'like like'            => 'Like Like',
            'master kohga'         => 'Master Kohga',
            'captain construct'    => 'Captain Construct',
            'soldier construct'    => 'Soldier Construct',
            'battle talus'         => 'Battle Talus',
            'stone talus'          => 'Stone Talus',
            'frost talus'          => 'Frost Talus',
            'igneo talus'          => 'Igneo Talus',
            'flux construct'       => 'Flux Construct',
            'training construct'   => 'Training Construct',
            'seized construct'     => 'Seized Construct',
            'blue-maned lynel'     => 'Blue-Maned Lynel',
            'white-maned lynel'    => 'White-Maned Lynel',
            'silver lynel'         => 'Silver Lynel',
            'blue-white frox'      => 'Blue-White Frox',
            'boss bokoblin'        => 'Boss Bokoblin',
            'electric lizalfos'    => 'Electric Lizalfos',
            'fire-breath lizalfos' => 'Fire-Breath Lizalfos',
            'ice-breath lizalfos'  => 'Ice-Breath Lizalfos',
            'hinox'                => 'Hinox',
            'stalnox'              => 'Stalnox',
            'lynel'                => 'Lynel',
            'bokoblin'             => 'Bokoblin',
            'moblin'               => 'Moblin',
            'lizalfos'             => 'Lizalfos',
            'horriblin'            => 'Horriblin',
            'frox'                 => 'Frox',
            'gleeok'               => 'Gleeok',
            'talus'                => 'Talus',
            'pebblit'              => 'Pebblit',
            'octorok'              => 'Octorok',
            'wizzrobe'             => 'Wizzrobe',
            'aerocuda'             => 'Aerocuda',
            'gibdo'                => 'Gibdo',
            'keese'                => 'Keese',
            'chuchu'               => 'Chuchu',
            'molduga'              => 'Molduga',
            'construct'            => 'Construct',
            'korok'                => 'Korok',
            'zonai'                => 'Zonai',
            'yiga'                 => 'Yiga',
            'dinraal'              => 'Dinraal',
            'naydra'               => 'Naydra',
            'farosh'               => 'Farosh',
            'colgera'              => 'Colgera',
            'moragia'              => 'Moragia',
            'mucktorok'            => 'Mucktorok',
            'marbled gohma'        => 'Marbled Gohma',
            'phantom ganon'        => 'Phantom Ganon',
            // Drop item suffixes — protected to avoid mistranslation out of context
            'mace horn'            => 'corne de masse',
            'horn'                 => 'corne',
            'fang'                 => 'croc',
            'guts'                 => 'boyaux',
            'claw'                 => 'griffe',
            'talon'                => 'serre',
            'wing'                 => 'aile',
            'scale'                => 'écaille',
            'eyeball'              => 'œil',
            'tooth'                => 'dent',
            'shard'                => 'fragment',
            'spine'                => 'épine',
        ];
    }

    private static function protectTerms(string $text, array &$tokens): string
    {
        $tokens = [];
        $terms  = self::glossary();
        uksort($terms, fn($a, $b) => strlen($b) <=> strlen($a));
        $i = 0;
        foreach ($terms as $source => $replacement) {
            $placeholder = "__TOTK_{$i}__";
            $updated     = preg_replace('/' . preg_quote($source, '/') . '/i', $placeholder, $text);
            if ($updated !== null && $updated !== $text) {
                $tokens[$placeholder] = $replacement;
                $text = $updated;
                $i++;
            }
        }
        return $text;
    }

    private static function restoreTerms(string $text, array $tokens): string
    {
        return str_replace(array_keys($tokens), array_values($tokens), $text);
    }

    // ── Remote API ────────────────────────────────────────────────────────────

    private static function callApi(string $text, string $from, string $to): string
    {
        $tokens    = [];
        $protected = ($from === 'en' && $to === 'fr') ? self::protectTerms($text, $tokens) : $text;

        $url = 'https://translate.googleapis.com/translate_a/single?client=gtx'
            . '&sl=' . rawurlencode($from)
            . '&tl=' . rawurlencode($to)
            . '&dt=t&q=' . rawurlencode($protected);

        $response = false;
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 8,
                CURLOPT_USERAGENT      => 'Mozilla/5.0',
            ]);
            $response = curl_exec($ch);
            curl_close($ch);
        }

        if ($response === false || $response === '') {
            $ctx      = stream_context_create(['http' => [
                'method'  => 'GET',
                'timeout' => 8,
                'header'  => "User-Agent: Mozilla/5.0\r\n",
            ]]);
            $response = @file_get_contents($url, false, $ctx);
        }

        if ($response === false || $response === '') {
            return $text;
        }

        $decoded = json_decode($response, true);
        if (!is_array($decoded) || !isset($decoded[0])) {
            return $text;
        }

        $result = implode('', array_column($decoded[0] ?? [], 0));
        if ($result === '') {
            return $text;
        }

        return ($from === 'en' && $to === 'fr') ? self::restoreTerms($result, $tokens) : $result;
    }

    // ── Public translation API ────────────────────────────────────────────────

    public static function translate(string $text, string $from = 'en', string $to = 'fr'): string
    {
        if (trim($text) === '') {
            return $text;
        }
        $cache = self::readCache();
        $hit   = self::getCached($cache, $text, $from, $to);
        if ($hit !== null) {
            return $hit;
        }
        $translated = self::callApi($text, $from, $to);
        $cache[self::cacheKey($text, $from, $to)] = $translated;
        if ($from === 'en' && $to === 'fr') {
            $cache[$text] = $translated; // legacy key for backwards compat
        }
        self::writeCache($cache);
        return $translated;
    }

    public static function translateMany(array $texts): array
    {
        $results = [];
        foreach ($texts as $text) {
            if (is_string($text) && trim($text) !== '') {
                $results[$text] = self::translate($text);
            }
        }
        return $results;
    }

    public static function translateList(array $items): array
    {
        return array_map(fn($item) => self::translate((string) $item), $items);
    }

    // ── FR Index ──────────────────────────────────────────────────────────────

    public static function frIndexPath(): string
    {
        return self::cacheDir() . 'fr_index.json';
    }

    public static function masterPath(): string
    {
        return self::cacheDir() . 'master.json';
    }

    public static function buildFrIndex(): array
    {
        $masterPath = self::masterPath();
        if (!file_exists($masterPath)) {
            return [];
        }
        $data  = json_decode(file_get_contents($masterPath), true)['data'] ?? [];
        $names = [];
        foreach ($data as $item) {
            if (($item['category'] ?? '') !== 'monsters') {
                $name = trim($item['name'] ?? '');
                if ($name !== '') {
                    $names[] = $name;
                }
            } else {
                foreach ($item['drops'] ?? [] as $drop) {
                    $drop = trim($drop);
                    if ($drop !== '' && strlen($drop) <= self::MAX_DROP_LENGTH) {
                        $names[] = $drop;
                    }
                }
            }
        }
        $map = self::translateMany(array_values(array_unique($names)));
        file_put_contents(
            self::frIndexPath(),
            json_encode($map, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
        self::$frIndex = $map;
        return $map;
    }

    public static function loadFrIndex(): array
    {
        if (self::$frIndex !== null) {
            return self::$frIndex;
        }
        $indexPath  = self::frIndexPath();
        $masterPath = self::masterPath();
        $needsBuild = !file_exists($indexPath)
            || (file_exists($masterPath) && filemtime($masterPath) > filemtime($indexPath));

        if ($needsBuild) {
            self::$frIndex = self::buildFrIndex();
        } else {
            $decoded       = json_decode(file_get_contents($indexPath), true);
            self::$frIndex = is_array($decoded) ? $decoded : self::buildFrIndex();
        }
        return self::$frIndex;
    }

    // ── Search helpers ────────────────────────────────────────────────────────

    public static function normalize(string $text): string
    {
        $text  = mb_strtolower(trim($text), 'UTF-8');
        $ascii = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
        if ($ascii !== false) {
            $text = $ascii;
        }
        return trim(preg_replace('/\s+/', ' ', preg_replace('/[^a-z0-9]+/', ' ', $text)));
    }

    public static function matches(string $name, array $queries): bool
    {
        $normalizedName = self::normalize($name);
        if ($normalizedName === '') {
            return false;
        }
        foreach ($queries as $query) {
            $q = self::normalize((string) $query);
            if ($q === '') {
                continue;
            }
            if (str_contains($normalizedName, $q)) {
                return true;
            }
            $tokens = array_filter(explode(' ', $q));
            if (empty($tokens)) {
                continue;
            }
            $allMatch = true;
            foreach ($tokens as $token) {
                if (!str_contains($normalizedName, $token)) {
                    $allMatch = false;
                    break;
                }
            }
            if ($allMatch) {
                return true;
            }
        }
        return false;
    }
}
