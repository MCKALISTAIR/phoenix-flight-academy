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
import { template as teamEnquiryNotification } from "./team-enquiry-notification";
import { template as bookingReminder } from "./booking-reminder";

export const TEMPLATES = {
  "booking-receipt": bookingReceipt,
  "team-booking-notification": teamBookingNotification,
  "team-enquiry-notification": teamEnquiryNotification,
  "booking-reminder": bookingReminder,
} satisfies Record<string, TemplateEntry>;

export type TemplateName = keyof typeof TEMPLATES;
