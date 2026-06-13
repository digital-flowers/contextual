export type TicketSource = "linear" | "local";

export type TicketPriority = "urgent" | "high" | "medium" | "low" | "none";

export interface TicketLink {
  label: string;
  url: string;
}

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  source: TicketSource;
  priority: TicketPriority;
  assignee?: string;
  project?: string;
  links: TicketLink[];
  linearId?: string;
  linearUrl?: string;
  createdAt: string;
  updatedAt: string;
}
