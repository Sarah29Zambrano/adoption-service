# 🐾 Adoption Service

API REST para gestión de adopciones de mascotas con tests funcionales, documentación Swagger y contenedor Docker optimizado.

---

## 📁 Estructura del Proyecto

```
adoption-service/
└── src/
    ├── tests/
    │   └── adoption.test.js      # Tests funcionales con Jest (mocks, fakes, spies)
    ├── routers/
    │   └── adoption.router.js    # Router Express con anotaciones Swagger/OpenAPI
    ├── services/
    │   └── index.js              # Lógica de negocio + validación + stdin loop
    ├── jest.config.js            # Configuración Jest y umbrales de cobertura
    ├── package.json              # Dependencias y scripts npm
    ├── Dockerfile                # Imagen multistage node:22-alpine
    └── .dockerignore             # Exclusiones del contexto Docker
```

---

## ⚙️ Instalación y Ejecución Local

### Prerequisitos
- Node.js 18 o superior
- npm 9 o superior

```bash
# Clonar el repositorio
git clone https://github.com/Sarah29Zambrano/adoption-service.git
cd adoption-service

# Desde la carpeta src/
cd src
npm install

# Ejecutar tests con cobertura
npm test

# Modo CI (sin interactividad)
npm run test:ci

# Ejecutar la aplicación en modo stdin
echo '3
{"method":"GET","endpoint":"/adoptions"}
{"method":"POST","endpoint":"/adoptions","body":{"petId":123,"userId":456}}
{"method":"GET","endpoint":"/adoptions/1"}' | SKIP_USER_VALIDATION=true node services/index.js
```

Salida esperada:
```
[{"id":1,"petId":123,"userId":456,"status":"adopted"}]
{"id":2,"petId":123,"userId":456,"status":"pending"}
{"id":1,"petId":123,"userId":456,"status":"adopted"}
```

---

## 🧪 Scripts npm Disponibles

| Script           | Comando real               | Descripción                              |
|------------------|----------------------------|------------------------------------------|
| `start`          | `node services/index.js`   | Inicia la app en modo stdin              |
| `test`           | `jest`                     | Tests + cobertura completa               |
| `test:watch`     | `jest --watch`             | Re-ejecución automática en desarrollo    |
| `test:coverage`  | `jest --coverage`          | Genera reporte HTML en `src/coverage/`   |
| `test:ci`        | `jest --forceExit --ci`    | Modo CI, sin interactividad              |

---

## 🐳 Docker

### Construir y ejecutar tests en contenedor

```bash
# Construir la imagen (contexto apunta a src/)
docker build -t adoption-service:1.0.0 ./src

# Ejecutar los tests dentro del contenedor
docker run --rm adoption-service:1.0.0

# Ejecutar en modo stdin interactivo
docker run --rm -i adoption-service:1.0.0 node services/index.js
```

### Subir imagen a DockerHub

```bash
# Autenticarse con token de acceso
docker login -u sarahzambrano29

# Etiquetar con versión semántica y latest
docker tag adoption-service:1.0.0 sarahzambrano29/adoption-service:1.0.0
docker tag adoption-service:1.0.0 sarahzambrano29/adoption-service:latest

# Subir ambas etiquetas
docker push sarahzambrano29/adoption-service:1.0.0
docker push sarahzambrano29/adoption-service:latest
```

### Descargar imagen pública

```bash
docker pull sarahzambrano29/adoption-service:latest
docker run --rm sarahzambrano29/adoption-service:latest
```

> 🔗 URL: `https://hub.docker.com/r/sarahzambrano29/adoption-service`

### Escaneo de seguridad

```bash
# Con Docker Scout
docker scout cves adoption-service:1.0.0

# Con Trivy (open source)
trivy image adoption-service:1.0.0
```

---

## 📖 Endpoints

| Método | Ruta              | Descripción                            |
|--------|-------------------|----------------------------------------|
| GET    | `/adoptions`      | Listar todas las adopciones            |
| POST   | `/adoptions`      | Crear nueva adopción `{ petId, userId }` |
| GET    | `/adoptions/:id`  | Obtener adopción por ID                |

---

## 📄 Documentación Swagger / OpenAPI

Los endpoints están documentados con anotaciones `@swagger` en `src/routers/adoption.router.js`.

Para activar la UI de Swagger, agregar en el servidor Express:

```js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const spec = swaggerJsdoc({
  definition: { openapi: '3.0.0', info: { title: 'Adoption API', version: '1.0.0' } },
  apis: ['./routers/adoption.router.js'],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
```

Acceder en: `http://localhost:3000/api-docs`

---

## 🔐 Variables de Entorno

| Variable                  | Valor    | Descripción                                      |
|---------------------------|----------|--------------------------------------------------|
| `SKIP_USER_VALIDATION`    | `true`   | Salta validación de usuario (tests / CI)         |
| `NODE_ENV`                | `test`   | Activa modo test en Express y frameworks          |

---

## 🔄 Pipeline CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run tests in Docker
        run: |
          docker build -t adoption-test ./src
          docker run --rm adoption-test

      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Push image
        run: |
          docker tag adoption-test ${{ secrets.DOCKERHUB_USERNAME }}/adoption-service:${{ github.sha }}
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/adoption-service:${{ github.sha }}
```

---

## ✅ Cobertura Mínima Configurada

| Métrica     | Umbral |
|-------------|--------|
| Branches    | 85%    |
| Functions   | 100%   |
| Lines       | 90%    |
| Statements  | 90%    |

---

## 🛡️ Buenas Prácticas de Seguridad en DockerHub

- Usar **tokens de acceso** (`Account Settings → Security`) en lugar de contraseña directa
- Configurar el repositorio como **privado** si contiene lógica sensible
- Ejecutar `docker scout` o `trivy` en cada build del pipeline
- Etiquetar con SHA de commit para trazabilidad completa
- Nunca incluir secretos en el `Dockerfile` ni en variables de entorno comiteadas

---

## 📦 Tecnologías Utilizadas

| Herramienta        | Uso                                       |
|--------------------|-------------------------------------------|
| Node.js 22         | Runtime                                   |
| Jest 29            | Framework de tests                        |
| child_process      | Simulación de servicios externos          |
| swagger-jsdoc      | Generación de especificación OpenAPI 3.0  |
| swagger-ui-express | UI interactiva de documentación           |
| Docker / Alpine    | Contenedor optimizado (~50 MB base)       |