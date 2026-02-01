

## Fix: Allow Public Viewers to Access Self-Hosted Webinar Pages

### Problem Identified

The `/watch/:id` and `/replay/:id` routes are correctly configured as public (no `ProtectedRoute` wrapper), but the **database-level RLS policy** on the `webinars` table blocks unauthenticated users from reading webinar data.

Current RLS SELECT policy:
```sql
-- Only owners and admins can view webinars
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'))
```

This means when an anonymous viewer visits `/watch/abc123`, the Supabase query returns no data because RLS denies access.

---

### Solution

Add a new RLS policy that allows **public read access** to webinars. This is safe because:
1. The embed code and replay pages need to fetch webinar settings to display
2. No sensitive data is exposed (just video URLs, styling, and settings)
3. INSERT/UPDATE/DELETE remain protected (owners only)

---

### Implementation Steps

#### Step 1: Add Public SELECT Policy

Create a database migration to add a permissive policy for anonymous SELECT:

```sql
-- Allow anyone (including anonymous) to read webinar data
-- This enables the public /watch and /replay pages to function
CREATE POLICY "Anyone can view webinars for public pages"
ON public.webinars
FOR SELECT
TO anon, authenticated
USING (true);
```

This policy will work alongside the existing policy. Since both are permissive, either one granting access is sufficient.

#### Step 2: Verify No Code Changes Needed

The frontend code in `WatchWebinar.tsx` and `ReplayWebinar.tsx` already:
- Uses `maybeSingle()` for safe single-row queries
- Handles errors gracefully
- Shows appropriate error states

No changes needed - just the RLS policy fix.

---

### Technical Details

| Aspect | Current Behavior | After Fix |
|--------|------------------|-----------|
| `/watch/:id` anonymous access | Blocked by RLS | Allowed |
| `/replay/:id` anonymous access | Blocked by RLS | Allowed |
| Webinar owner access | Allowed | Allowed |
| Admin access | Allowed | Allowed |
| Create/Update/Delete | Owner only | Owner only (unchanged) |

---

### Security Considerations

- **Safe to expose**: Webinar config data (video URLs, colors, CTA text) is intentionally public-facing content
- **Still protected**: INSERT, UPDATE, DELETE operations remain restricted to owners/admins
- **No PII exposed**: The webinars table contains settings, not user data

