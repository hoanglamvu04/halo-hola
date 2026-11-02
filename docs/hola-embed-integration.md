# HOLA Embed Platform V1 → HALO HOLA

Integration target: `https://halohola.vn/hola-map`.

The old keyless URL `https://maps.dothihoalac.vn/embed` is not supported.
**HALO HOLA cannot approve or mint embed keys.** HOLA Maps is authoritative
for issuing, rotating, expiring, and revoking public `he_...` identifiers.

## Architecture and security

- The embed URL lives in the existing PostgreSQL `site_settings` row
  `setting_key = 'hola_embed'`, under JSON `{"embedUrl": "..." }`.
- **Admin → Cài đặt → Tích hợp HOLA Maps** uses
  `PUT /api/admin/hola-embed`, authorized only for HALO HOLA `ADMIN`.
  The generic CMS settings endpoint refuses changes to `hola_embed`.
- `GET /api/hola-embed` is public, uncached, and returns only
  `{"embedUrl":"<validated URL or empty string>"}`.
- The frontend revalidates this response before setting an iframe `src`.
  Invalid/missing URL = waiting screen, never a keyless iframe.
- `shared/holaEmbedUrl.js` enforces `https://maps.dothihoalac.vn`,
  exact `/embed`, `/embed/halo`, or `/embed/picker` path, and exactly
  one `key=he_` followed by 32 URL-safe characters.
- URL validation checks syntax **only**. HOLA Maps verifies active approval
  and controls CSP `frame-ancestors` separately on every iframe navigation.
- No client code uses or exposes `HOLA_MAPS_HALO_SECRET`. The separate
  `VITE_HOLA_MAPS_API_KEY` remains unchanged and is **not** an embed key.
- No `VITE_HOLA_MAPS_EMBED_URL` is required: the existing live Site Settings
  architecture enables rotating/clearing URLs without a rebuild or env edit.

## Partner registration and activation

1. Log into HOLA Maps with the designated account and open
   https://maps.dothihoalac.vn/developers/embed (or contact HOLA Maps Admin).
2. Submit the application name **HALO HOLA**, contact email, and exact
   approved HTTPS origin **https://halohola.vn**.
   Also request **https://www.halohola.vn** only if that origin serves the site.
3. Wait for HOLA Maps Admin approval/ownership verification.
4. Copy the actual `embedUrl` of the approved application. For the HALO
   story view, HOLA Maps may authorize `/embed/halo?key=...`.
   Do not fabricate a key, and do not paste an API secret.
5. HALO HOLA Admin → **Cài đặt** → **Tích hợp HOLA Maps**:
   paste the approved URL, check validation, optionally **Xem trước**,
   select **Lưu thay đổi**, then **Mở /hola-map**.
6. To rotate: obtain a new URL from HOLA Maps and replace the field.
   To disable HALO HOLA's iframe immediately: clear the field and save.
   HOLA Maps retains independent authority to revoke the grant.

## Manual production acceptance checklist (requires an approved key)

- [ ] Without a configured URL: `/hola-map` shows
      **HOLA Maps đang chờ kết nối**, no `iframe`, direct button works.
- [ ] Invalid hostname, missing key, and wrong path are rejected
      by Admin and public URL validator (automated backend tests cover this).
- [ ] Valid approved URL: iframe displays under Header without clipping.
      Check widths **390px, 768px, 1024px, 1440px**.
- [ ] The iframe document response is HTTP 200 in browser DevTools Network.
      Inspect its enforced `Content-Security-Policy: frame-ancestors`
      response header and confirm it includes the exact approved origin.
- [ ] In an **unapproved** origin, the browser refuses framing per CSP.
      Do not weaken CSP or add wildcard origins.
- [ ] After expiry/revocation: iframe document may respond **403**.
      Check DevTools Network and Console; the HALO HOLA **Mở HOLA Maps**
      link must remain visible and usable.
- [ ] The embed progress indicator disappears within 8 seconds and never
      blocks iframe pointer interactions. iframe `onLoad` is not treated
      as evidence of successful authorization.
- [ ] Header, Footer, BottomNav, places/public HOLA API and server-to-server
      HOLA Maps sync remain unaffected.

CLI/API checks after approval (replace the placeholder with the **actual
approved URL**, never commit it):

```sh
curl -i https://halohola.vn/api/hola-embed
# In Chrome/Firefox DevTools > Network, select the iframe document request
# and inspect HTTP status, CSP frame-ancestors, and X-Frame-Options.
```

A normal `curl` cannot prove a browser's CSP enforcement. In addition,
`iframe.onload` may fire even for blocked frame navigations. A real-browser
test from both approved and non-approved origins is required before merge
and/or production activation.

## Local verification

```sh
npm ci
npm run install:all
npm test --prefix backend
npm run build
```

The GitHub `build` workflow runs these commands for pull requests.
There is **no production deployment from this feature branch**:
`.github/workflows/deploy.yml` triggers only from `main`.
