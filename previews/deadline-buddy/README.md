# Deadline Buddy

Deadline Buddy is a simple Grade 12 academic deadline tracker for students. It helps users save subjects, school requirements, due dates, reminders, and checklist steps.

## How To Open

This version is a static website. It does not need XAMPP, PHP, MySQL, Node.js, or a server.

Open this file in a browser:

```text
index.html
```

You can also open:

```text
dashboard.html
```

## Main Pages

- `index.html` - opening page
- `dashboard.html` - overview of deadlines and tasks
- `tasks.html` - list of requirements
- `task-form.html` - add or edit a requirement
- `task-details.html` - view one requirement and checklist
- `subjects.html` - manage subjects
- `calendar.html` - view deadlines by date
- `reminders.html` - deadline alerts and notification history
- `profile.html` - student profile and saved-records tools

## Features

- Add, edit, and delete academic requirements
- Add subjects
- Add checklist steps for each task
- Deadline status badges
- Alerts for overdue tasks
- Alerts 20 minutes before a deadline
- Alerts 1 day before a deadline
- Browser notification support
- Save and restore records using a downloaded file
- Reset sample records for practice or presentation

## Where Data Is Saved

The app saves records in the browser using local storage. This means records stay in the same browser on the same laptop.

If the user changes laptop or browser, they should use:

- **Download My Saved Records**
- **Bring Back My Saved Records**

These are found on the Profile page.

## Backup Explanation

**Download My Saved Records** saves a copy of the student's profile, subjects, deadlines, checklist steps, and alerts.

**Bring Back My Saved Records** loads that saved copy back into the app.

**Bring Back Sample Records** clears the records in the current browser and restores sample Grade 12 ASSH tasks. Use this only for practice or presentation.

## Project Structure

```text
css/
  style.css

js/
  app.js
  deadline.js
  notifications.js
  storage.js

*.html
```

## Notes For The Client

Because this is a browser-only project, there is no online database. Records are saved locally in the browser. To move records to another laptop or browser, use the saved-records feature on the Profile page.
