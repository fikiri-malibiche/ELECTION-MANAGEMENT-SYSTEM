# TODO - Professionalization & Security Hardening

## Done
- Added CSRF token loader script to these admin pages:
  - `HTML/admin_dashboard.html`
  - `HTML/admin_candidates.html`
  - `HTML/admin_add_candidate.html`
  - `HTML/admin_voters.html`
  - `HTML/admin_vote_details.html`
- Added CSRF token to `JS/admin_add_candidate.js` when uploading candidates.
- Updated backend endpoints to enforce CSRF + hardened session/auth behavior:
  - `PHP/api/add_candidate.php`
  - `PHP/api/delete_candidate.php`
  - `PHP/api/vote.php`
  - `PHP/api/confirm_vote.php`
  - `PHP/api/verify_user.php`
  - `PHP/connection.php` now reads DB creds from env vars (fallbacks retained).
  - `PHP/login.php` and `PHP/adminLogin.php` now harden session cookies and regenerate session id on login.
  - `PHP/logout.php` improved session clearing.

## Remaining (must do to “clear all weaknesses” fully)
1. **CSRF integration for voter voting flow**
   - Ensure frontend sends `csrf_token` for vote actions:
     - `HTML/voter_dashboard.html`
     - `JS/vote.js`
     - and any other call to `PHP/api/confirm_vote.php`.
2. **Add DB-level uniqueness for votes**
   - In MySQL: enforce `UNIQUE(voter_id)` (or equivalent) on `votes` table.
   - (If constraint already exists, verify it.)
3. **Rate limiting / brute force protection**
   - Add throttling for `PHP/login.php` and `PHP/adminLogin.php`.
4. **Consistent response schema**
   - Ensure all APIs return `{success: true/false, ...}` uniformly (e.g. `PHP/api/check_vote.php`).
5. **Remove production console logging**
- Strip or disable `console.log` in frontend files (login/vote/admin JS).

6. **Eliminate remaining unsafe `innerHTML` usage where possible**
   - Prefer `textContent` for untrusted strings.
7. **Verify all admin state-changing endpoints use CSRF**
   - Also scan any other `PHP/api/*` write endpoints not yet updated.

## Testing to perform
- Verify login/logout flows for voter/admin/manager.
- Verify admin add/delete candidate.
- Verify admin approve/reject pending voters.
- Verify voter confirm vote + double-vote prevention.
- Verify CSRF rejection when token missing/changed.

