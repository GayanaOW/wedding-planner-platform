using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HouseholdsController : ControllerBase
{
    private readonly AppDbContext _context;

    public HouseholdsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/households/wedding/{weddingId}
    [HttpGet("wedding/{weddingId}")]
    public async Task<ActionResult<IEnumerable<Household>>> GetHouseholdsForWedding(int weddingId)
    {
        // Eager load guests to prevent N+1 query issues
        return await _context.Households
            .Where(h => h.WeddingId == weddingId)
            .Include(h => h.Guests)
            .ToListAsync();
    }

    // POST: api/households
    [HttpPost]
    public async Task<ActionResult<Household>> CreateHousehold(CreateHouseholdDto dto)
    {
        // Verify wedding exists
        var weddingExists = await _context.Weddings.AnyAsync(w => w.Id == dto.WeddingId);
        if (!weddingExists)
        {
            return BadRequest("Associated wedding does not exist.");
        }

        var household = new Household
        {
            WeddingId = dto.WeddingId,
            HouseholdName = dto.HouseholdName,
            RsvpStatus = "pending"
            // Token is automatically generated via Guid in the model
        };

        _context.Households.Add(household);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetHouseholdsForWedding), new { weddingId = household.WeddingId }, household);
    }
}

// DTO to handle incoming payload cleanly
public class CreateHouseholdDto
{
    public int WeddingId { get; set; }
    public string HouseholdName { get; set; } = string.Empty;
}