import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

export interface BookingReceiptProps {
  customerName?: string;
  productName?: string;
  startsAt?: string;
  aircraft?: string;
  amountPaid?: string;
  balanceDue?: string;
  reference?: string;
  schoolName?: string;
}

const Email = ({
  customerName,
  productName = "Your flight",
  startsAt,
  aircraft,
  amountPaid,
  balanceDue,
  reference,
  schoolName = "Phoenix Flight Training",
}: BookingReceiptProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Your booking with ${schoolName} is confirmed`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{schoolName}</Text>
        <Heading style={heading}>Booking confirmed</Heading>
        <Text style={text}>
          {customerName ? `Hi ${customerName},` : "Hi there,"} thanks for booking — here are your
          details.
        </Text>

        <Section style={panel}>
          <Row label="Booking" value={productName} />
          {startsAt ? <Row label="Date &amp; time" value={startsAt} /> : null}
          {aircraft ? <Row label="Aircraft" value={aircraft} /> : null}
          {reference ? <Row label="Reference" value={reference} /> : null}
        </Section>

        <Section style={panel}>
          {amountPaid ? <Row label="Paid" value={amountPaid} /> : null}
          {balanceDue ? <Row label="Balance due on the day" value={balanceDue} /> : null}
        </Section>

        <Text style={text}>
          Please arrive 20 minutes before your slot. If the weather looks marginal we will be in
          touch — flying is always subject to conditions on the day.
        </Text>

        <Hr style={hr} />
        <Text style={muted}>{schoolName}</Text>
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
  subject: "Your booking is confirmed",
  displayName: "Booking receipt (customer)",
  previewData: {
    customerName: "Jane",
    productName: "30-Minute Trial Flight",
    startsAt: "Saturday 14 June 2026, 10:00",
    aircraft: "G-PHNX",
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
const text = { color: "#33415c", fontSize: "15px", lineHeight: "24px" };
const panel = {
  backgroundColor: "#f6f7f9",
  borderRadius: "10px",
  padding: "12px 16px",
  margin: "16px 0",
};
const row = { margin: "6px 0", fontSize: "15px", color: "#101a2c" };
const rowLabel = { color: "#6b7688" };
const rowValue = { fontWeight: 700 };
const hr = { borderColor: "#e6e8ec", margin: "24px 0 12px" };
const muted = { color: "#8b93a3", fontSize: "12px" };

export default Email;
