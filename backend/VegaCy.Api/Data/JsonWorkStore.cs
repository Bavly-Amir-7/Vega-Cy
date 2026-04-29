using System.Text.Json;
using VegaCy.Api.Models;

namespace VegaCy.Api.Data;

public class JsonWorkStore
{
    private readonly string _filePath;
    private readonly JsonSerializerOptions _options = new() { WriteIndented = true };

    public JsonWorkStore(IWebHostEnvironment env)
    {
        var dataDir = Path.Combine(env.ContentRootPath, "Data");
        Directory.CreateDirectory(dataDir);
        _filePath = Path.Combine(dataDir, "works.json");
        if (!File.Exists(_filePath))
        {
            File.WriteAllText(_filePath, "[]");
        }
    }

    public async Task<List<WorkItem>> GetAllAsync()
    {
        var json = await File.ReadAllTextAsync(_filePath);
        return JsonSerializer.Deserialize<List<WorkItem>>(json) ?? new List<WorkItem>();
    }

    public async Task<WorkItem> AddAsync(CreateWorkItemDto dto)
    {
        var items = await GetAllAsync();
        var item = new WorkItem
        {
            Id = items.Count == 0 ? 1 : items.Max(x => x.Id) + 1,
            Title = dto.Title.Trim(),
            Type = dto.Type.Trim().ToLower(),
            Url = dto.Url.Trim(),
            CreatedAt = DateTime.UtcNow
        };
        items.Insert(0, item);
        await SaveAsync(items);
        return item;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var items = await GetAllAsync();
        var item = items.FirstOrDefault(x => x.Id == id);
        if (item is null) return false;
        items.Remove(item);
        await SaveAsync(items);
        return true;
    }

    private async Task SaveAsync(List<WorkItem> items)
    {
        var json = JsonSerializer.Serialize(items, _options);
        await File.WriteAllTextAsync(_filePath, json);
    }
}
