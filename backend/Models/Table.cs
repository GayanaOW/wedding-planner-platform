using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Index(nameof(WeddingId))]
public class Table
{
    public int Id { get; set; }
    public int WeddingId { get; set; }
    public Wedding Wedding { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string TableName { get; set; } = string.Empty;

    public int Capacity { get; set; } = 8;

    [MaxLength(50)]
    public string Shape { get; set; } = "round"; // round, rectangular

    public double PosX { get; set; } = 0.0; // Coordinate for the frontend floor plan canvas
    public double PosY { get; set; } = 0.0;

    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
}