# Respuestas a Preguntas Bonus

### 1. ¿Para qué usarías un sistema de caché en una bandeja conversacional?

Un sistema de caché (ej. Redis) es fundamental para:

- **Reducir la latencia en lecturas:** Almacenar el estado de la lista de contactos y la cantidad de mensajes no leídos por operador sin saturar la base de datos principal en cada _render_.
- **Control de Concurrencia y Bloqueos:** Manejar cierres de sesión o estados de _"Operador escribiendo..."_ que son volátiles y no requieren persistencia permanente en disco.
- **Rate Limiting:** Evitar ataques o saturación de mensajes registrando contadores de frecuencia por usuario en memoria.

### 2. ¿Cómo gestionarías el tráfico de archivos multimedia?

Para mantener la arquitectura escalable y liviana:

- **Descarga Asíncrona:** El mensaje entrante con multimedia solo almacena en la DB el `file_id` y metadatos del archivo enviados por Telegram.
- **Almacenamiento en Object Storage:** Un servicio en segundo plano descarga el archivo desde la API de Telegram y lo sube a un S3 / Blob Storage.
- **URLs Firmadas:** La bandeja de operador nunca consume el archivo a través del servidor API de .NET, sino que renderiza el contenido usando URLs firmadas (_presigned URLs_) de corta duración directamente desde el Object Storage, evitando cuellos de botella en el ancho de banda del backend.
