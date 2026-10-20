<?php
// Default Configuration — PatilWeb / WAMPP panel file manager
$CONFIG = '{"lang":"en","error_reporting":false,"show_hidden":false}';

// Users: array('Username' => 'Password', ...)
// password_hash('password', PASSWORD_DEFAULT)
$login_users = array(
    'admin' => password_hash('admin', PASSWORD_DEFAULT),
);

// Auth with login/password (local panel — no extra login)
$use_auth = false;

// Readonly users (username array)
$readonly_users = array(
    'user'
);

// user specific directories
$directories_users = array();

// Enable highlight.js (https://highlightjs.org/) on view's page
$use_highlightjs = true;

// highlight.js style
$highlightjs_style = 'vs';

// Enable ace.js (https://ace.c9.io/) on view's page
$edit_files = true;

// Default timezone for date() and time()
$default_timezone = 'Asia/Kolkata';

// Install root = folder that contains htdocs/ (same as panel WEB_ROOT)
$wampp_root = str_replace('\\', '/', dirname(__DIR__, 3));

// Root path for file manager — browse the whole stack
$root_path = $wampp_root;

// Root url for links in file manager (relative to $http_host)
$root_url = '';

// Server hostname
$http_host = $_SERVER['HTTP_HOST'] ?? 'localhost';

// input encoding for iconv
$iconv_input_encoding = 'UTF-8';

// date() format for file modification date
$datetime_format = 'd.m.y H:i';

// allowed file extensions for upload and rename (empty = all)
$allowed_extensions = '';

// Array of files and folders excluded from listing
$GLOBALS['exclude_items'] = array();

// Google Docs Viewer
$GLOBALS['online_viewer'] = true;

// Sticky Nav bar
$sticky_navbar = true;

// max upload file size (MB)
define('MAX_UPLOAD_SIZE', '2048');

include __DIR__ . '/fm.inc.php';
