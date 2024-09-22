using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExampleAPI.Context;

public class BloggingContext : DbContext
{
    public DbSet<Post> Posts { get; set; }

    public DbSet<Tag> Tags { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options.UseSqlite($"Data Source=blogging.db");
        options.LogTo(Console.WriteLine);
        options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfiguration(new TagEntityTypeConfiguration());
        builder.ApplyConfiguration(new PostEntityTypeConfiguration());
    }
}

public class TagEntityTypeConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> entity)
    {
        entity.HasIndex(e => e.Name)
           .IsUnique();
    }
}

public class PostEntityTypeConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> entity)
    {
        entity
            .HasMany(p => p.Tags)
            .WithMany(p => p.Posts)
            .UsingEntity<PostTag>(
                j => j
                    .HasOne(pt => pt.Tag)
                    .WithMany(t => t.PostTags)
                    .HasForeignKey(pt => pt.TagId),
                j => j
                    .HasOne(pt => pt.Post)
                    .WithMany(p => p.PostTags)
                    .HasForeignKey(pt => pt.PostId),
                j => j
                    .HasKey(t => new { t.TagId, t.PostId })
            );
    }
}

public class Blog
{
    public int BlogId { get; set; }
    public required string Url { get; set; }

    public List<Post> Posts { get; } = [];
}

[Table("Users")]
public class User
{
    [Required]
    public long Id { get; set; }

    [Required]
    public required string Name { get; set; }
}

[Table("Posts")]
public class Post
{
    [Required]
    public long Id { get; set; }

    [Required]
    public required string Title { get; set; }

    [Required]
    public required User User { get; set; }

    public List<Tag> Tags { get; } = [];

    public List<PostTag> PostTags { get; } = [];

    public int? Ranking { get; set; }
}

[Table("Tags")]
public class Tag
{
    [Required]
    public long Id { get; set; }

    [Required]
    [MaxLength(64)]
    public required string Name { get; set; }

    public List<Post> Posts { get; } = [];

    public List<PostTag> PostTags { get; } = [];
}

[Table("PostTags")]
public class PostTag
{
    [Required]
    public long PostId { get; set; }

    [Required]
    public required Post Post { get; set; }

    [Required]
    public required long TagId { get; set; }

    [Required]
    public required Tag Tag { get; set; }
}
