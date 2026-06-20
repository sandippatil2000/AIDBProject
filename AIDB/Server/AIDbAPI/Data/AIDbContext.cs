using Microsoft.EntityFrameworkCore;
using AIDbAPI.Models;

namespace AIDbAPI.Data
{
    public class AIDbContext : DbContext
    {
        public AIDbContext(DbContextOptions<AIDbContext> options) : base(options)
        {
        }

        public DbSet<QueryReport> QueryReports { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<QueryReport>(entity =>
            {
                entity.ToTable("QueryReport");
                entity.HasKey(e => e.Id);
            });
        }
    }
}
