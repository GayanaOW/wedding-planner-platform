using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Wedding> Weddings => Set<Wedding>();
    public DbSet<Household> Households => Set<Household>();
    public DbSet<Guest> Guests => Set<Guest>();
    public DbSet<Table> Tables => Set<Table>();
    public DbSet<Seat> Seats => Set<Seat>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure cascade deletes and relational constraints
        modelBuilder.Entity<Wedding>()
            .HasMany<Household>()
            .WithOne(h => h.Wedding)
            .HasForeignKey(h => h.WeddingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Table>()
            .HasMany(t => t.Seats)
            .WithOne(s => s.Table)
            .HasForeignKey(s => s.TableId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}