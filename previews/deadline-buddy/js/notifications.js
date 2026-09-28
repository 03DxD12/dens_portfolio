/**
 * DEADLINE NOTIFICATION SERVICE
 * Exact alert rules:
 * - OVERDUE: due date/time has passed and task is not completed
 * - DUE_20_MIN: due in 20 minutes or less
 * - DUE_1_DAY: due in 24 hours or less
 */

const DEADLINE_ALERTS = {
    OVERDUE_MS: 0,
    TWENTY_MIN_MS: 20 * 60 * 1000,
    ONE_DAY_MS: 24 * 60 * 60 * 1000,
    CHECK_INTERVAL_MS: 30 * 1000
};

function checkAndGenerateNotifications() {
    if (typeof getTasks !== 'function' || typeof parseTaskDueDateTime !== 'function') return;

    const tasks = getTasks();
    const stored = getNotifications();
    const now = new Date();
    let updated = false;

    tasks.forEach(task => {
        if (!task || task.status === 'Completed') return;

        const dueAt = parseTaskDueDateTime(task.dueDate, task.dueTime);
        const diffMs = dueAt - now;
        const alert = getDeadlineAlert(task, diffMs, dueAt);

        if (!alert) return;
        if (stored.some(n => n.triggerKey === alert.triggerKey)) return;

        const notif = {
            id: Date.now() + Math.floor(Math.random() * 9999),
            taskId: task.id,
            type: alert.type,
            title: alert.title,
            message: alert.message,
            triggerKey: alert.triggerKey,
            isRead: false,
            timestamp: now.toISOString(),
            createdAt: now.toISOString()
        };

        stored.unshift(notif);
        updated = true;
        showToast(notif.title, notif.message, notif.type);
        fireBrowserNotification(notif.title, notif.message);
    });

    if (updated) {
        saveNotifications(stored.slice(0, 50));
        renderNotificationWidget();
        document.title = `(${getNotifications().filter(n => !n.isRead).length}) Deadline Buddy`;
    }
}

function getDeadlineAlert(task, diffMs, dueAt) {
    const taskId = task.id || task.title;
    const dueText = dueAt.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    if (diffMs < DEADLINE_ALERTS.OVERDUE_MS) {
        return {
            type: 'OVERDUE',
            triggerKey: `TASK_${taskId}_OVERDUE`,
            title: 'Deadline overdue',
            message: `"${task.title}" was due ${dueText}.`
        };
    }

    if (diffMs <= DEADLINE_ALERTS.TWENTY_MIN_MS) {
        const mins = Math.max(0, Math.ceil(diffMs / 60000));
        return {
            type: 'DUE_20_MIN',
            triggerKey: `TASK_${taskId}_20_MIN`,
            title: '20-minute deadline warning',
            message: `"${task.title}" is due in ${mins} minute${mins === 1 ? '' : 's'} (${dueText}).`
        };
    }

    if (diffMs <= DEADLINE_ALERTS.ONE_DAY_MS) {
        const hours = Math.max(1, Math.ceil(diffMs / 3600000));
        return {
            type: 'DUE_1_DAY',
            triggerKey: `TASK_${taskId}_1_DAY`,
            title: '1-day deadline reminder',
            message: `"${task.title}" is due in about ${hours} hour${hours === 1 ? '' : 's'} (${dueText}).`
        };
    }

    return null;
}

function showToast(title, message, type) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.setAttribute('aria-live', 'polite');
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: '99999',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '380px',
            width: 'calc(100vw - 48px)'
        });
        document.body.appendChild(container);
    }

    const colors = {
        OVERDUE: { bg: '#ffe5ec', border: '#b51d54', label: 'Overdue' },
        DUE_20_MIN: { bg: '#fff0c2', border: '#7a4d00', label: '20 min' },
        DUE_1_DAY: { bg: '#e5fff3', border: '#00664f', label: '1 day' }
    }[type] || { bg: '#fffffe', border: '#33272a', label: 'Alert' };

    const toast = document.createElement('div');
    toast.setAttribute('role', 'alert');
    Object.assign(toast.style, {
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: '10px',
        padding: '14px 16px',
        boxShadow: '4px 4px 0 #33272a',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        cursor: 'pointer',
        transform: 'translateX(120%)',
        opacity: '0',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        fontFamily: 'Inter, system-ui, sans-serif'
    });

    toast.innerHTML = `
        <div style="font-weight:800;border:2px solid #33272a;border-radius:999px;padding:4px 8px;background:#fffffe;white-space:nowrap;">${colors.label}</div>
        <div style="flex:1;min-width:0">
            <div style="font-weight:800;font-size:0.9rem;color:#33272a;margin-bottom:3px;">${escapeHtml(title)}</div>
            <div style="font-size:0.82rem;color:#594a4e;line-height:1.4">${escapeHtml(message)}</div>
        </div>
        <button aria-label="Dismiss" style="background:none;border:none;cursor:pointer;font-size:1rem;color:#33272a;font-weight:800;">x</button>
    `;

    toast.querySelector('button').addEventListener('click', function (event) {
        event.stopPropagation();
        dismissToast(toast);
    });

    toast.addEventListener('click', function () {
        window.location.href = 'reminders.html';
    });

    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    });

    setTimeout(() => dismissToast(toast), type === 'OVERDUE' || type === 'DUE_20_MIN' ? 12000 : 8000);
}

function dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
}

function fireBrowserNotification(title, message) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
        try {
            new Notification(title, { body: message });
        } catch (error) {
            console.warn('Browser notification failed:', error);
        }
    }
}

function requestBrowserNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function getNotificationSummary() {
    checkAndGenerateNotifications();
    const notifications = getNotifications();
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return { notifications, unreadCount };
}

function markAllNotificationsRead() {
    const notifications = getNotifications();
    notifications.forEach(n => n.isRead = true);
    saveNotifications(notifications);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const NotificationsEngine = {
    checkDeadlinesAndNotify: checkAndGenerateNotifications
};

(function startNotificationLoop() {
    setTimeout(checkAndGenerateNotifications, 1200);
    setInterval(checkAndGenerateNotifications, DEADLINE_ALERTS.CHECK_INTERVAL_MS);
})();
