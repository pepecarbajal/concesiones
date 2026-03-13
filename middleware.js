import { NextResponse } from 'next/server';

// Rutas que NO requieren autenticación
const RUTAS_PUBLICAS = ['/login', '/api/login'];

export const config = {
  // El middleware se ejecuta en TODAS las rutas excepto archivos estáticos internos
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)'],
};

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas sin verificar
  const esPublica = RUTAS_PUBLICAS.some(ruta => pathname.startsWith(ruta));
  if (esPublica) {
    return NextResponse.next();
  }

  // Verificar cookie de sesión
  const cookie = request.cookies.get('geomin_session');

  if (!cookie || !cookie.value) {
    // Sin cookie → redirigir al login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar que la cookie tiene el formato correcto
  // El valor es: base64(payload):firma
  try {
    const [payloadB64] = cookie.value.split(':');
    const payload = JSON.parse(atob(payloadB64));

    // Verificar expiración
    if (!payload.exp || Date.now() > payload.exp) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('expired', '1');
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('geomin_session');
      return response;
    }

    // Todo bien — dejar pasar
    return NextResponse.next();
  } catch {
    // Cookie malformada → redirigir al login
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('geomin_session');
    return response;
  }
}