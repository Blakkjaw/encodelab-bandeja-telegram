# Prueba Técnica Encodelabs: Bandeja Conversacional Telegram

Solución desacoplada para la recepción, visualización y respuesta en tiempo real de mensajes de Telegram orientada a operadores de atención al cliente.

## Requisitos Previos

- Docker y Docker Compose
- ngrok instalado y autenticado
- Un bot de Telegram creado mediante `@BotFather` (Token de Bot)

## Configuración de Entorno (.env)

Copia el archivo `.env.example` a `.env` y completa los valores correspondientes:
cp .env.example .env

## Variables requeridas:

TELEGRAM_BOT_TOKEN: Token otorgado por BotFather.

NGROK_AUTHTOKEN: Token de autenticación de ngrok.

RABBITMQ_DEFAULT_USER: Usuario para RabbitMQ.

RABBITMQ_DEFAULT_PASS: Password para RabbitMQ.

## Ejecución de la Solución

Para levantar la totalidad de la infraestructura (API .NET, Cliente Angular, RabbitMQ, DB y tunnel ngrok):
`docker compose up -d --build`

El script de inicialización registrará automáticamente el Webhook en Telegram utilizando la URL pública generada por ngrok.

## Supuestos de Arquitectura y Negocio

Gestión de Sesión y Contexto: Al no requerirse autenticación, la bandeja opera bajo un contexto global de operador donde todas las conversaciones entrantes son visibles por cualquier instancia abierta del cliente.

## Procesamiento de Webhooks:

Se asume que el webhook de Telegram requiere una respuesta HTTP 200 OK inmediata para evitar reintentos. Por ello, la API actúa únicamente como producer hacia RabbitMQ y delega la persistencia al consumer.

## Escalabilidad Horizontal:

El uso de SignalR como mecanismo de tiempo real contempla la adición de un Backplane (Redis) para entornos distribuidos de alta concurrencia.

## Identificación de Contactos:

Se utiliza el chat_id de Telegram como clave primaria para agrupar el historial y controlar el estado de lectura de los chats.
