export const AVATAR_OPTIONS = [
  { value: "", label: "Use my initials" },
  { value: "/avatars/scholar-cyan.svg", label: "Cyan scholar" },
  { value: "/avatars/scholar-emerald.svg", label: "Emerald scholar" },
  { value: "/avatars/scholar-amber.svg", label: "Amber scholar" },
  { value: "/avatars/scholar-violet.svg", label: "Violet scholar" },
] as const;

export function selectedAvatarUrl(value: string | null | undefined): string {
  if (!value) return "";
  return AVATAR_OPTIONS.some((option) => option.value === value) ? value : "";
}
