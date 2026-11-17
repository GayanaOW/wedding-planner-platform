using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TablesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TablesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/tables/wedding/{weddingId}
    [HttpGet("wedding/{weddingId}")]
    public async Task<ActionResult<IEnumerable<Table>>> GetTablesForWedding(int weddingId)
    {
        // Eager load Seats and their assigned Guests to prevent N+1 queries
        return await _context.Tables
            .Where(t => t.WeddingId == weddingId)
            .Include(t => t.Seats)
                .ThenInclude(s => s.Guest)
            .ToListAsync();
    }

    // POST: api/tables
    [HttpPost]
    public async Task<ActionResult<Table>> CreateTable(CreateTableDto dto)
    {
        var weddingExists = await _context.Weddings.AnyAsync(w => w.Id == dto.WeddingId);
        if (!weddingExists)
        {
            return BadRequest("Associated wedding does not exist.");
        }

        var table = new Table
        {
            WeddingId = dto.WeddingId,
            TableName = dto.TableName,
            Capacity = dto.Capacity,
            Shape = dto.Shape ?? "round",
            PosX = dto.PosX,
            PosY = dto.PosY
        };

        _context.Tables.Add(table);
        await _context.SaveChangesAsync(); // Save first to generate Table.Id

        // Automatically generate individual seats based on table capacity
        var seats = new List<Seat>();
        for (int i = 1; i <= dto.Capacity; i++)
        {
            seats.Add(new Seat
            {
                TableId = table.Id,
                SeatNumber = i,
                GuestId = null
            });
        }

        _context.Seats.AddRange(seats);
        await _context.SaveChangesAsync();

        // Reload table with generated seats for response
        var createdTable = await _context.Tables
            .Include(t => t.Seats)
            .FirstAsync(t => t.Id == table.Id);

        return CreatedAtAction(nameof(GetTablesForWedding), new { weddingId = table.WeddingId }, createdTable);
    }

    // PUT: api/tables/{id}/position
    [HttpPut("{id}/position")]
    public async Task<IActionResult> UpdateTablePosition(int id, [FromBody] TablePositionDto dto)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null)
            return NotFound(new { message = "Table not found." });

        table.PosX = dto.PosX;
        table.PosY = dto.PosY;

        await _context.SaveChangesAsync();
        return Ok(new { id = table.Id, posX = table.PosX, posY = table.PosY });
    }


}

public class CreateTableDto
{
    public int WeddingId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public int Capacity { get; set; } = 8;
    public string? Shape { get; set; }
    public double PosX { get; set; }
    public double PosY { get; set; }
}


public class TablePositionDto
{
    public double PosX { get; set; }
    public double PosY { get; set; }
}