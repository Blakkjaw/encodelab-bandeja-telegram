using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyHeader().AllowAnyMethod().AllowCredentials().SetIsOriginAllowed(_ => true);
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowAll");

// Hub de SignalR para tiempo real
app.MapHub<ChatHub>("/hubs/chat");

// Webhook de Telegram
app.MapPost("/api/telegram/webhook", async (TelegramUpdate update, IHubContext<ChatHub> hubContext) =>
{
    // Publica el evento y notifica por SignalR a la bandeja
    await hubContext.Clients.All.SendAsync("ReceiveMessage", new
    {
        ChatId = update.Message?.Chat?.Id,
        SenderName = update.Message?.Chat?.FirstName ?? "Usuario Telegram",
        Text = update.Message?.Text,
        Timestamp = DateTime.UtcNow
    });

    return Results.Ok();
});

// Endpoint para responder al usuario de Telegram
app.MapPost("/api/chat/send", async (SendMessageRequest request) =>
{
    // Lógica para enviar mensaje mediante Bot API de Telegram
    return Results.Ok(new { Success = true, Message = "Mensaje enviado a Telegram" });
});

app.Run();

public record TelegramUpdate(TelegramMessage? Message);
public record TelegramMessage(TelegramChat? Chat, string? Text);
public record TelegramChat(long Id, string? FirstName, string? Username);
public record SendMessageRequest(long ChatId, string Text);

public class ChatHub : Hub { }