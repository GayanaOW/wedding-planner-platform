using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Index(nameof(WeddingId))]
[Index(nameof(HouseholdId))]
public class Guest
{
    public int Id { get; set; }
    public int WeddingId { get; set; }
    public int HouseholdId { get; set; }
    public Household Household { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string MealPreference { get; set; } = "chicken";

    public string? DietaryNotes { get; set; }

    public Seat? Seat { get; set; } // One-to-one relationship with a seat
}