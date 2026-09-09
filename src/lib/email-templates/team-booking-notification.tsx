import React from "react";
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

export interface TeamBookingNotificationProps {
  productName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  startsAt?: string;
  aircraft?: string;
  amountPaid?: string;
  needsApproval?: boolean;
  reference?: string;
  schoolName?: string;
}

const Email = ({
  productName = "Booking",
  customerName,
  customerEmail,
  customerPhone,
  startsAt,
  aircraft,
  amountPaid,
  needsApproval,
  reference,
  schoolName = "Phoenix Flight Training",
}: TeamBookingNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New paid booking: ${productName}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{schoolName}</Text>
        <Heading style={heading}>New paid booking</Heading>
        {needsApproval ? <Text style={flag}>Needs approval before it is confirmed.</Text> : null}
        <Section style={panel}>
          <Row label="Booking" value={productName} />
          {startsAt ? <Row label="Date &amp; time" value={startsAt} /> : null}
          {aircraft ? <Row label="Aircraft" value={aircraft} /> : null}
          {customerName ? <Row label="Customer" value={customerName} /> : null}
          {customerEmail ? <Row label="Email" value={customerEmail} /> : null}
          {customerPhone ? <Row label="Phone" value={customerPhone} /> : null}
          {amountPaid ? <Row label="Paid" value={amountPaid} /> : null}
          {reference ? <Row label="Reference" value={reference} /> : null}
        </Section>
      </Container>
    </Body>
  </Html>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <Text style={row}>
    <span style={rowLabel}>{label}: </span>
    <span style={rowValue}>{value}</span>
  </Text>
);

export const template = {
  component: Email,
  subject: "New paid booking",
  displayName: "New booking (team)",
  previewData: {
    productName: "30-Minute Trial Flight",
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    startsAt: "Saturday 14 June 2026, 10:00",
    amountPaid: "£149.00",
    reference: "PHX-2041",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, Helvetica, sans-serif" };
const container = { padding: "24px 28px", maxWidth: "560px" };
const brand = {
  color: "#e2620f",
  fontSize: "13px",
  letterSpacing: "1.5px",
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
  fontWeight: 700,
};
const heading = { color: "#101a2c", fontSize: "24px", margin: "0 0 12px" };
const flag = { color: "#b4530a", fontSize: "15px", fontWeight: 700 };
const panel = {
  backgroundColor: "#f6f7f9",
  borderRadius: "10px",
  padding: "12px 16px",
  margin: "16px 0",
};
const row = { margin: "6px 0", fontSize: "15px", color: "#101a2c" };
const rowLabel = { color: "#6b7688" };
const rowValue = { fontWeight: 700 };

export default Email;
