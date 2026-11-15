using Microsoft.EntityFrameworkCore;

namespace backend.Models;

[Index(nameof(TableId))]
[Index(nameof(GuestId), IsUnique = true)]
public class Seat
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public Table Table { get; set; } = null!;

    public int? GuestId { get; set; } // Null if the seat is empty
    public Guest? Guest { get; set; }

    public int SeatNumber { get; set; }
}