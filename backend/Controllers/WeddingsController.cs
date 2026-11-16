using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WeddingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public WeddingsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/weddings
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Wedding>>> GetWeddings()
    {
        return await _context.Weddings.ToListAsync();
    }

    // POST: api/weddings
    [HttpPost]
    public async Task<ActionResult<Wedding>> CreateWedding(Wedding wedding)
    {
        _context.Weddings.Add(wedding);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetWeddings), new { id = wedding.Id }, wedding);
    }
}