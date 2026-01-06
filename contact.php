<?php
// Charger l'autoloader de Composer
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

// Chargement des variables d'environnement si le fichier .env existe
if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

// Configuration des headers pour JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS (CORS preflight)
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

function jsonResponse($success, $message, $data = null)
{
    $response = [
        'success' => $success,
        'message' => $message,
        'timestamp' => date('c')
    ];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

// Vérification de la méthode HTTP
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    jsonResponse(false, "Méthode non autorisée", ['allowed_methods' => ['POST']]);
}

// Fonction de validation robuste
function validateContactData($data)
{
    $errors = [];

    // Validation du nom
    if (empty($data['name'])) {
        $errors['name'] = "Le nom est obligatoire";
    } elseif (strlen($data['name']) < 2) {
        $errors['name'] = "Le nom doit contenir au moins 2 caractères";
    } elseif (strlen($data['name']) > 255) {
        $errors['name'] = "Le nom ne peut pas dépasser 255 caractères";
    } elseif (!preg_match("/^[a-zA-ZÀ-ÿ\s\-']+$/u", $data['name'])) {
        $errors['name'] = "Le nom contient des caractères invalides";
    }

    // Validation de l'email
    if (empty($data['email'])) {
        $errors['email'] = "L'email est obligatoire";
    } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = "Format d'email invalide";
    } elseif (strlen($data['email']) > 255) {
        $errors['email'] = "L'email ne peut pas dépasser 255 caractères";
    }

    // Validation du téléphone (optionnel)
    if (!empty($data['phone'])) {
        if (!preg_match("/^[+]?[\d\s\-()]{8,20}$/", $data['phone'])) {
            $errors['phone'] = "Format de téléphone invalide";
        }
    }

    // Validation du service
    $allowedServices = ['UX/UI Design', 'Développement Web', 'Applications Mobiles', 'E-commerce', 'Conseil & Stratégie', 'Formation', 'Autre'];
    if (empty($data['service'])) {
        $errors['service'] = "Veuillez sélectionner un service";
    } elseif (!in_array($data['service'], $allowedServices)) {
        $errors['service'] = "Service invalide";
    }

    // Validation du message
    if (empty($data['message'])) {
        $errors['message'] = "Le message est obligatoire";
    } elseif (strlen($data['message']) < 10) {
        $errors['message'] = "Le message doit contenir au moins 10 caractères";
    } elseif (strlen($data['message']) > 2000) {
        $errors['message'] = "Le message ne peut pas dépasser 2000 caractères";
    }

    return $errors;
}

// Fonction de sanitisation
function sanitizeContactData($data)
{
    return [
        'name' => htmlspecialchars(trim($data['name']), ENT_QUOTES, 'UTF-8'),
        'email' => filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL),
        'phone' => htmlspecialchars(trim($data['phone'] ?? ''), ENT_QUOTES, 'UTF-8'),
        'service' => htmlspecialchars(trim($data['service']), ENT_QUOTES, 'UTF-8'),
        'message' => htmlspecialchars(trim($data['message']), ENT_QUOTES, 'UTF-8'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
}

// Fonction de log simple
function logContact($data, $success, $message)
{
    $logData = [
        'timestamp' => date('c'),
        'ip' => $data['ip'],
        'email' => $data['email'],
        'success' => $success,
        'message' => $message
    ];

    $logFile = 'logs/contacts_' . date('Y-m-d') . '.log';
    $logDir = dirname($logFile);

    // Créer le dossier logs s'il n'existe pas
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }

    file_put_contents($logFile, json_encode($logData) . "\n", FILE_APPEND | LOCK_EX);
}

// Fonction d'envoi d'email avec PHPMailer
function sendContactEmail($data)
{
    $mail = new PHPMailer(true);

    try {
        // Configuration du serveur
        // $mail->SMTPDebug = 2; // Activer le debug pour voir les erreurs
        $mail->isSMTP();
        $mail->Host = $_ENV['SMTP_HOST'] ?? 'smtp.hostinger.com';
        $mail->SMTPAuth = true;
        $mail->Username = $_ENV['SMTP_USERNAME'] ?? 'contact@lumiatechnologie.com'; // À configurer
        $mail->Password = $_ENV['SMTP_PASSWORD'] ?? 'VotreMotDePasse'; // À configurer
        $mail->SMTPSecure = $_ENV['SMTP_SECURE'] ?? PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = $_ENV['SMTP_PORT'] ?? 465;
        $mail->CharSet = 'UTF-8';

        // Destinataires
        $mail->setFrom($mail->Username, 'LUMIA TECH Contact'); // L'expéditeur doit être l'adresse authentifiée
        $mail->addAddress($_ENV['CONTACT_EMAIL'] ?? 'contact@lumiatechnologie.com');     // Ajouter le destinataire
        $mail->addReplyTo($data['email'], $data['name']);

        // Contenu
        $mail->isHTML(true);
        $mail->Subject = "Nouvelle demande de contact – " . $data['name'];

        // Template HTML de l'email
        $mailBody = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>
            <h2 style='color: #274ce3; border-bottom: 2px solid #274ce3; padding-bottom: 10px;'>Nouvelle Demande de Contact</h2>
            
            <p><strong>Date :</strong> " . date('d/m/Y H:i') . "</p>
            
            <div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;'>
                <h3 style='margin-top: 0; color: #333;'>Informations Client</h3>
                <p><strong>Nom :</strong> {$data['name']}</p>
                <p><strong>Email :</strong> <a href='mailto:{$data['email']}'>{$data['email']}</a></p>
                <p><strong>Téléphone :</strong> " . ($data['phone'] ?: 'Non renseigné') . "</p>
                <p><strong>Service :</strong> {$data['service']}</p>
            </div>
            
            <div style='background-color: #fff; padding: 15px; border: 1px solid #eee; border-radius: 5px;'>
                <h3 style='margin-top: 0; color: #333;'>Message</h3>
                <p style='white-space: pre-wrap;'>{$data['message']}</p>
            </div>
            
            <div style='margin-top: 20px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 10px;'>
                <p>Envoyé depuis le formulaire de contact du site Lumiatechnologie.</p>
                <p>IP: {$data['ip']}</p>
            </div>
        </div>
        ";

        $mail->Body = $mailBody;
        $mail->AltBody = strip_tags(str_replace(['<br>', '</p>'], ["\n", "\n\n"], $mailBody));

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Erreur PHPMailer: {$mail->ErrorInfo}");
        return false;
    }
}

// Traitement principal
try {
    // Récupération et validation des données
    $rawData = json_decode(file_get_contents('php://input'), true);

    // Si pas de JSON, essayer les données POST classiques
    if (!$rawData) {
        $rawData = $_POST;
    }

    // Vérification des données requises
    if (empty($rawData)) {
        jsonResponse(false, "Aucune donnée reçue");
    }

    // Validation des données
    $errors = validateContactData($rawData);
    if (!empty($errors)) {
        jsonResponse(false, "Données invalides", ['errors' => $errors]);
    }

    // Sanitisation des données
    $cleanData = sanitizeContactData($rawData);

    // Envoi de l'email
    $emailSent = sendContactEmail($cleanData);

    if ($emailSent) {
        // Log du succès
        logContact($cleanData, true, "Message envoyé avec succès");

        jsonResponse(true, "✅ Votre message a été envoyé avec succès ! Nous vous recontacterons dans les plus brefs délais.");
    } else {
        // Log de l'échec
        logContact($cleanData, false, "Échec d'envoi de l'email");

        jsonResponse(false, "❌ Une erreur s'est produite lors de l'envoi. Veuillez réessayer ou nous contacter directement par email.");
    }

} catch (Exception $e) {
    // Log de l'erreur
    error_log("Erreur contact: " . $e->getMessage());

    jsonResponse(false, "❌ Une erreur technique s'est produite. Veuillez réessayer plus tard.");
}
?>