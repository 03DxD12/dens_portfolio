/**
 * STORAGE SERVICE - Deadline Buddy
 * Handles all localStorage operations and JSON Backup Export/Import.
 */

const STORAGE_KEYS = {
    USER: 'deadlinebuddy_user',
    SUBJECTS: 'deadlinebuddy_subjects',
    TASKS: 'deadlinebuddy_tasks',
    NOTIFICATIONS: 'deadlinebuddy_notifications'
};

// Seed initial Grade 12 ASSH demo data if storage is empty
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
        const defaultUser = {
            fullName: 'Andrea Santos',
            email: 'andrea@olinsterg.edu.ph',
            gradeLevel: 'Grade 12',
            section: 'ASSH',
            track: 'Academic Track'
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
        const defaultSubjects = [
            { id: 1, subjectName: 'Creative Writing', teacherName: 'Mrs. Santos', notes: 'MWF 9:00 AM - Room 204' },
            { id: 2, subjectName: 'Practical Research 2', teacherName: 'Mr. Ramos', notes: 'TTH 1:00 PM - Lab 3' },
            { id: 3, subjectName: 'General Mathematics', teacherName: 'Ms. Reyes', notes: 'MWF 11:00 AM' }
        ];
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(defaultSubjects));
    }

    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const inThreeDays = new Date(today);
        inThreeDays.setDate(today.getDate() + 3);

        const defaultTasks = [
            {
                id: 101,
                subjectId: 2,
                title: 'Research Chapter 2 Draft',
                description: 'Complete Chapter 2 draft detailing related literature, conceptual framework, and methodology.',
                taskType: 'Research',
                priority: 'High',
                status: 'In Progress',
                dueDate: tomorrow.toISOString().split('T')[0],
                dueTime: '23:59',
                notes: 'Submit printed copy to Mr. Ramos',
                createdAt: new Date().toISOString(),
                subtasks: [
                    { id: 1, title: 'Find 5 local related studies', isCompleted: true },
                    { id: 2, title: 'Write conceptual framework', isCompleted: true },
                    { id: 3, title: 'Draft methodology chapter', isCompleted: false },
                    { id: 4, title: 'Review APA citations', isCompleted: false }
                ]
            },
            {
                id: 102,
                subjectId: 1,
                title: 'Reflection Paper on Modern Poetry',
                description: 'Write a 500-word reflection essay analyzing contemporary Philippine poetry.',
                taskType: 'Reflection Paper',
                priority: 'Medium',
                status: 'Pending',
                dueDate: inThreeDays.toISOString().split('T')[0],
                dueTime: '17:00',
                notes: 'Submit via PDF output',
                createdAt: new Date().toISOString(),
                subtasks: [
                    { id: 1, title: 'Select 2 poems for analysis', isCompleted: true },
                    { id: 2, title: 'Write draft essay', isCompleted: false }
                ]
            }
        ];
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(defaultTasks));
    }

    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    }
}

// User Operations
function getUser() {
    initStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
}

function saveUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

// Subject Operations
function getSubjects() {
    initStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECTS)) || [];
}

function saveSubjects(subjects) {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
}

function addSubject(subData) {
    const subjects = getSubjects();
    const newSub = {
        id: Date.now(),
        subjectName: subData.subjectName.trim(),
        teacherName: subData.teacherName ? subData.teacherName.trim() : '',
        notes: subData.notes ? subData.notes.trim() : ''
    };
    subjects.push(newSub);
    saveSubjects(subjects);
    return newSub;
}

function updateSubject(id, subData) {
    const subjects = getSubjects();
    const index = subjects.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
        subjects[index] = {
            ...subjects[index],
            subjectName: subData.subjectName.trim(),
            teacherName: subData.teacherName ? subData.teacherName.trim() : '',
            notes: subData.notes ? subData.notes.trim() : ''
        };
        saveSubjects(subjects);
    }
}

function deleteSubject(id) {
    const tasks = getTasks();
    const attachedTasks = tasks.filter(t => t.subjectId === parseInt(id));
    if (attachedTasks.length > 0) {
        throw new Error(`Cannot delete subject. It has ${attachedTasks.length} active requirement(s). Delete tasks first.`);
    }

    const subjects = getSubjects().filter(s => s.id !== parseInt(id));
    saveSubjects(subjects);
}

// Task Operations
function getTasks() {
    initStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
}

function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

function getTaskById(id) {
    const tasks = getTasks();
    return tasks.find(t => t.id === parseInt(id)) || null;
}

function saveTaskForm(taskData) {
    const tasks = getTasks();
    const parsedSubjectId = parseInt(taskData.subjectId);

    if (taskData.id) {
        // Edit existing
        const index = tasks.findIndex(t => t.id === parseInt(taskData.id));
        if (index !== -1) {
            tasks[index] = {
                ...tasks[index],
                subjectId: parsedSubjectId,
                title: taskData.title.trim(),
                description: taskData.description ? taskData.description.trim() : '',
                taskType: taskData.taskType || 'Assignment',
                priority: taskData.priority || 'Medium',
                status: taskData.status || 'Pending',
                dueDate: taskData.dueDate,
                dueTime: taskData.dueTime || '23:59',
                notes: taskData.notes ? taskData.notes.trim() : ''
            };
            saveTasks(tasks);
            return tasks[index];
        }
    } else {
        // Create new
        const newTask = {
            id: Date.now(),
            subjectId: parsedSubjectId,
            title: taskData.title.trim(),
            description: taskData.description ? taskData.description.trim() : '',
            taskType: taskData.taskType || 'Assignment',
            priority: taskData.priority || 'Medium',
            status: taskData.status || 'Pending',
            dueDate: taskData.dueDate,
            dueTime: taskData.dueTime || '23:59',
            notes: taskData.notes ? taskData.notes.trim() : '',
            createdAt: new Date().toISOString(),
            subtasks: []
        };
        tasks.push(newTask);
        saveTasks(tasks);
        return newTask;
    }
}

function updateTaskStatus(id, newStatus) {
    const tasks = getTasks();
    const index = tasks.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
        tasks[index].status = newStatus;
        tasks[index].completedAt = newStatus === 'Completed' ? new Date().toISOString() : null;
        saveTasks(tasks);
    }
}

function deleteTask(id) {
    const tasks = getTasks().filter(t => t.id !== parseInt(id));
    saveTasks(tasks);
}

// Subtask Operations
function addSubtask(taskId, title) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (task) {
        if (!task.subtasks) task.subtasks = [];
        task.subtasks.push({
            id: Date.now(),
            title: title.trim(),
            isCompleted: false
        });
        saveTasks(tasks);
    }
}

function toggleSubtask(taskId, subtaskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (task && task.subtasks) {
        const sub = task.subtasks.find(s => s.id === parseInt(subtaskId));
        if (sub) {
            sub.isCompleted = !sub.isCompleted;
            saveTasks(tasks);
        }
    }
}

function deleteSubtask(taskId, subtaskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (task && task.subtasks) {
        task.subtasks = task.subtasks.filter(s => s.id !== parseInt(subtaskId));
        saveTasks(tasks);
    }
}

// Notifications Operations
function getNotifications() {
    initStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
}

function saveNotifications(notifs) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
}

function clearNotifications() {
    saveNotifications([]);
}

// Export Backup JSON
function exportBackupJSON() {
    const data = {
        user: getUser(),
        subjects: getSubjects(),
        tasks: getTasks(),
        notifications: getNotifications(),
        exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `deadline-buddy-saved-records-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import Backup JSON
function importBackupJSON(jsonStr) {
    try {
        const data = JSON.parse(jsonStr);
        if (!data || typeof data !== 'object') {
            throw new Error('The selected file is not a valid Deadline Buddy backup.');
        }
        if (data.user) saveUser(data.user);
        if (data.subjects) saveSubjects(data.subjects);
        if (data.tasks) saveTasks(data.tasks);
        if (data.notifications) saveNotifications(data.notifications);
        return { success: true };
    } catch (err) {
        console.error('Import failed:', err);
        return { success: false, error: err.message || 'Invalid backup file.' };
    }
}

function seedDemoData() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    initStorage();
}

// Auto-init on script load
initStorage();

// ─────────────────────────────────────────────────────────────────────────────
// Storage NAMESPACE — used by subjects.html, task-form.html, and other pages.
// Bridges bare functions above with the dot-notation API the pages expect,
// and normalises field names between storage format and UI format.
// ─────────────────────────────────────────────────────────────────────────────
const Storage = {
    // ── Helpers ──────────────────────────────────────────────────────────────
    generateId() {
        return Date.now() + Math.floor(Math.random() * 9999);
    },

    // ── User ─────────────────────────────────────────────────────────────────
    getUser()          { return getUser(); },
    saveUser(u)        { return saveUser(u); },

    // ── Subjects ─────────────────────────────────────────────────────────────
    // Internal storage uses { subjectName, teacherName, notes }.
    // The UI uses { name, teacher, schedule } — bridge both directions.
    getSubjects() {
        return getSubjects().map(s => ({
            id:       s.id,
            name:     s.subjectName || s.name || '',
            teacher:  s.teacherName  || s.teacher  || '',
            schedule: s.notes        || s.schedule  || '',
            // keep originals too so other code still works
            subjectName: s.subjectName || s.name || '',
            teacherName: s.teacherName  || s.teacher  || '',
            notes:       s.notes        || s.schedule  || ''
        }));
    },

    saveSubject(data) {
        const subjects = getSubjects();
        const newSub = {
            id:          Date.now(),
            subjectName: (data.name || data.subjectName || '').trim(),
            teacherName: (data.teacher || data.teacherName || '').trim(),
            notes:       (data.schedule || data.notes || '').trim()
        };
        subjects.push(newSub);
        saveSubjects(subjects);
        return newSub;
    },

    updateSubject(id, data) {
        const subjects = getSubjects();
        const idx = subjects.findIndex(s => String(s.id) === String(id));
        if (idx !== -1) {
            subjects[idx] = {
                ...subjects[idx],
                subjectName: (data.name || data.subjectName || '').trim(),
                teacherName: (data.teacher || data.teacherName || '').trim(),
                notes:       (data.schedule || data.notes || '').trim()
            };
            saveSubjects(subjects);
        }
    },

    deleteSubject(id) {
        // Remove subject; tasks that referenced it become subjectless
        const subjects = getSubjects().filter(s => String(s.id) !== String(id));
        saveSubjects(subjects);
    },

    // ── Tasks ────────────────────────────────────────────────────────────────
    getTasks()         { return getTasks(); },

    saveTask(data) {
        const tasks = getTasks();
        const newTask = {
            id:          Date.now(),
            subjectId:   data.subjectId ? parseInt(data.subjectId) : null,
            title:       (data.title || '').trim(),
            type:        data.type || data.taskType || 'Assignment',
            description: (data.description || '').trim(),
            priority:    data.priority || 'Medium',
            status:      data.status || 'Pending',
            dueDate:     data.dueDate || new Date().toISOString(),
            notes:       (data.notes || '').trim(),
            createdAt:   new Date().toISOString(),
            subtasks:    data.subtasks || []
        };
        tasks.push(newTask);
        saveTasks(tasks);
        return newTask;
    },

    updateTask(id, data) {
        const tasks = getTasks();
        const idx = tasks.findIndex(t => String(t.id) === String(id));
        if (idx !== -1) {
            tasks[idx] = {
                ...tasks[idx],
                subjectId:   data.subjectId ? parseInt(data.subjectId) : tasks[idx].subjectId,
                title:       (data.title || '').trim(),
                type:        data.type || data.taskType || tasks[idx].type,
                description: (data.description || '').trim(),
                priority:    data.priority || tasks[idx].priority,
                status:      data.status   || tasks[idx].status,
                dueDate:     data.dueDate  || tasks[idx].dueDate,
                notes:       (data.notes   || '').trim(),
                subtasks:    data.subtasks !== undefined ? data.subtasks : tasks[idx].subtasks
            };
            saveTasks(tasks);
        }
    },

    deleteTask(id)            { return deleteTask(id); },
    updateTaskStatus(id, s)   { return updateTaskStatus(id, s); },
    getTaskById(id)           { return getTaskById(id); },

    // ── Subtasks ─────────────────────────────────────────────────────────────
    addSubtask(taskId, title)              { return addSubtask(taskId, title); },
    toggleSubtask(taskId, subtaskId)       { return toggleSubtask(taskId, subtaskId); },
    deleteSubtask(taskId, subtaskId)       { return deleteSubtask(taskId, subtaskId); },

    // ── Notifications ────────────────────────────────────────────────────────
    getNotifications()    { return getNotifications(); },
    saveNotifications(n)  { return saveNotifications(n); },
    clearNotifications()  { return clearNotifications(); },

    // ── Backup / Restore ─────────────────────────────────────────────────────
    exportBackupJSON()          { return exportBackupJSON(); },
    importBackupJSON(jsonStr)   { return importBackupJSON(jsonStr); },
    seedDemoData()              { return seedDemoData(); }
};
