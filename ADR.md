# ADR-001: Selección de Base de Datos para Almacenamiento de Chats

**Estado:** Aceptado

## Contexto

Se requiere almacenar datos de contactos, chats y mensajes con estructura semi-estructurada (metadatos de Telegram) y alta frecuencia de escritura derivada de los eventos entrantes del bot.

## Alternativas consideradas

1. **PostgreSQL / SQL Server:** Relacional, garante de ACID, pero con rigidez en esquemas para metadatos cambiantes de la API de Telegram.
2. **MongoDB:** NoSQL documental, alta velocidad de escritura, flexibilidad de esquema para cargas JSON de mensajería.

## Decisión

Se elige **MongoDB**. Su modelo documental permite guardar el payload de las conversaciones y metadatos de Telegram sin fricción de mapeo, soportando altas tasas de escritura asíncrona desde RabbitMQ.

## Consecuencias

- **Ventajas:** Excelente performance en escrituras, escalabilidad horizontal sencilla, flexibilidad de esquema.
- **Riesgos:** Menor rigor de integridad referencial nativa, compensado mediante reglas del Dominio en .NET.

---

# ADR-002: Tecnología para Comunicación en Tiempo Real

**Estado:** Aceptado

## Contexto

La bandeja de operador debe reflejar en tiempo real la llegada de mensajes entrantes de Telegram y las actualizaciones de estado sin requerir _polling_ desde el frontend.

## Alternativas consideradas

1. **Polling HTTP / Long Polling:** Ineficiente, alto consumo de recursos y latencia.
2. **WebSockets Nativos:** Eficiente, pero requiere gestión manual de reconexión, _heartbeats_ y fallback.
3. **ASP.NET Core SignalR:** Abstracción sobre WebSockets con reconexión automática, gestión de grupos y soporte de fallbacks (Server-Sent Events / Long Polling).

## Decisión

Se elige **ASP.NET Core SignalR**. Proporciona una integración nativa con .NET y Angular, abstrayendo la complejidad de red y garantizando comunicación bidireccional de baja latencia.

## Consecuencias

- **Ventajas:** Desarrollo ágil, reconexión automática integrada, desacople mediante _Hubs_.
- **Riesgos:** En clusters multi-instancia requiere un Backplane (ej. Redis SignalR Backplane) para sincronizar eventos entre nodos.

---

# ADR-003: Arquitectura del Webhook y Topología de Colas en RabbitMQ

**Estado:** Aceptado

## Contexto

La recepción de webhooks de Telegram puede sufrir picos de tráfico. Es crítico no bloquear la respuesta HTTP a Telegram para evitar duplicidad de reintentos por _timeout_.

## Alternativas consideradas

1. **Procesamiento Sincrónico:** Procesar y guardar en base de datos dentro del _controller_ del Webhook. Riego alto de _time-out_ y pérdida de mensajes bajo carga.
2. **Asíncrono con Message Broker (RabbitMQ):** El _controller_ publica un evento y responde HTTP 200 OK inmediatamente.

## Decisión

Se adopta la topología **Asíncrona mediante RabbitMQ**.

- **Exchange:** `telegram.fanout` (tipo Fanout/Direct).
- **Queue:** `telegram.incoming.messages`.
- **Publisher:** Endpoint del Webhook en .NET.
- **Consumer:** Background Service (`IHostedService`) en .NET que consume de la cola, persiste en DB y notifica a SignalR.

## Consecuencias

- **Ventajas:** Tolerancia a fallos, desacople, amortiguación de picos de tráfico (_rate-limiting_ implícito).
- **Riesgos:** Complejidad operativa adicional al requerir un servicio broker en la infraestructura.
