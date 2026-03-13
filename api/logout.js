// api/logout.js
export default function handler(req, res) {
res.setHeader(
    'Set-Cookie',
    'geomin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  );
  res.status(200).json({ ok: true });
}