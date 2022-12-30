using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExampleAPI.Context;

public class BloggingContext : DbContext
{
    public DbSet<Post> Posts { get; set; }

    public DbSet<Tag> Tags { get; set; }

    public string DbPath { get; private set; }

    public BloggingContext()
    {
        DbPath = $"blogging.db";
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options.UseSqlite($"Data Source={DbPath}");
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
    public string Url { get; set; }

    public List<Post> Posts { get; } = new();
}

[Table("Users")]
public class User
{
    [Required]
    public long Id { get; set; }

    [Required]
    public string Name { get; set; }
}

[Table("Posts")]
public class Post
{
    [Required]
    public long Id { get; set; }

    [Required]
    public string Title { get; set; }

    [Required]
    public User User { get; set; }

    public List<Tag> Tags { get; } = new List<Tag>();

    public List<PostTag> PostTags { get; } = new List<PostTag>();

    public int? Ranking { get; set; }
}

[Table("Tags")]
public class Tag
{
    [Required]
    public long Id { get; set; }

    [Required]
    [MaxLength(64)]
    public string Name { get; set; }

    public List<Post> Posts { get; } = new List<Post>();

    public List<PostTag> PostTags { get; } = new List<PostTag>();
}

[Table("PostTags")]
public class PostTag
{
    [Required]
    public long PostId { get; set; }

    [Required]
    public Post Post { get; set; }

    [Required]
    public long TagId { get; set; }

    [Required]
    public Tag Tag { get; set; }
}
