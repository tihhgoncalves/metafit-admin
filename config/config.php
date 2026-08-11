<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$environmentPath = dirname(__DIR__) . '/.env';
if (!is_file($environmentPath)) {
  http_response_code(500);
  echo json_encode(['error' => 'Configuração de ambiente ausente.']);
  exit;
}

$environment = parse_ini_file($environmentPath, false, INI_SCANNER_RAW);
$nodeEnvironment = (string) ($environment['NODE_ENV'] ?? 'production');
$apiUrl = rtrim((string) ($environment['METAFIT_API_URL'] ?? ''), '/');
if ($apiUrl === '') {
  http_response_code(500);
  echo json_encode(['error' => 'METAFIT_API_URL não configurada.']);
  exit;
}

echo json_encode(['environment' => $nodeEnvironment, 'apiUrl' => $apiUrl], JSON_UNESCAPED_SLASHES);
