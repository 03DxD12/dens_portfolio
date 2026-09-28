/**
 * CENTRALIZED DEADLINE SERVICE - Deadline Buddy
 * Calculates urgency levels, countdown strings, and relative times.
 */

function parseTaskDueDateTime(dueDate, dueTime) {
    if (!dueDate) return new Date();
    // Handle full ISO date string (e.g., "2026-09-24T17:00:00.000Z")
    if (typeof dueDate === 'string' && dueDate.includes('T')) {
        const parsed = new Date(dueDate);
        if (!isNaN(parsed.getTime())) return parsed;
    }
    // Handle YYYY-MM-DD
    const parts = String(dueDate).split('T')[0].split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const timeParts = (dueTime || '23:59').split(':');
        const hours = parseInt(timeParts[0] || '23', 10);
        const minutes = parseInt(timeParts[1] || '59', 10);
        const d = new Date(year, month, day, hours, minutes, 0, 0);
        if (!isNaN(d.getTime())) return d;
    }
    const d = new Date(dueDate);
    return isNaN(d.getTime()) ? new Date() : d;
}

function getDeadlineState(task) {
    if (!task) return { status: 'Normal', label: 'Upcoming', badgeClass: 'badge-normal', isOverdue: false };
    if (task.status === 'Completed') {
        return {
            urgencyKey: 'COMPLETED',
            urgencyLabel: 'Completed',
            badgeClass: 'badge-completed',
            isOverdue: false
        };
    }

    const now = new Date();
    const dueDateTime = parseTaskDueDateTime(task.dueDate, task.dueTime);
    const diffMs = dueDateTime - now;

    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = todayStr === (typeof task.dueDate === 'string' ? task.dueDate.split('T')[0] : '');

    if (diffMs < 0) {
        return {
            urgencyKey: 'OVERDUE',
            urgencyLabel: 'OVERDUE',
            badgeClass: 'badge-urgent',
            isOverdue: true
        };
    }

    if (isToday) {
        return {
            urgencyKey: 'DUE_TODAY',
            urgencyLabel: 'DUE TODAY',
            badgeClass: 'badge-upcoming',
            isOverdue: false
        };
    }

    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours <= 24) {
        return {
            urgencyKey: 'URGENT',
            urgencyLabel: 'URGENT',
            badgeClass: 'badge-urgent',
            isOverdue: false
        };
    } else if (diffDays <= 3) {
        return {
            urgencyKey: 'DUE_SOON',
            urgencyLabel: 'DUE SOON',
            badgeClass: 'badge-upcoming',
            isOverdue: false
        };
    } else if (diffDays <= 7) {
        return {
            urgencyKey: 'COMING_UP',
            urgencyLabel: 'COMING UP',
            badgeClass: 'badge-normal',
            isOverdue: false
        };
    } else {
        return {
            urgencyKey: 'NORMAL',
            urgencyLabel: 'UPCOMING',
            badgeClass: 'badge-normal',
            isOverdue: false
        };
    }
}

function getTimeRemainingText(task) {
    if (!task || task.status === 'Completed') {
        return 'Task Completed';
    }

    const now = new Date();
    const dueDateTime = parseTaskDueDateTime(task.dueDate, task.dueTime);
    const diffMs = dueDateTime - now;

    if (diffMs < 0) {
        const overdueMs = Math.abs(diffMs);
        const totalSecs = Math.floor(overdueMs / 1000);
        const days = Math.floor(totalSecs / (3600 * 24));
        const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);

        if (days > 0) return `Overdue by ${days}d ${hours}h`;
        if (hours > 0) return `Overdue by ${hours}h ${mins}m`;
        return `Overdue by ${mins}m`;
    } else {
        const totalSecs = Math.floor(diffMs / 1000);
        const days = Math.floor(totalSecs / (3600 * 24));
        const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);

        if (days > 0) return `${days}d ${hours}h remaining`;
        if (hours > 0) return `${hours}h ${mins}m remaining`;
        return `${mins}m remaining`;
    }
}

function getChecklistProgress(subtasks) {
    if (!subtasks || subtasks.length === 0) return 'No checklist steps';
    const completed = subtasks.filter(s => s.completed || s.isCompleted).length;
    return `${completed} of ${subtasks.length} completed`;
}

function enrichTask(task, subjects) {
    if (!task) return null;
    const subMap = (subjects || []).reduce((acc, s) => {
        acc[s.id] = s;
        return acc;
    }, {});

    const subject = subMap[task.subjectId] || { subjectName: 'General' };
    const dueDateTime = parseTaskDueDateTime(task.dueDate, task.dueTime);
    const state = getDeadlineState(task);

    return {
        ...task,
        subjectName: subject.subjectName || subject.name || 'General',
        teacherName: subject.teacherName || subject.teacher || '',
        dueIsoString: dueDateTime.toISOString(),
        urgencyKey: state.urgencyKey,
        urgencyLabel: state.urgencyLabel,
        badgeClass: state.badgeClass,
        isOverdue: state.isOverdue,
        timeRemainingText: getTimeRemainingText(task),
        checklistProgressText: getChecklistProgress(task.subtasks)
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// DEADLINE NAMESPACE OBJECT
// ─────────────────────────────────────────────────────────────────────────────
const Deadline = {
    parseTaskDueDateTime(dueDate, dueTime) {
        return parseTaskDueDateTime(dueDate, dueTime);
    },

    getUrgencyState(dueDate, dueTime, status) {
        if (status === 'Completed') {
            return {
                status: 'Completed',
                label: 'Completed',
                badgeClass: 'badge-completed',
                isOverdue: false
            };
        }

        const now = new Date();
        const target = parseTaskDueDateTime(dueDate, dueTime);
        const diffMs = target - now;
        const diffMins = Math.ceil(diffMs / (1000 * 60));
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffMs < 0) {
            return {
                status: 'Overdue',
                label: 'Overdue',
                badgeClass: 'badge-urgent pulse-urgent',
                isOverdue: true
            };
        }

        if (diffMs <= 20 * 60 * 1000) {
            return {
                status: 'Due in 20 Minutes',
                label: diffMins <= 0 ? 'Due Now' : `${diffMins}m Left`,
                badgeClass: 'badge-urgent pulse-urgent',
                isOverdue: false
            };
        }

        if (diffMs <= 24 * 60 * 60 * 1000) {
            return {
                status: 'Due within 1 Day',
                label: `${Math.ceil(diffHours)}h Left`,
                badgeClass: 'badge-upcoming',
                isOverdue: false
            };
        }

        const days = Math.ceil(diffHours / 24);
        return {
            status: 'Upcoming',
            label: `${days}d Left`,
            badgeClass: 'badge-normal',
            isOverdue: false
        };
    },

    formatDeadline(dueDate, dueTime) {
        const d = parseTaskDueDateTime(dueDate, dueTime);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    getDeadlineState(task) {
        return getDeadlineState(task);
    },

    getTimeRemainingText(task) {
        return getTimeRemainingText(task);
    },

    getChecklistProgress(subtasks) {
        return getChecklistProgress(subtasks);
    },

    enrichTask(task, subjects) {
        return enrichTask(task, subjects);
    }
};
