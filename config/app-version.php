<?php
declare(strict_types=1);

$manifestPath = dirname(__DIR__) . '/package.json';
$manifest = is_file($manifestPath) ? json_decode((string) file_get_contents($manifestPath), true) : [];
$metaFitAdminVersion = is_array($manifest) ? (string) ($manifest['version'] ?? '—') : '—';
