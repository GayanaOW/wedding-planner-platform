using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RsvpController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RsvpController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/rsvp/{token}
        [HttpGet("{token}")]
        public async Task<IActionResult> GetRsvpByToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest(new { message = "RSVP token is required." });

            var household = await _context.Households
                .Include(h => h.Wedding)
                .Include(h => h.Guests)
                .FirstOrDefaultAsync(h => h.Token == token);

            if (household == null)
                return NotFound(new { message = "Invalid or expired RSVP invitation link." });

            return Ok(new
            {
                householdId = household.Id,
                householdName = household.HouseholdName,
                rsvpStatus = household.RsvpStatus,
                wedding = household.Wedding == null ? null : new
                {
                    coupleNames = household.Wedding.CoupleNames,
                    weddingDate = household.Wedding.WeddingDate,
                    venueName = household.Wedding.VenueName
                },
                guests = household.Guests.Select(g => new
                {
                    id = g.Id,
                    firstName = g.FirstName,
                    lastName = g.LastName,
                    mealPreference = g.MealPreference,
                    dietaryNotes = g.DietaryNotes
                })
            });
        }

        // PUT: api/rsvp/{token}
        [HttpPut("{token}")]
        public async Task<IActionResult> SubmitRsvp(string token, [FromBody] RsvpSubmissionDto dto)
        {
            var household = await _context.Households
                .Include(h => h.Guests)
                .FirstOrDefaultAsync(h => h.Token == token);

            if (household == null)
                return NotFound(new { message = "Invalid RSVP invitation link." });

            var normalizedStatus = dto.RsvpStatus?.Trim().ToLowerInvariant();
            if (normalizedStatus != "attending" && normalizedStatus != "declined" && normalizedStatus != "pending")
                return BadRequest(new { message = "RSVP status must be 'attending', 'declined', or 'pending'." });

            household.RsvpStatus = normalizedStatus;

            // Update only guests that strictly belong to this household
            if (dto.Guests != null)
            {
                foreach (var guestUpdate in dto.Guests)
                {
                    var guest = household.Guests.FirstOrDefault(g => g.Id == guestUpdate.Id);
                    if (guest != null)
                    {
                        guest.MealPreference = string.IsNullOrWhiteSpace(guestUpdate.MealPreference)
                            ? guest.MealPreference
                            : guestUpdate.MealPreference.Trim().ToLowerInvariant();
                        guest.DietaryNotes = guestUpdate.DietaryNotes?.Trim();
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "RSVP updated successfully.", rsvpStatus = household.RsvpStatus });
        }
    }

    public class RsvpSubmissionDto
    {
        public string RsvpStatus { get; set; } = "pending";
        public List<RsvpGuestUpdateDto>? Guests { get; set; }
    }

    public class RsvpGuestUpdateDto
    {
        public int Id { get; set; }
        public string? MealPreference { get; set; }
        public string? DietaryNotes { get; set; }
    }
}