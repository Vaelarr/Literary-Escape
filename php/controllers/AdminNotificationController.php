<?php
/**
 * Admin Notification Controller
 * Provides admin notifications endpoints compatible with Node/Express API
 */

class AdminNotificationController {
	private $db;

	public function __construct() {
		$this->db = Database::getInstance()->getConnection();
	}

	/**
	 * Get unread notifications for current admin
	 * GET /api/admin/notifications/unread
	 */
	public function getUnread() {
		AuthMiddleware::authenticateAdmin();

		try {
			$this->ensureTable();

			$stmt = $this->db->prepare(
				"SELECT * FROM admin_notifications 
				WHERE is_read = 0 
				ORDER BY created_at DESC
				LIMIT 100"
			);
			$stmt->execute();
			$rows = $stmt->fetchAll();

			echo json_encode($rows);
		} catch (PDOException $e) {
			http_response_code(500);
			echo json_encode(['error' => $e->getMessage()]);
		}
	}

	/**
	 * Get unread notification count
	 * GET /api/admin/notifications/unread/count
	 */
	public function getUnreadCount() {
		AuthMiddleware::authenticateAdmin();

		try {
			$this->ensureTable();

			$stmt = $this->db->query(
				"SELECT COUNT(*) as count FROM admin_notifications WHERE is_read = 0"
			);
			$count = $stmt->fetch()['count'] ?? 0;
			echo json_encode(['count' => intval($count)]);
		} catch (PDOException $e) {
			http_response_code(500);
			echo json_encode(['error' => $e->getMessage()]);
		}
	}

	/**
	 * Get recent notifications (read + unread)
	 * GET /api/admin/notifications/recent
	 */
	public function getRecent() {
		AuthMiddleware::authenticateAdmin();

		$limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 20;

		try {
			$this->ensureTable();

			$stmt = $this->db->prepare(
				"SELECT * FROM admin_notifications 
				ORDER BY created_at DESC
				LIMIT ?"
			);
			$stmt->execute([$limit]);
			$rows = $stmt->fetchAll();

			echo json_encode($rows);
		} catch (PDOException $e) {
			http_response_code(500);
			echo json_encode(['error' => $e->getMessage()]);
		}
	}

	/**
	 * Mark a notification as read
	 * PUT /api/admin/notifications/:id/read
	 */
	public function markRead($id) {
		AuthMiddleware::authenticateAdmin();

		try {
			$this->ensureTable();

			$stmt = $this->db->prepare(
				"UPDATE admin_notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ?"
			);
			$stmt->execute([$id]);

			echo json_encode(['message' => 'Notification marked as read', 'changes' => $stmt->rowCount()]);
		} catch (PDOException $e) {
			http_response_code(500);
			echo json_encode(['error' => $e->getMessage()]);
		}
	}

	/**
	 * Mark all notifications as read
	 * PUT /api/admin/notifications/read-all
	 */
	public function markAllRead() {
		AuthMiddleware::authenticateAdmin();

		try {
			$this->ensureTable();

			$stmt = $this->db->query(
				"UPDATE admin_notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE is_read = 0"
			);

			echo json_encode(['message' => 'All notifications marked as read']);
		} catch (PDOException $e) {
			http_response_code(500);
			echo json_encode(['error' => $e->getMessage()]);
		}
	}

	/**
	 * Ensure notifications table exists (safe no-op if it already exists)
	 */
	private function ensureTable() {
		$this->db->exec(
			"CREATE TABLE IF NOT EXISTS admin_notifications (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				type TEXT,
				title TEXT,
				message TEXT,
				entity_type TEXT,
				entity_id INTEGER,
				is_read INTEGER DEFAULT 0,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				read_at DATETIME
			)"
		);
	}
}


