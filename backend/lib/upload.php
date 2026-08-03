<?php

declare(strict_types=1);

require_once __DIR__ . '/response.php';

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 75;

function process_image_upload(string $field = 'image'): ?array
{
    if (!isset($_FILES[$field]) || !is_array($_FILES[$field])) {
        return null;
    }

    $file = $_FILES[$field];

    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        json_error('A kép feltöltése sikertelen volt. Próbáld újra!', 400);
    }

    if (!is_uploaded_file($file['tmp_name'])) {
        json_error('Érvénytelen képfájl!', 400);
    }

    $info = @getimagesize($file['tmp_name']);
    if ($info === false) {
        json_error('A fájl nem érvényes kép.', 400);
    }

    $mime = $info['mime'];
    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
        json_error('Csak JPG, PNG vagy WebP kép tölthető fel.', 400);
    }

    $original = (string) file_get_contents($file['tmp_name']);

    $image = @imagecreatefromstring($original);
    if ($image === false) {
        json_error('A kép feldolgozása sikertelen.', 400);
    }

    $width = imagesx($image);
    $height = imagesy($image);

    $thumbWidth = THUMBNAIL_WIDTH;
    $thumbHeight = (int) max(1, round($height * $thumbWidth / $width));

    $thumb = imagecreatetruecolor($thumbWidth, $thumbHeight);
    imagecopyresampled($thumb, $image, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $width, $height);

    ob_start();
    imagejpeg($thumb, null, THUMBNAIL_QUALITY);
    $thumbnail = (string) ob_get_clean();

    imagedestroy($image);
    imagedestroy($thumb);

    return [
        'image' => $original,
        'thumbnail' => $thumbnail,
        'type' => $mime,
    ];
}
