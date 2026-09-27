# API module map

Create modules only when the active task needs them. Planned domain boundaries:

- auth / identity / tenant-context / access-control
- organizations / facilities
- people / parent-student
- subjects / media
- classes / teacher-assignments / enrollment
- scheduling / holidays / teaching-sessions / progress
- attendance / makeup
- tuition
- teacher-workload
- ratings
- audit

Do not create separate deployable services for these domains during the baseline.
