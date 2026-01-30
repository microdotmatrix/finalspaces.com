"use client";

import { Icon as IconifyIcon, type IconProps } from "@iconify/react";
import { cn } from "@/lib/utils";

interface Props extends IconProps {
  className?: string;
}

function Icon({ className, ...props }: Props) {
  return <IconifyIcon className={cn("shrink-0", className)} {...props} />;
}

export { Icon };
