<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'message' => 'Method not allowed']);
  exit;
}

$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true);

if (!is_array($payload)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Invalid JSON payload']);
  exit;
}

$name = trim((string)($payload['name'] ?? ''));
$email = trim((string)($payload['email'] ?? ''));
$color = trim((string)($payload['color'] ?? '#7dd3fc'));

if ($name === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Invalid name or email']);
  exit;
}

$to = $email;
$subject = 'Welcome to Shared Grid';
$message = '<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:24px;">'
  . '<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;">'
  . '<h1 style="margin:0 0 12px;font-size:24px;">Welcome to Shared Grid</h1>'
  . '<p style="margin:0 0 12px;line-height:1.6;">Hi ' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . ', your account is ready.</p>'
  . '<p style="margin:0 0 12px;line-height:1.6;">Your profile color is <strong>' . htmlspecialchars($color, ENT_QUOTES, 'UTF-8') . '</strong>.</p>'
  . '<p style="margin:0;line-height:1.6;">You can now log in and claim your tiles on Shared Grid.</p>'
  . '</div></body></html>';

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/html; charset=UTF-8';
$headers[] = 'From: Shared Grid <info@sharedgrid.com>';
$headers[] = 'Reply-To: info@sharedgrid.com';

$sent = @mail($to, $subject, $message, implode("\r\n", $headers));

if (!$sent) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'message' => 'Mail send failed']);
  exit;
}

echo json_encode(['ok' => true]);