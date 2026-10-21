# Reporte de Utilización de Inteligencia Artificial en el Desarrollo

## 1. Herramientas Utilizadas

Se emplearon modelos de lenguaje avanzados (Claude 3.5 Sonnet / ChatGPT) integrados como asistentes de arquitectura y desarrollo asistido.

## 2. Roles y Agentes Definidos

- **Software Architect Agent:** Encargado de proponer los diagramas de contenedores C4, redactar ADRs y evaluar _trade-offs_ de infraestructura.
- **Backend Code Generator:** Utilizado para el _scaffolding_ de la estructura de Clean Architecture en .NET (.Domain, .Application, .Infrastructure, .API) y configuración del consumidor de RabbitMQ.
- **Frontend Specialist:** Generación de componentes limpios en Angular con RxJS para la suscripción a eventos de SignalR.

## 3. Prompts Representativos

### Prompt 1 (Arquitectura de Mensajería):

> _"Diseña la topología de RabbitMQ para recibir webhooks de Telegram. Necesito que el endpoint del webhook en .NET responda 200 OK inmediatamente y delegue el procesamiento a un IHostedService. Genera el código del Publisher y Consumer usando MassTransit o RabbitMQ.Client."_

### Prompt 2 (SignalR en Angular):

> _"Crea un servicio de Angular que administre la conexión a un Hub de SignalR, maneje la reconexión automática y exponga un BehaviorSubject con la lista de conversaciones actualizadas en tiempo real."_

## 4. Proceso de Revisión, Corrección y Validación

- **Validación del Código:** El código generado por IA no se aplicó de forma ciega. Se verificó el cumplimiento de los principios SOLID y la separación estricta de responsabilidades según Clean Architecture.
- **Refactorización de DTOs y Entidades:** Se ajustaron los tipos de datos generados para garantizar que el `chat_id` de Telegram no sufriera pérdida de precisión numérica al mapearse en el dominio.
