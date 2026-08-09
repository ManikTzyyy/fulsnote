import * as LucideIcons from "lucide-react";

export function DynamicIcon({ name, className }) {
  let iconName = name || "SmilePlus";
  if (name && !LucideIcons[name]) {
    iconName = name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }
  const IconComponent = LucideIcons[iconName] || LucideIcons.SmilePlus;
  return <IconComponent className={className} />;
}
