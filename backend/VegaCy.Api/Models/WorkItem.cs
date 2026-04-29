namespace VegaCy.Api.Models;

public class WorkItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = "image"; // image | video
    public string Url { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class CreateWorkItemDto
{
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = "image";
    public string Url { get; set; } = string.Empty;
}

public class AdminLoginDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
