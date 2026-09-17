# Proyecto 3 — API de Usuarios con PostgreSQL y pgAdmin

API REST de usuarios (Node.js + Express) con persistencia en PostgreSQL, migraciones automáticas y administración vía pgAdmin, todo orquestado con Docker Compose.

## Descripción

Tres servicios:
- **db**: PostgreSQL 15, con healthcheck y script SQL de migración que se ejecuta al crear el volumen.
- **api**: imagen propia (`build: .`), CRUD completo de usuarios con validación.
- **pgadmin**: interfaz web para administrar la base de datos.

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | /health | Estado de la API y conexión a la BD |
| GET | /users | Listar usuarios |
| GET | /users/:id | Obtener un usuario (404 si no existe) |
| POST | /users | Crear usuario (400 si faltan datos o email inválido) |
| PUT | /users/:id | Actualizar usuario (404 si no existe) |
| DELETE | /users/:id | Eliminar usuario (404 si no existe) |

## Requisitos

- Docker y Docker Compose instalados y corriendo
- `make` (viene preinstalado en macOS)

## Instrucciones de ejecución

1. Copiar la plantilla de variables de entorno:

\`\`\`bash
cp .env.example .env
\`\`\`

2. Levantar todo (construye la imagen de la API, base de datos y pgAdmin):

\`\`\`bash
make up
\`\`\`

3. Verificar que los 3 servicios estén corriendo:

\`\`\`bash
docker compose ps
\`\`\`

4. Probar la API:

\`\`\`bash
make test
\`\`\`

5. Acceder a pgAdmin en `http://localhost:5051` (usuario/contraseña del `.env`), registrar un servidor con host `db`, puerto `5432`, base `usersdb`.

## Comandos del Makefile

- `make up` — construye y levanta todos los servicios
- `make down` — detiene los servicios
- `make logs` — muestra logs en vivo
- `make test` — prueba los endpoints principales

## Evidencias

Ver documento PDF de evidencias adjunto (los 3 servicios corriendo, CRUD completo, validación 400/404, y datos visibles en pgAdmin).

## Preguntas de reflexión

**¿Por qué el script de migración solo se ejecuta la primera vez que se crea el volumen? ¿Qué harías para volver a ejecutarlo?**

La imagen oficial de PostgreSQL solo ejecuta los scripts de `/docker-entrypoint-initdb.d/` cuando el directorio de datos (`PGDATA`, mapeado al volumen `db_data`) está vacío, es decir, la primera vez que se crea el contenedor. Si el volumen ya tiene datos, Postgres asume que la base ya está inicializada y los ignora. Para volver a ejecutarlo hay que eliminar el volumen y dejar que se recree (`docker compose down -v` y luego `make up`), perdiendo los datos actuales.

**¿Por qué en pgAdmin el host de conexión es el nombre del servicio y no `localhost`?**

pgAdmin corre en su propio contenedor, dentro de la misma red de Docker Compose (`api_network`). `localhost` desde dentro de ese contenedor se refiere al propio contenedor de pgAdmin, no al de la base de datos. El nombre del servicio (`db`) sí resuelve, vía el DNS interno de Docker, a la IP del contenedor de PostgreSQL.

**¿Qué ocurre si la API arranca antes de que la base de datos esté lista, y cómo lo previene la configuración del compose?**

Si la API intenta conectarse antes de que PostgreSQL esté aceptando conexiones, las consultas fallan y la API respondería con errores 500 o se caería al iniciar. Esto se previene con `depends_on: db: condition: service_healthy` en el servicio `api`: Docker Compose no inicia el contenedor de la API hasta que el `healthcheck` de `db` (que ejecuta `pg_isready`) reporte que la base de datos está lista para recibir conexiones.
