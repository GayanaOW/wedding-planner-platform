using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Index(nameof(PlannerId))]
public class Wedding
{
    public int Id { get; set; }
    public int PlannerId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string CoupleNames { get; set; } = string.Empty;

    public DateOnly WeddingDate { get; set; }
    
    [MaxLength(255)]
    public string? VenueName { get; set; }
}