using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeatingController : ControllerBase
{
    private readonly AppDbContext _context;

    public SeatingController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/seating/assign
    [HttpPost("assign")]
    public async Task<IActionResult> AssignGuestToSeat(AssignSeatDto dto)
    {
        var seat = await _context.Seats.FindAsync(dto.SeatId);
        if (seat == null)
        {
            return NotFound("Seat not found.");
        }

        // Check if guest exists and belongs to the same wedding
        var guest = await _context.Guests.FindAsync(dto.GuestId);
        if (guest == null)
        {
            return NotFound("Guest not found.");
        }

        // Ensure guest isn't already seated elsewhere (Unique constraint check)
        var existingSeat = await _context.Seats.FirstOrDefaultAsync(s => s.GuestId == dto.GuestId);
        if (existingSeat != null)
        {
            existingSeat.GuestId = null; // Unassign from old seat
        }

        seat.GuestId = dto.GuestId;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Guest assigned to seat successfully", seatId = seat.Id, guestId = guest.Id });
    }

    // POST: api/seating/unassign/{seatId}
    [HttpPost("unassign/{seatId}")]
    public async Task<IActionResult> UnassignSeat(int seatId)
    {
        var seat = await _context.Seats.FindAsync(seatId);
        if (seat == null)
        {
            return NotFound("Seat not found.");
        }

        seat.GuestId = null;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Seat is now empty", seatId = seat.Id });
    }
}

public class AssignSeatDto
{
    public int SeatId { get; set; }
    public int GuestId { get; set; }
}