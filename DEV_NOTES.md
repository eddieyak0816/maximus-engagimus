# Developer Notes — Maximus Engagimus

**Last Updated:** February 4, 2026

## Performance Architecture

### Overview

Maximus Engagimus uses a 4-layer performance optimization strategy to deliver enterprise-level responsiveness:

1. **Smart Session Management** - Minimal server validation
2. **Client-Side Caching** - localStorage with TTL
3. **Service Worker** - Offline support and asset caching
4. **Optimistic Updates** - Instant UI feedback

### Layer 1: Smart Session Management

**File:** `src/contexts/AuthContext.jsx`

**Strategy:**
- Only fetch fresh profile data on `SIGNED_IN` event (fresh login)
- All other events (`INITIAL_SESSION`, `TOKEN_REFRESHED`, visibility changes) use cached profile
- Session check timeout: 2 seconds
- Profile fetch timeout: 2 seconds
- Never clear profile on timeout - keep existing cached data

**Why:**
- Supabase's visibility change detection was triggering profile re-fetch with long timeouts
- This caused 8+ second delays when switching windows back to the app
- New approach: trust cached data, only validate on actual login

**Code Pattern:**
```javascript
if (event === 'SIGNED_IN') {
  // Fresh login - fetch profile from server
  const profileData = await Promise.race([
    getUserProfile(),
    new Promise((_, reject) => setTimeout(() => reject(...), 2000))
  ]);
  setCached('userProfile', profileData, 10 * 60 * 1000);
} else {
  // All other events - use cache
  const cached = getCached('userProfile');
  if (cached) setProfile(cached);
}
```

### Layer 2: Client-Side Caching

**File:** `src/lib/cache.js`

**Implementation:**
- Uses localStorage with `app_cache_` prefix
- Each entry stored with `expiresAt` timestamp
- Automatically removes expired entries on read
- Supports custom TTL per cache entry

**Functions:**
- `getCached(key)` - Retrieve if not expired
- `setCached(key, data, ttl)` - Store with expiration
- `clearCache(key)` - Remove specific entry
- `clearAllCaches()` - Wipe all app caches
- `fetchWithCache(key, fetchFn, ttl)` - Fetch with automatic caching

**Default TTLs:**
- Profile data: 10 minutes (600,000ms)
- Client list: 10 minutes
- History data: 5 minutes
- Auth session: Unlimited (cleared on logout)

**Files Using Cache:**
- `src/contexts/AuthContext.jsx` - User profile
- `src/hooks/useClients.js` - Client list and details
- `src/hooks/useHistory.js` - Comment history and stats

### Layer 3: Service Worker

**File:** `public/service-worker.js`

**Strategy:**
- Cache-first for static assets (JS, CSS, images)
- Network-first for API calls
- Skips Supabase API endpoints (let browser handle)
- Only caches successful GET requests (status 200)

**Lifecycle:**
- Install: Caches essential files
- Activate: Cleans old caches
- Fetch: Intercepts and caches same-origin GET requests

**Registration:** `src/main.jsx`

### Layer 4: Optimistic Updates

**File:** `src/hooks/useClients.js`

**Strategy:**
- Show changes immediately in UI
- Sync to server in background
- Rollback on error

**Example (Create Client):**
```javascript
// 1. Create optimistic client with temp ID
const optimisticClient = { id: `temp-${Date.now()}`, ...clientData };
setClients(prev => [...prev, optimisticClient]);

// 2. Sync to server
const newClient = await createSupabaseClient(clientData);

// 3. Replace temp with real
setClients(prev => 
  prev.map(c => c.id === optimisticClient.id ? newClient : c)
);

// 4. On error - rollback
catch (err) {
  setClients(prev => prev.filter(c => !c.id.startsWith('temp-')));
}
```

## Timeout Strategy

**Standard:** All network requests use 2-second timeout (enterprise standard)

**Files:**
- `src/contexts/AuthContext.jsx`: 2s (session check, profile fetch)
- `src/hooks/useClients.js`: 2s (list and detail)
- `src/hooks/useHistory.js`: 2s (history and stats)

**Rationale:**
- Fast enough for normal networks to succeed
- Short enough that failures don't frustrate users
- Long enough for Supabase cold-start to complete
- Combined with caching, provides near-instant perceived performance

## Known Issues

**None currently documented.**

## Testing Performance

**Window Switch Test:**
1. Open app and navigate to any page
2. Switch to another window/app for 10+ seconds
3. Switch back to app
4. **Expected:** Page loads instantly from cache (0ms)
5. **Expected:** Fresh data syncs silently in background (~2s)

**First Load Test:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Navigate to app
3. **Expected:** Loading state shows briefly (~2s)
4. **Expected:** Data displays once loaded

**Optimistic Update Test:**
1. Go to Clients page
2. Create/edit/delete a client
3. **Expected:** Change appears instantly in UI
4. **Expected:** Toast confirms sync to server
5. **Expected:** If offline, change reverts with error toast

## Monitoring

**Browser Console Checks:**
```javascript
// Check cache size
Object.keys(localStorage).filter(k => k.startsWith('app_cache_')).length

// View cached profile
JSON.parse(localStorage.getItem('app_cache_userProfile'))

// Check Service Worker status
navigator.serviceWorker.controller ? 'Active' : 'Inactive'
```

## Future Improvements

1. **IndexedDB** - For larger cache storage (>5MB)
2. **BroadcastChannel** - Cross-tab cache invalidation
3. **Background Sync** - Queue mutations when offline
4. **Retry Logic** - Exponential backoff on failures
5. **Performance Monitoring** - Track timing metrics

## UI Guidance

- Do not show raw technical error messages to end users
- Map known errors to friendly messages with retry options
- Keep technical details in console logs and this document
- Show cached data with optional "stale" indicator if desired

## Debug Checklist (SOP)

**If performance degrades:**
1. Check Network tab for slow requests
2. Verify cache is working (localStorage inspector)
3. Check Service Worker status (Application tab)
4. Look for timeout errors in console
5. Test in Incognito (rules out extensions)
6. Clear cache and test fresh load

**If auth issues occur:**
1. Check localStorage for `app_cache_userProfile`
2. Verify Supabase session in Application > Storage
3. Test logout/login cycle
4. Check browser console for auth errors
5. Verify `.env` has correct Supabase credentials