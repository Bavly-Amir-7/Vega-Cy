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
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173", "http://localhost:5174", "https://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
var adminUsername = Environment.GetEnvironmentVariable("VEGACY_ADMIN_USERNAME") ?? "wagdy-Vegacy";
var adminPassword = Environment.GetEnvironmentVariable("VEGACY_ADMIN_PASSWORD") ?? "wagdy-Vegacy";
var adminToken = Environment.GetEnvironmentVariable("VEGACY_ADMIN_TOKEN") ?? "ChangeThisToken123!";

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

    if (dto.Username != adminUsername || dto.Password != adminPassword)
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
