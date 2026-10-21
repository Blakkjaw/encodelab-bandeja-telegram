using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://0.0.0.0:80");

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll");

app.MapPost("/api/telegram/webhook", async (HttpContext context, IHubContext<ChatHub> hubContext) =>
{
    var data = await context.Request.ReadFromJsonAsync<WebhookMessageDto>();
    await hubContext.Clients.All.SendAsync("ReceiveMessage", data);
    return Results.Ok(new { success = true });
});

app.MapPost("/api/chat/send", async (HttpContext context) =>
{
    var request = await context.Request.ReadFromJsonAsync<SendMessageDto>();
    return Results.Ok(new { success = true, message = "Enviado con éxito" });
});

app.MapHub<ChatHub>("/hubs/chat");

app.Run();

public record WebhookMessageDto(long ChatId, string SenderName, string Text);
public record SendMessageDto(long ChatId, string Text);
public class ChatHub : Hub { }