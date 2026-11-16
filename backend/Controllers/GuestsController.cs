using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GuestsController : ControllerBase
{
    private readonly AppDbContext _context;

    public GuestsController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/guests
    [HttpPost]
    public async Task<ActionResult<Guest>> CreateGuest(CreateGuestDto dto)
    {
        var household = await _context.Households.FindAsync(dto.HouseholdId);
        if (household == null)
        {
            return NotFound("Household not found.");
        }

        var guest = new Guest
        {
            WeddingId = household.WeddingId,
            HouseholdId = dto.HouseholdId,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            MealPreference = dto.MealPreference ?? "chicken",
            DietaryNotes = dto.DietaryNotes
        };

        _context.Guests.Add(guest);
        await _context.SaveChangesAsync();

        return Ok(guest);
    }
}

public class CreateGuestDto
{
    public int HouseholdId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? MealPreference { get; set; }
    public string? DietaryNotes { get; set; }
}