import type { ComponentType } from "react";

export interface TemplateEntry {
  component: ComponentType<any>;
  subject: string | ((data: any) => string);
  displayName?: string;
  previewData?: Record<string, unknown>;
  to?: string;
}

import { template as bookingReceipt } from "./booking-receipt";
import { template as teamBookingNotification } from "./team-booking-notification";

export const TEMPLATES = {
  "booking-receipt": bookingReceipt,
  "team-booking-notification": teamBookingNotification,
} satisfies Record<string, TemplateEntry>;

export type TemplateName = keyof typeof TEMPLATES;
