using VegaCy.Api.Data;
using VegaCy.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<JsonWorkStore>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        var configuredOrigins = (Environment.GetEnvironmentVariable("VEGACY_CORS_ORIGINS") ?? string.Empty)
            .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        var localOrigins = new[] { "http://localhost:5173", "https://localhost:5173", "http://localhost:5174", "https://localhost:5174" };
        var allowedOrigins = configuredOrigins.Length > 0 ? configuredOrigins : localOrigins;

        policy.SetIsOriginAllowed(origin =>
        {
            if (allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
                return true;

            if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                return false;

            return uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase);
        })
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();
var adminUsername = NormalizeSecret(Environment.GetEnvironmentVariable("VEGACY_ADMIN_USERNAME")) ?? "wagdy-Vegacy";
var adminPassword = NormalizeSecret(Environment.GetEnvironmentVariable("VEGACY_ADMIN_PASSWORD")) ?? "wagdy-Vegacy";
var adminToken = NormalizeSecret(Environment.GetEnvironmentVariable("VEGACY_ADMIN_TOKEN")) ?? "ChangeThisToken123!";

app.UseSwagger();
app.UseSwaggerUI();
app.UseStaticFiles();
app.UseCors("ReactApp");

app.MapGet("/api/works", async (JsonWorkStore store) =>
{
    var items = await store.GetAllAsync();
    return Results.Ok(items);
})
.WithName("GetWorks");

app.MapPost("/api/admin/login", (AdminLoginDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
        return Results.BadRequest("Username and password are required.");

    var providedUsername = dto.Username.Trim();
    var providedPassword = dto.Password.Trim();

    if (!string.Equals(providedUsername, adminUsername, StringComparison.OrdinalIgnoreCase) ||
        !string.Equals(providedPassword, adminPassword, StringComparison.Ordinal))
        return Results.Unauthorized();

    return Results.Ok(new { token = adminToken });
})
.WithName("AdminLogin");

app.MapPost("/api/works", async (CreateWorkItemDto dto, JsonWorkStore store, HttpContext http) =>
{
    var authError = EnsureAdminAuthorized(http, adminToken);
    if (authError is not null) return authError;

    if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Url))
        return Results.BadRequest("Title and Url are required.");

    if (dto.Type != "image" && dto.Type != "video")
        return Results.BadRequest("Type must be image or video.");

    var item = await store.AddAsync(dto);
    return Results.Created($"/api/works/{item.Id}", item);
})
.WithName("CreateWork");

app.MapDelete("/api/works/{id:int}", async (int id, JsonWorkStore store, HttpContext http) =>
{
    var authError = EnsureAdminAuthorized(http, adminToken);
    if (authError is not null) return authError;

    var deleted = await store.DeleteAsync(id);
    return deleted ? Results.NoContent() : Results.NotFound();
})
.WithName("DeleteWork");

app.MapPost("/api/uploads", async (IFormFile file, IWebHostEnvironment env, HttpContext http) =>
{
    var authError = EnsureAdminAuthorized(http, adminToken);
    if (authError is not null) return authError;

    if (file.Length == 0) return Results.BadRequest("Empty file.");

    var allowed = new[] { "image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm" };
    if (!allowed.Contains(file.ContentType))
        return Results.BadRequest("Only images and videos are allowed.");

    var uploadsDir = Path.Combine(env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot"), "uploads");
    Directory.CreateDirectory(uploadsDir);

    var ext = Path.GetExtension(file.FileName);
    var fileName = $"{Guid.NewGuid():N}{ext}";
    var fullPath = Path.Combine(uploadsDir, fileName);

    await using var stream = File.Create(fullPath);
    await file.CopyToAsync(stream);

    var baseUrl = $"{http.Request.Scheme}://{http.Request.Host}";
    return Results.Ok(new { url = $"{baseUrl}/uploads/{fileName}" });
})
.DisableAntiforgery()
.WithName("UploadMedia");

app.Run();

static IResult? EnsureAdminAuthorized(HttpContext http, string adminToken)
{
    var authHeader = http.Request.Headers.Authorization.ToString();
    if (!authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        return Results.Unauthorized();

    var token = authHeader["Bearer ".Length..].Trim();
    if (token != adminToken)
        return Results.Unauthorized();

    return null;
}

static string? NormalizeSecret(string? value)
{
    if (string.IsNullOrWhiteSpace(value)) return null;
    return value.Trim().Trim('"', '\'');
}
