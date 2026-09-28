/**
 * APP ENGINE - Deadline Buddy (Happy Hues Theme Engine)
 * Shared UI controller, sidebar drawer, notification bell, live ticker loop.
 */

document.addEventListener('DOMContentLoaded', function () {
    initCommonUI();
    updateLiveTimers();
    setInterval(updateLiveTimers, 1000);
});

function initCommonUI() {
    // Top bar info & User display elements
    if (typeof Storage !== 'undefined') {
        const user = Storage.getUser();

        const sidebarName = document.getElementById('sidebarName');
        const sidebarTrack = document.getElementById('sidebarTrack');
        const sidebarAvatar = document.getElementById('sidebarAvatar');

        if (sidebarName) sidebarName.innerText = user.name || 'Student';
        if (sidebarTrack) sidebarTrack.innerText = `${user.gradeLevel || 'Grade 12'} - ${user.strand || 'ASSH'}`;
        if (sidebarAvatar) sidebarAvatar.innerText = (user.name || 'G12').charAt(0).toUpperCase();

        const userNameEls = document.querySelectorAll('.user-name-display');
        userNameEls.forEach(el => el.innerText = user.name || 'Student');

        const userMetaEls = document.querySelectorAll('.user-meta-display');
        userMetaEls.forEach(el => el.innerText = `${user.gradeLevel || 'Grade 12'} • ${user.strand || 'ASSH'}`);

        const avatarEls = document.querySelectorAll('.avatar-display');
        avatarEls.forEach(el => {
            el.innerText = (user.name || 'A').charAt(0).toUpperCase();
        });
    }

    // Mobile menu drawer toggle logic
    const menuToggleBtn = document.getElementById('menuToggle') || document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
    
    if (menuToggleBtn && sidebar) {
        menuToggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });

        // Close sidebar on document click outside
        document.addEventListener('click', function (e) {
            if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !menuToggleBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Notification Bell Dropdown setup
    setupNotificationBell();

    // Password visibility toggle buttons
    const passToggleBtns = document.querySelectorAll('.password-toggle-btn');
    passToggleBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.innerText = '👁️‍🗨️';
                } else {
                    input.type = 'password';
                    btn.innerText = '👁️';
                }
            }
        });
    });

    // Auto-dismiss alert banners after 5s
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.style.display = 'none', 400);
        }, 6000);
    });
}

function setupNotificationBell() {
    const notifBtn = document.getElementById('notifBtn') || document.getElementById('notifBellBtn');
    const notifDropdown = document.getElementById('notifDropdown');
    const clearBtn = document.getElementById('clearNotifsBtn');

    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            notifDropdown.classList.toggle('hidden');
            notifDropdown.classList.toggle('show');
        });

        document.addEventListener('click', function (e) {
            if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
                notifDropdown.classList.add('hidden');
                notifDropdown.classList.remove('show');
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (typeof clearNotifications === 'function') clearNotifications();
            renderNotificationWidget();
        });
    }

    renderNotificationWidget();
}

function renderNotificationWidget() {
    if (typeof Storage !== 'undefined' && typeof getNotifications !== 'undefined') {
        // Use raw function directly for freshness
    }

    const notifs  = getNotifications();
    const unread  = notifs.filter(n => !n.isRead).length;
    const list    = document.getElementById('notifList');
    const badge   = document.getElementById('notifBadge') || document.getElementById('notifBadgeCount');

    // Badge: show count when there are unread alerts
    if (badge) {
        if (unread > 0) {
            badge.classList.remove('hidden');
            badge.textContent = unread > 9 ? '9+' : String(unread);
        } else {
            badge.classList.add('hidden');
            badge.textContent = '';
        }
    }

    if (!list) return;

    if (notifs.length === 0) {
        list.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:0.85rem;">No active alerts 🎉</div>';
        return;
    }

    // Color map matching notifications.js types
    const typeColors = {
        OVERDUE:    { dot: '#B51D54', bg: '#FFE5EC' },
        DUE_20_MIN: { dot: '#7A4D00', bg: '#FFF0C2' },
        DUE_1_DAY:  { dot: '#00664F', bg: '#E5FFF3' }
    };

    list.innerHTML = notifs.slice(0, 10).map(n => {
        const c   = typeColors[n.type] || { dot: '#64748B', bg: '#F8FAFC' };
        const ts  = n.timestamp || n.createdAt;
        const time = ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        return `
            <div class="notif-item" style="background:${c.bg};border-left:3px solid ${c.dot};border-radius:0;">
                <div style="font-weight:700;color:var(--text-heading);font-size:0.82rem;">${escapeHtml(n.title || 'Deadline Alert')}</div>
                <div style="color:var(--text-body);font-size:0.78rem;margin-top:2px;">${escapeHtml(n.message)}</div>
                ${time ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-top:3px;">${time}</div>` : ''}
            </div>
        `;
    }).join('');
}

function updateLiveTimers() {
    if (typeof Deadline === 'undefined') return;

    const timerElements = document.querySelectorAll('[data-due-date], [data-due-iso]');
    timerElements.forEach(function (el) {
        const isoStr = el.getAttribute('data-due-date') || el.getAttribute('data-due-iso');
        if (!isoStr) return;

        const urgency = Deadline.getUrgencyState(isoStr);

        // Update ticker text if element has class or is badge
        if (el.classList.contains('badge') || el.classList.contains('timer-badge')) {
            el.className = `badge ${urgency.badgeClass}`;
            el.textContent = urgency.label;
        } else if (el.tagName === 'SPAN' || el.tagName === 'DIV') {
            el.textContent = urgency.label;
        }
    });

    // Check notifications periodically via engine
    if (typeof NotificationsEngine !== 'undefined') {
        NotificationsEngine.checkDeadlinesAndNotify();
    }
}
