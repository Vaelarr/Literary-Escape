<?php
/**
 * Audit Controller
 * Handles audit trail viewing and management
 */

class AuditController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        AuthMiddleware::authenticateAdmin();
        
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 50;
        $offset = ($page - 1) * $limit;

        try {
            // Get total count
            $countStmt = $this->db->query("SELECT COUNT(*) as count FROM audit_trail");
            $totalCount = $countStmt->fetch()['count'];

            // Get audit trail with admin details
            $stmt = $this->db->prepare(
                "SELECT a.*, ad.username as admin_username, ad.email as admin_email
                 FROM audit_trail a
                 LEFT JOIN admins ad ON a.admin_id = ad.id
                 ORDER BY a.created_at DESC
                 LIMIT ? OFFSET ?"
            );
            $stmt->execute([$limit, $offset]);
            $auditTrail = $stmt->fetchAll();

            echo json_encode([
                'auditTrail' => $auditTrail,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'totalCount' => $totalCount,
                    'totalPages' => ceil($totalCount / $limit)
                ]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getRecent() {
        AuthMiddleware::authenticateAdmin();
        
        $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 20;

        try {
            $stmt = $this->db->prepare(
                "SELECT a.*, ad.username as admin_username, ad.email as admin_email
                 FROM audit_trail a
                 LEFT JOIN admins ad ON a.admin_id = ad.id
                 ORDER BY a.created_at DESC
                 LIMIT ?"
            );
            $stmt->execute([$limit]);
            $auditTrail = $stmt->fetchAll();

            echo json_encode($auditTrail);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getByEntityType($entityType) {
        AuthMiddleware::authenticateAdmin();
        
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 50;
        $offset = ($page - 1) * $limit;

        try {
            // Get total count
            $countStmt = $this->db->prepare(
                "SELECT COUNT(*) as count FROM audit_trail WHERE entity_type = ?"
            );
            $countStmt->execute([$entityType]);
            $totalCount = $countStmt->fetch()['count'];

            // Get audit trail
            $stmt = $this->db->prepare(
                "SELECT a.*, ad.username as admin_username, ad.email as admin_email
                 FROM audit_trail a
                 LEFT JOIN admins ad ON a.admin_id = ad.id
                 WHERE a.entity_type = ?
                 ORDER BY a.created_at DESC
                 LIMIT ? OFFSET ?"
            );
            $stmt->execute([$entityType, $limit, $offset]);
            $auditTrail = $stmt->fetchAll();

            echo json_encode([
                'auditTrail' => $auditTrail,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'totalCount' => $totalCount,
                    'totalPages' => ceil($totalCount / $limit)
                ]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getByActionType($actionType) {
        AuthMiddleware::authenticateAdmin();
        
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 50;
        $offset = ($page - 1) * $limit;

        try {
            // Get total count
            $countStmt = $this->db->prepare(
                "SELECT COUNT(*) as count FROM audit_trail WHERE action = ?"
            );
            $countStmt->execute([$actionType]);
            $totalCount = $countStmt->fetch()['count'];

            // Get audit trail
            $stmt = $this->db->prepare(
                "SELECT a.*, ad.username as admin_username, ad.email as admin_email
                 FROM audit_trail a
                 LEFT JOIN admins ad ON a.admin_id = ad.id
                 WHERE a.action = ?
                 ORDER BY a.created_at DESC
                 LIMIT ? OFFSET ?"
            );
            $stmt->execute([$actionType, $limit, $offset]);
            $auditTrail = $stmt->fetchAll();

            echo json_encode([
                'auditTrail' => $auditTrail,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'totalCount' => $totalCount,
                    'totalPages' => ceil($totalCount / $limit)
                ]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getByAdmin($adminId) {
        AuthMiddleware::authenticateAdmin();
        
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 50;
        $offset = ($page - 1) * $limit;

        try {
            // Get total count
            $countStmt = $this->db->prepare(
                "SELECT COUNT(*) as count FROM audit_trail WHERE admin_id = ?"
            );
            $countStmt->execute([$adminId]);
            $totalCount = $countStmt->fetch()['count'];

            // Get audit trail
            $stmt = $this->db->prepare(
                "SELECT a.*, ad.username as admin_username, ad.email as admin_email
                 FROM audit_trail a
                 LEFT JOIN admins ad ON a.admin_id = ad.id
                 WHERE a.admin_id = ?
                 ORDER BY a.created_at DESC
                 LIMIT ? OFFSET ?"
            );
            $stmt->execute([$adminId, $limit, $offset]);
            $auditTrail = $stmt->fetchAll();

            echo json_encode([
                'auditTrail' => $auditTrail,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'totalCount' => $totalCount,
                    'totalPages' => ceil($totalCount / $limit)
                ]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getByEntity($entityType, $entityId) {
        AuthMiddleware::authenticateAdmin();

        try {
            $stmt = $this->db->prepare(
                "SELECT a.*, ad.username as admin_username, ad.email as admin_email
                 FROM audit_trail a
                 LEFT JOIN admins ad ON a.admin_id = ad.id
                 WHERE a.entity_type = ? AND a.entity_id = ?
                 ORDER BY a.created_at DESC"
            );
            $stmt->execute([$entityType, $entityId]);
            $auditTrail = $stmt->fetchAll();

            echo json_encode($auditTrail);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getStatistics() {
        AuthMiddleware::authenticateAdmin();

        try {
            $stats = [];

            // Total audit entries
            $stmt = $this->db->query("SELECT COUNT(*) as count FROM audit_trail");
            $stats['totalEntries'] = $stmt->fetch()['count'];

            // Entries by entity type
            $stmt = $this->db->query(
                "SELECT entity_type, COUNT(*) as count 
                 FROM audit_trail 
                 GROUP BY entity_type"
            );
            $stats['byEntityType'] = $stmt->fetchAll();

            // Entries by action
            $stmt = $this->db->query(
                "SELECT action, COUNT(*) as count 
                 FROM audit_trail 
                 GROUP BY action"
            );
            $stats['byAction'] = $stmt->fetchAll();

            // Most active admins
            $stmt = $this->db->query(
                "SELECT a.admin_id, ad.username, COUNT(*) as count
                 FROM audit_trail a
                 LEFT JOIN admins ad ON a.admin_id = ad.id
                 GROUP BY a.admin_id
                 ORDER BY count DESC
                 LIMIT 10"
            );
            $stats['mostActiveAdmins'] = $stmt->fetchAll();

            // Recent activity (last 7 days)
            $stmt = $this->db->query(
                "SELECT DATE(created_at) as date, COUNT(*) as count
                 FROM audit_trail
                 WHERE created_at >= datetime('now', '-7 days')
                 GROUP BY DATE(created_at)
                 ORDER BY date DESC"
            );
            $stats['recentActivity'] = $stmt->fetchAll();

            echo json_encode($stats);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
