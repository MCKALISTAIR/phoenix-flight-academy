import React from "react";
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

export interface TeamEnquiryNotificationProps {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  source?: string;
  schoolName?: string;
}

const Email = ({
  name = "Prospective Aviator",
  email = "",
  subject = "General Query",
  message = "",
  schoolName = "Phoenix Flight Training",
}: TeamEnquiryNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New Enquiry: ${subject} from ${name}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{schoolName} • Cumbernauld Operations</Text>
        <Heading style={heading}>New Customer Enquiry</Heading>
        <Text style={subhead}>A new inquiry was received via the Phoenix website contact desk.</Text>

        <Section style={panel}>
          <Text style={row}>
            <span style={rowLabel}>Category / Subject: </span>
            <span style={highlightValue}>{subject}</span>
          </Text>
          <Text style={row}>
            <span style={rowLabel}>Name: </span>
            <span style={rowValue}>{name}</span>
          </Text>
          <Text style={row}>
            <span style={rowLabel}>Email: </span>
            <span style={rowValue}>{email}</span>
          </Text>
        </Section>

        <Section style={messageBox}>
          <Text style={messageLabel}>Message:</Text>
          <Text style={messageBody}>{message}</Text>
        </Section>

        <Text style={footerNote}>
          Log into the CMS Console to view and reply, or reply directly to {email}.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: (data: Record<string, unknown>) =>
    `New Enquiry: ${data["subject"] || "General Query"} - ${data["name"] || "Customer"}`,
  displayName: "New Enquiry Notification (Team)",
  previewData: {
    name: "Alex Cameron",
    email: "alex.cameron@example.co.uk",
    subject: "PPL Flight Training",
    message: "Hi, I'm looking to start my PPL at Cumbernauld this summer. Can I arrange an intro flight and chat with an instructor?",
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
const heading = { color: "#101a2c", fontSize: "22px", margin: "0 0 4px", fontWeight: 800 };
const subhead = { color: "#6b7688", fontSize: "14px", margin: "0 0 16px" };
const panel = {
  backgroundColor: "#f6f7f9",
  borderRadius: "8px",
  padding: "14px 18px",
  margin: "16px 0",
};
const row = { margin: "6px 0", fontSize: "14px", color: "#101a2c" };
const rowLabel = { color: "#6b7688", fontWeight: 500 };
const rowValue = { fontWeight: 700, color: "#101a2c" };
const highlightValue = { fontWeight: 700, color: "#e2620f" };

const messageBox = {
  backgroundColor: "#fef8f4",
  borderLeft: "4px solid #e2620f",
  borderRadius: "4px",
  padding: "14px 18px",
  margin: "16px 0",
};
const messageLabel = { color: "#b4530a", fontSize: "12px", fontWeight: 700, margin: "0 0 6px", textTransform: "uppercase" as const };
const messageBody = { color: "#101a2c", fontSize: "14px", lineHeight: "1.5", margin: 0, whiteSpace: "pre-wrap" as const };
const footerNote = { color: "#8b949e", fontSize: "12px", marginTop: "24px" };

export default Email;
