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

---

## ☸️ **Despliegue en Kubernetes**

Para desplegar la configuración en un clúster de Kubernetes, sigue los siguientes pasos:

### 1️⃣ **Crear secretos de aplicación**
Es necesario crear un secreto en Kubernetes a partir del archivo `.env` que contiene las variables de entorno:

```bash
kubectl create secret generic app-secrets --from-env-file=.env
```

Este secreto almacenará información sensible que será utilizada por los pods en el clúster.

### 2️⃣ **Crear ConfigMap para Nginx**
El siguiente comando crea un `ConfigMap` con la configuración de Nginx a partir de un archivo de configuración personalizado:

```bash
kubectl create configmap nginx-config --from-file=nginx.conf=nginx/strokee.conf
```

Este `ConfigMap` permitirá gestionar la configuración de Nginx sin necesidad de modificar directamente los pods.

### 3️⃣ **Crear secreto TLS para Nginx**
Para habilitar TLS en Nginx, es necesario crear un secreto con los certificados SSL:

```bash
kubectl create secret tls strokee-tls-secret --cert=nginx/ssl/tls.crt --key=nginx/ssl/tls.key
```

Esto garantiza una comunicación segura mediante HTTPS dentro del clúster.

---

# Realizar deployment
```bash
kubectl apply -f deployment.yaml
```
# Verificar que servicio Api es accesible
```bash
https://localhost:30443/api/
```

# Verificar que servicio Notification es accesible
```bash
https://localhost:30443/notification/
```

# Documentacion de servicios
## Servicio Api
```bash
https://localhost:30443/api/swagger/
```
## Servicio Notification
```bash
https://localhost:30443/notification/swagger/
```

# Resumen de Comandos Útiles 
### ☸️ **Kubernetes**

| Acción | Comando |
|--------|---------|
| Ver lista de pods | `kubectl get pods` |
| Ver lista de despliegues | `kubectl get deployments` |
| Ver servicios en ejecución | `kubectl get services` |
| Ver logs de un pod | `kubectl logs <nombre_pod>` |
| Describir un pod | `kubectl describe pod <nombre_pod>` |
| Ingresar a un pod en ejecución | `kubectl exec -it <nombre_pod> -- /bin/sh` |
| Ver eventos del clúster | `kubectl get events` |
| Ver estado de los nodos | `kubectl get nodes` |
| Ver config maps | `kubectl get configmaps -n default` |
| Ver contenido de config maps | `kubectl describe configmap nginx-config -n default` |
| Ver secrets | `kubectl get secrets -n default` |
| Ver contenido de secrets | `kubectl get secret app-secrets -o json` |

Con estos pasos, tendrás tu infraestructura desplegada correctamente en Kubernetes, asegurando un entorno seguro y bien configurado. 🚀

