# Ukika — Sitio web institucional

Sitio público de Sala Cuna y Jardín Infantil Ukika, Vitacura.

## Arquitectura

- `index.html`: página institucional y estilos.
- `app.js`: navegación, accesibilidad y formulario.
- `api/contact.mjs`: Vercel Edge Function para recepción de consultas y envío a través de la API de Resend.
- `privacidad.html`: aviso inicial; **la administración debe completarlo y aprobarlo antes de producción**.
- Fotografías y logos: se mantienen los archivos existentes en sus rutas originales.

No requiere un framework ni instalación de paquetes para servir el sitio. La API necesita un despliegue compatible con Vercel; **abrir `index.html` localmente no permite enviar formularios**.

## Configuración del formulario en Vercel

1. Crear una cuenta en Resend (resend.com).
2. Verificar un dominio desde el cual se puedan emitir correos (normalmente `ukika.cl`) y configurar los registros DNS recomendados por Resend.
3. Crear una API key de Resend y guardarla exclusivamente en **Vercel > Project > Settings > Environment Variables**.
4. Configurar las siguientes variables en Vercel:
   - `RESEND_API_KEY`: token secreto de la API de Resend.
   - `CONTACT_FROM_EMAIL`: dirección remitente de un dominio verificado, por ejemplo `Consultas Ukika <consultas@ukika.cl>` **solo cuando se haya creado o autorizado ese remitente**.
   - `CONTACT_TO_EMAIL`: correo receptor del jardín, que debe confirmarse antes de producción (el sitio público muestra `info@ukika.cl`).
5. Seleccionar los entornos deseados (Production, Preview) y volver a desplegar para aplicar las variables.
6. Probar una consulta real, verificar que llega al destinatario y comprobar errores simulados.

**No incorporar tokens, contraseñas ni datos de familias al repositorio.** La función valida longitud, email, campos obligatorios, consentimiento, origen y un campo antirrobots sencillo. Para un uso de alto volumen se recomienda incorporar rate limiting y protección antispam de servidor; las defensas actuales no sustituyen esos controles.

## Antes de publicar

- [ ] Revisar y aprobar el texto de privacidad, identidad del responsable y período de conservación.
- [ ] Verificar DNS de Resend, remitente, destinatario y permisos de envío.
- [ ] Validar las consultas en escritorio y móvil; probar error de configuración o del proveedor.
- [ ] Confirmar autorización de publicación de fotografías de menores.
- [ ] Confirmar horarios, niveles, acreditaciones y datos de contacto publicados.
- [ ] Revisar las cabeceras de seguridad y el HTTPS de la URL real.
- [ ] Agregar protección contra spam/rate limiting si se utiliza el formulario en producción de forma sostenida.

## Publicación

Crear una Pull Request de la rama `feature/ukika-v2-contacto-y-experiencia` hacia `main`, revisar una vista previa de Vercel y fusionar solo después de verificar los puntos anteriores.

El formulario permite elegir entre una consulta de matrícula y solicitar una visita; **no asigna automáticamente horarios ni dispone de un calendario de reservas**.
