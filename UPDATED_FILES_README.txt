AURA ACCESS PRO - UPDATED FILES

Based on the production snapshot AuraAccess-Pro-CURRENT.

Included fixes:
- Client renewal passes client context and auto-selects its latest active/frozen membership.
- Renewal creates and activates the selected membership.
- Client permanent deletion with dependent-record cleanup and PWA access removal.
- Remember Me requests a 30-day JWT; normal sessions remain 12 hours.
- Manager/root PWA dashboard uses the authenticated /dashboard endpoint.
- PWA service worker does not cache live API data, so Desktop/PWA reservations stay current.

Deploy only after copying the files to the project and running node --check.
