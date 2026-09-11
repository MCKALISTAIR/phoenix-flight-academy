import React from "react";
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Button } from "@react-email/components";
import type { TemplateEntry } from "./registry";

export interface BookingReminderProps {
  customerName?: string;
  productName?: string;
  startsAt?: string;
  aircraft?: string;
  instructorName?: string;
  reference?: string;
  schoolName?: string;
}

const Email = ({
  customerName = "Aviator",
  productName = "Flight Training Session",
  startsAt = "Tomorrow",
  aircraft = "Piper PA-28 (G-EGPG)",
  instructorName = "Flight Instructor",
  reference,
  schoolName = "Phoenix Flight Training",
}: BookingReminderProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Pre-Flight Briefing & Reminder: ${productName} tomorrow at Cumbernauld`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{schoolName} • Flight Operations</Text>
        <Heading style={heading}>Pre-Flight Briefing &amp; Reminder</Heading>
        <Text style={greeting}>Hello {customerName},</Text>
        <Text style={intro}>
          This is a reminder for your upcoming flight session with Phoenix Flight Training at Cumbernauld Airport (EGPG).
        </Text>

        <Section style={panel}>
          <Text style={row}>
            <span style={rowLabel}>Flight: </span>
            <span style={rowValue}>{productName}</span>
          </Text>
          <Text style={row}>
            <span style={rowLabel}>Date &amp; Time: </span>
            <span style={rowValue}>{startsAt}</span>
          </Text>
          <Text style={row}>
            <span style={rowLabel}>Aircraft: </span>
            <span style={rowValue}>{aircraft}</span>
          </Text>
          {instructorName ? (
            <Text style={row}>
              <span style={rowLabel}>Instructor: </span>
              <span style={rowValue}>{instructorName}</span>
            </Text>
          ) : null}
          {reference ? (
            <Text style={row}>
              <span style={rowLabel}>Reference: </span>
              <span style={rowValue}>{reference}</span>
            </Text>
          ) : null}
        </Section>

        <Section style={alertBox}>
          <Text style={alertTitle}>⚠️ Pre-Flight Arrival &amp; Check-in</Text>
          <Text style={alertText}>
            <strong>Arrive 30 minutes early:</strong> Please arrive at Cumbernauld Airport terminal at least 30 minutes prior to off-blocks for your student briefing, aerodrome sign-in, and pre-flight walkaround.
          </Text>
        </Section>

        <Section style={checklist}>
          <Text style={checklistHeader}>What to bring with you:</Text>
          <Text style={checkItem}>• Valid Photo ID (Passport or UK Driving Licence)</Text>
          <Text style={checkItem}>• Polarised or UV sunglasses (essential for cockpit lookout)</Text>
          <Text style={checkItem}>• Comfortable clothing and flat, thin-soled shoes (for rudder pedals)</Text>
          <Text style={checkItem}>• Pilot logbook, medical certificate &amp; checklist (if enrolled student)</Text>
        </Section>

        <Section style={terminalGuide}>
          <Text style={terminalTitle}>Location &amp; Weather Notice</Text>
          <Text style={terminalText}>
            Phoenix Flight Training operates from the main terminal facilities at <strong>Cumbernauld Airport (EGPG), G68 0PR</strong>. Free customer parking is available adjacent to the terminal entrance.
          </Text>
          <Text style={terminalText}>
            Aviation operations are strictly dependent on weather minimums (cloud base &amp; visibility). If conditions look marginal, please call our operations desk on <strong>07769 690041</strong> before travelling.
          </Text>
        </Section>

        <Text style={signoff}>
          Safe flying,<br />
          <strong>The Operations Team at Phoenix Flight Training</strong><br />
          Cumbernauld Airport (EGPG)
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: (data: Record<string, unknown>) =>
    `Pre-Flight Briefing: Your Flight Tomorrow at Phoenix Flight Training (${data["startsAt"] || "EGPG"})`,
  displayName: "Pre-Flight Reminder & Briefing (Customer)",
  previewData: {
    customerName: "David Stewart",
    productName: "60-Minute Trial Flying Lesson",
    startsAt: "Saturday 14 June 2026, 11:00 BST",
    aircraft: "Piper PA-28 Archer III (G-EGPG)",
    instructorName: "Capt. Alistair McKay",
    reference: "PHX-7702",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, Helvetica, sans-serif" };
const container = { padding: "24px 28px", maxWidth: "560px" };
const brand = {
  color: "#e2620f",
  fontSize: "12px",
  letterSpacing: "1.5px",
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
  fontWeight: 700,
};
const heading = { color: "#101a2c", fontSize: "22px", margin: "0 0 16px", fontWeight: 800 };
const greeting = { fontSize: "16px", fontWeight: 700, color: "#101a2c", margin: "0 0 8px" };
const intro = { fontSize: "14px", color: "#475569", lineHeight: "1.5", margin: "0 0 16px" };

const panel = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  padding: "14px 18px",
  margin: "16px 0",
};
const row = { margin: "6px 0", fontSize: "14px", color: "#1e293b" };
const rowLabel = { color: "#64748b", fontWeight: 500 };
const rowValue = { fontWeight: 700, color: "#0f172a" };

const alertBox = {
  backgroundColor: "#fffbeb",
  borderLeft: "4px solid #f59e0b",
  borderRadius: "4px",
  padding: "12px 16px",
  margin: "16px 0",
};
const alertTitle = { color: "#b4530a", fontSize: "13px", fontWeight: 700, margin: "0 0 4px" };
const alertText = { color: "#78350f", fontSize: "13px", margin: 0, lineHeight: "1.4" };

const checklist = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "8px",
  padding: "14px 18px",
  margin: "16px 0",
};
const checklistHeader = { color: "#166534", fontSize: "13px", fontWeight: 700, margin: "0 0 8px" };
const checkItem = { color: "#15803d", fontSize: "13px", margin: "4px 0", lineHeight: "1.4" };

const terminalGuide = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "14px 18px",
  margin: "16px 0",
  border: "1px solid #e2e8f0",
};
const terminalTitle = { color: "#1e293b", fontSize: "13px", fontWeight: 700, margin: "0 0 6px" };
const terminalText = { color: "#475569", fontSize: "12px", margin: "4px 0", lineHeight: "1.4" };

const signoff = { color: "#64748b", fontSize: "13px", marginTop: "24px", lineHeight: "1.5" };

export default Email;
