# strokee-system-backend

## 🐳 **Docker Compose para StrokeE System**

Este archivo describe cómo usar `docker-compose` para levantar la infraestructura del proyecto, incluyendo MongoDB y RabbitMQ. También explica los comandos necesarios para inicializar el Replica Set en MongoDB.

---

## 📌 **Requisitos previos**

Antes de ejecutar los contenedores, asegúrate de tener instalado:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

---

## 🚀 **Cómo iniciar el entorno con Docker Compose**

### 1️⃣ **Construir y levantar los contenedores**
Ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker-compose up -d --build
```

- `-d`: Ejecuta los contenedores en modo "detached" (en segundo plano).
- `--build`: Fuerza la reconstrucción de las imágenes.

---

### 2️⃣ **Verificar que los contenedores estén corriendo**

```bash
docker ps
```

Esto mostrará una lista de los contenedores activos. Debes ver algo similar a:

```plaintext
CONTAINER ID   IMAGE                                      STATUS           PORTS
xxxxxxxxxxxx   mongo:6                                    Up X minutos     27018->27017/tcp
xxxxxxxxxxxx   carlos29ac/strokee-notification-service   Up X minutos     4002->4002/tcp
xxxxxxxxxxxx   strokee-system-api                        Up X minutos     4001->4001/tcp
xxxxxxxxxxxx   rabbitmq:3-management                     Up X minutos     5672->5672/tcp, 15672->15672/tcp
```

Si algún contenedor no está corriendo, revisa los logs:
```bash
docker logs mongo-strokee-system
```

## 📦 **Apagar y eliminar los contenedores**

Si necesitas detener los contenedores sin eliminar los volúmenes:
```bash
docker-compose down
```

Si quieres eliminar los volúmenes (datos de MongoDB y RabbitMQ):
```bash
docker-compose down -v
```

---

## ✅ **Resumen de Comandos Útiles**

### 🐳 **Docker Compose**

| Acción | Comando |
|--------|---------|
| Construir y levantar contenedores | `docker-compose up -d --build` |
| Verificar contenedores en ejecución | `docker ps` |
| Ver logs de un contenedor | `docker logs <nombre_contenedor>` |
| Ingresar al shell de MongoDB | `docker exec -it mongo-strokee-system mongosh` |
| Iniciar Replica Set | `rs.initiate()` |
| Ver estado del Replica Set | `rs.status()` |
| Salir del shell de MongoDB | `exit` |
| Apagar contenedores sin borrar volúmenes | `docker-compose down` |
| Apagar y borrar volúmenes | `docker-compose down -v` |

Con esto, tendrás tu infraestructura lista para usar. 🚀
