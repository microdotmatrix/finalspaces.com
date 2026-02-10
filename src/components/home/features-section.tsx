import {
  CheckCircle,
  HandHeart,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";

const features = [
  {
    step: 1,
    title: "Share Your Story",
    description:
      "Create a meaningful memorial space. Share life's journey, cherished photos, videos, and the moments that defined a beautiful life.",
    icon: UsersThree,
    iconBg:
      "bg-secondary/15 text-secondary dark:bg-secondary/25 dark:text-secondary",
  },
  {
    step: 2,
    title: "Honor & Celebrate",
    description:
      "Choose meaningful templates and themes. Invite family and friends to share their own memories and celebrate a life well-lived.",
    icon: HandHeart,
    iconBg: "bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary",
  },
  {
    step: 3,
    title: "Preserve Forever",
    description:
      "Secure hosting protects memories for decades. Trusted family members can continue adding stories and keeping the legacy alive.",
    icon: CheckCircle,
    iconBg:
      "bg-secondary/15 text-secondary dark:bg-secondary/25 dark:text-secondary",
  },
] as const;

export const FeaturesSection = () => {
  return (
    <section className="relative bg-accent/40 py-20 sm:py-28 dark:bg-accent/20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="font-(family-name:--font-clash) text-3xl text-foreground tracking-tight sm:text-4xl md:text-5xl">
          Creating Lasting Memories
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground sm:text-lg">
          Thoughtfully preserve life's precious moments with dignity and care.
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-3 sm:gap-6 md:gap-10">
          {features.map((feature) => (
            <div
              className="flex flex-col items-center gap-4"
              key={feature.step}
            >
              <div
                className={`flex size-14 items-center justify-center rounded-xl ${feature.iconBg}`}
              >
                <feature.icon className="size-7" weight="duotone" />
              </div>
              <h3 className="font-(family-name:--font-clash) font-medium text-foreground text-lg">
                {feature.step}. {feature.title}
              </h3>
              <p className="max-w-xs text-balance text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
