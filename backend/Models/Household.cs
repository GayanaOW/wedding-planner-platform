using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Index(nameof(WeddingId))]
[Index(nameof(Token), IsUnique = true)] // Critical index for instant public RSVP token lookups
public class Household
{
    public int Id { get; set; }
    public int WeddingId { get; set; }
    public Wedding Wedding { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    public string HouseholdName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string RsvpStatus { get; set; } = "pending"; // pending, attending, declined

    [Required]
    [MaxLength(64)]
    public string Token { get; set; } = Guid.NewGuid().ToString("N"); // Unique secure token for public RSVP link

    public ICollection<Guest> Guests { get; set; } = new List<Guest>();
}