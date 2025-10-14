/**
 * Custom Notification System for Literary Escape
 * Beautiful toast notifications with animations and customization
 */

class CustomNotifications {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.defaultDuration = 4000;
        this.init();
    }

    init() {
        // Create notification container if it doesn't exist
        if (!document.querySelector('.notification-container')) {
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.notification-container');
        }
    }

    /**
     * Show a notification
     * @param {string} message - The message to display
     * @param {string} type - Type of notification: 'success', 'error', 'warning', 'info'
     * @param {string} title - Optional title for the notification
     * @param {number} duration - Duration in milliseconds (0 for persistent)
     */
    show(message, type = 'info', title = null, duration = null) {
        const id = this.generateId();
        const notification = this.createNotification(id, message, type, title, duration);
        
        // Add to container
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Trigger entrance animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-dismiss if duration is set
        const dismissDuration = duration || this.defaultDuration;
        if (dismissDuration > 0) {
            this.startProgressBar(notification, dismissDuration);
            setTimeout(() => {
                this.dismiss(id);
            }, dismissDuration);
        }

        return id;
    }

    /**
     * Convenience methods for different notification types
     */
    success(message, title = 'Success!', duration = null) {
        return this.show(message, 'success', title, duration);
    }

    error(message, title = 'Error!', duration = null) {
        return this.show(message, 'error', title, duration);
    }

    warning(message, title = 'Warning!', duration = null) {
        return this.show(message, 'warning', title, duration);
    }

    info(message, title = 'Info', duration = null) {
        return this.show(message, 'info', title, duration);
    }

    /**
     * Show login required notification with consistent styling
     */
    loginRequired(action = 'perform this action') {
        return this.warning(
            `You need to be logged in to ${action}. Please sign in to continue.`,
            'Login Required',
            5000
        );
    }

    /**
     * Create notification element
     */
    createNotification(id, message, type, title, duration) {
        const notification = document.createElement('div');
        notification.className = `custom-notification ${type}`;
        notification.setAttribute('data-id', id);

        const icon = this.getIcon(type);
        const titleHtml = title ? `<div class="notification-title">${this.escapeHtml(title)}</div>` : '';
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icon}"></i>
            </div>
            <div class="notification-content">
                ${titleHtml}
                <div class="notification-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="notification-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
            ${duration > 0 ? '<div class="notification-progress"></div>' : ''}
        `;

        // Add close button functionality
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            this.dismiss(id);
        });

        // Add click to dismiss (optional)
        notification.addEventListener('click', (e) => {
            if (e.target === notification || e.target.classList.contains('notification-content')) {
                this.dismiss(id);
            }
        });

        return notification;
    }

    /**
     * Start progress bar animation
     */
    startProgressBar(notification, duration) {
        const progressBar = notification.querySelector('.notification-progress');
        if (progressBar) {
            // Start progress animation
            setTimeout(() => {
                progressBar.style.width = '0%';
                progressBar.style.transition = `width ${duration}ms linear`;
            }, 10);
        }
    }

    /**
     * Get icon class for notification type
     */
    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Dismiss a notification
     */
    dismiss(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.classList.add('hide');
            notification.classList.remove('show');
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 400); // Match CSS transition duration
        }
    }

    /**
     * Dismiss all notifications
     */
    dismissAll() {
        this.notifications.forEach((notification, id) => {
            this.dismiss(id);
        });
    }

    /**
     * Generate unique ID for notifications
     */
    generateId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
}

// Create global instance
window.notifications = new CustomNotifications();

// Convenience global functions for easy use
window.showNotification = (message, type = 'info', title = null, duration = null) => {
    return window.notifications.show(message, type, title, duration);
};

window.showSuccess = (message, title = 'Success!', duration = null) => {
    return window.notifications.success(message, title, duration);
};

window.showError = (message, title = 'Error!', duration = null) => {
    return window.notifications.error(message, title, duration);
};

window.showWarning = (message, title = 'Warning!', duration = null) => {
    return window.notifications.warning(message, title, duration);
};

window.showInfo = (message, title = 'Info', duration = null) => {
    return window.notifications.info(message, title, duration);
};

window.showLoginRequired = (action = 'perform this action') => {
    return window.notifications.loginRequired(action);
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.notifications.init();
    });
} else {
    window.notifications.init();
}