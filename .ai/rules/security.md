# Security Rules

Never optimize away:

- tenant isolation;
- IDOR/resource ownership checks;
- active workspace permission checks;
- parent-child relationship checks;
- password/token secrecy;
- last-admin/self-lockout protection;
- scheduling conflict validation;
- audit for required material mutations.

Secrets belong in environment configuration, never source/docs/logs.
