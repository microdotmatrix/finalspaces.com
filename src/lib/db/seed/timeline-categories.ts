import { db } from "@/lib/db";
import { timelineCategories } from "@/lib/db/schema";

/**
 * Seed default timeline categories
 * Run with: pnpm tsx src/lib/db/seed/timeline-categories.ts
 */
async function seedTimelineCategories() {
  console.log("Seeding timeline categories...");

  // Valid keys from timelineCategoryKeyEnum: education, work, family, accomplishments, travel, personal, faith, military, pets
  const categories = [
    {
      key: "education" as const,
      name: "Education",
      description: "Schools, universities, degrees, certifications",
      icon: "graduation-cap",
      color: "#3b82f6",
      sortOrder: 0,
    },
    {
      key: "work" as const,
      name: "Career",
      description: "Jobs, promotions, professional achievements",
      icon: "briefcase",
      color: "#10b981",
      sortOrder: 1,
    },
    {
      key: "family" as const,
      name: "Family",
      description: "Children, marriage, family milestones",
      icon: "users",
      color: "#8b5cf6",
      sortOrder: 2,
    },
    {
      key: "accomplishments" as const,
      name: "Accomplishments",
      description: "Awards, achievements, recognition, milestones",
      icon: "trophy",
      color: "#f59e0b",
      sortOrder: 3,
    },
    {
      key: "travel" as const,
      name: "Travel",
      description: "Adventures, trips, explorations",
      icon: "plane",
      color: "#06b6d4",
      sortOrder: 4,
    },
    {
      key: "personal" as const,
      name: "Personal",
      description: "Health, hobbies, personal growth",
      icon: "heart",
      color: "#ec4899",
      sortOrder: 5,
    },
    {
      key: "faith" as const,
      name: "Faith",
      description: "Religious events, spiritual milestones",
      icon: "sparkles",
      color: "#a855f7",
      sortOrder: 6,
    },
    {
      key: "military" as const,
      name: "Military Service",
      description: "Service, deployments, honors",
      icon: "shield",
      color: "#22c55e",
      sortOrder: 7,
    },
    {
      key: "pets" as const,
      name: "Pets",
      description: "Beloved animal companions",
      icon: "paw-print",
      color: "#f97316",
      sortOrder: 8,
    },
  ];

  for (const category of categories) {
    await db
      .insert(timelineCategories)
      .values(category)
      .onConflictDoUpdate({
        target: timelineCategories.key,
        set: {
          name: category.name,
          description: category.description,
          icon: category.icon,
          color: category.color,
          sortOrder: category.sortOrder,
        },
      });
  }

  console.log(`Seeded ${categories.length} timeline categories`);
}

// Run if executed directly
seedTimelineCategories()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding categories:", err);
    process.exit(1);
  });
