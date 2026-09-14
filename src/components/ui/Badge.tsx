import type { PropertyStatus } from "@/lib/types";

const statusStyles: Record<PropertyStatus, string> = {
  RFO: "bg-accent-light text-accent-dark",
  "Pre-selling": "bg-blue-50 text-blue-700",
  "Accept Reservation": "bg-amber-50 text-amber-700",
};

export function StatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground/70 ${className}`}
    >
      {children}
    </span>
  );
}
