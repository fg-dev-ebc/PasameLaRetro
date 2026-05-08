# PasameLaRetro

Marketplace premium para renta de maquinaria construido con Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth, Supabase Database y Supabase Storage.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase Auth SSR
- Supabase Postgres con RLS
- Supabase Storage para imagenes
- Lucide React
- Zod para validacion en Server Actions

## Happy Path

1. Registrarse en `/registro` como owner, renter o both.
2. Entrar al dashboard.
3. Publicar maquinaria en `/publicar` con ficha, precio, ubicacion, imagenes y horarios.
4. Ver la oferta activa en `/catalogo` y `/maquinaria/[id]`.
5. Otro usuario autenticado agenda una franja disponible.
6. El owner confirma, rechaza, cancela o completa desde `/dashboard/reservas`.

## Estructura

- `app/page.tsx`: landing.
- `app/catalogo/page.tsx`: catalogo con filtros funcionales.
- `app/maquinaria/[id]/page.tsx`: detalle, galeria, owner y agenda.
- `app/publicar/page.tsx`: formulario de publicacion.
- `app/login/page.tsx` y `app/registro/page.tsx`: auth.
- `app/dashboard/page.tsx`: resumen operativo.
- `app/dashboard/maquinaria`: publicaciones del owner.
- `app/dashboard/maquinaria/[id]/editar`: edicion.
- `app/dashboard/maquinaria/[id]/horarios`: disponibilidad variable.
- `app/dashboard/reservas`: reservas hechas y recibidas.
- `components/marketplace`: componentes reutilizables.
- `lib/actions`: Server Actions seguras.
- `lib/supabase`: clientes SSR/browser y tipos.
- `supabase/schema.sql`: SQL completo de tablas, RLS, triggers y Storage.

## Variables De Entorno

El proyecto incluye `.env.local` apuntando al Supabase conectado durante la implementacion. Para otro entorno, usa `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Comandos

Instalar dependencias:

```bash
npm install
```

Ejecutar localmente:

```bash
npm run dev
```

Verificar:

```bash
npm run lint
npm run build
```

## Comandos shadcn Usados

```bash
npx shadcn@latest init -d -f
npx shadcn@latest add card input textarea select badge separator sheet dropdown-menu avatar dialog form label sonner checkbox table
```

## Supabase

El SQL completo esta en `supabase/schema.sql`. Incluye:

- `profiles`
- `categories`
- `equipment`
- `equipment_images`
- `availability_rules`
- `availability_exceptions`
- `bookings`
- `favorites`
- bucket `equipment-images`
- triggers de perfil, updated_at y preparacion de reserva
- constraint anti-solape para reservas pending/confirmed
- RLS completo para owners, renters y lectura publica de maquinaria activa

## Notas De Producto

- Las reservas son por horas y empiezan como `pending`.
- La disponibilidad semanal usa `availability_rules`.
- El SQL ya contempla `availability_exceptions` para extender cierres u horarios especiales.
- Las imagenes se suben a `equipment-images` con path `user_id/equipment_id/file`.
- El formulario de publicacion usa Server Actions y acepta bodies de hasta `90mb` en Next.js. El bucket de Supabase mantiene limite de `10mb` por archivo.
- El diseño evita sombras, animaciones y color innecesario: blanco, negro, grises, bordes y tipografia Inter + JetBrains Mono.

## Login Con Google

El codigo ya usa Supabase Auth directamente. No se usa NextAuth/Auth.js.

Archivos relevantes:

- `lib/actions/auth.ts`: `signInWithGoogleAction()` llama `supabase.auth.signInWithOAuth({ provider: "google" })`.
- `app/auth/callback/route.ts`: intercambia el `code` por sesion con `exchangeCodeForSession`.
- `components/marketplace/auth-forms.tsx`: botones "Continuar con Google".

Estado actual del proyecto Supabase conectado:

```json
"external": { "google": false }
```

Para activarlo en Supabase Cloud:

1. En Google Cloud Console, crea un OAuth Client tipo `Web application`.
2. Agrega este Authorized redirect URI:

```text
https://jwyxivgbhikkwfuzvszp.supabase.co/auth/v1/callback
```

3. Copia el Google Client ID y Client Secret.
4. En Supabase Dashboard ve a `Authentication > Providers > Google`.
5. Activa Google y pega Client ID + Client Secret.
6. En `Authentication > URL Configuration`, configura:

```text
Site URL: http://localhost:3000
Redirect URLs: http://localhost:3000/auth/callback
```

7. Para produccion, agrega tambien:

```text
https://tu-dominio.com/auth/callback
```

Despues de eso, el boton de Google queda funcional sin cambiar codigo.
