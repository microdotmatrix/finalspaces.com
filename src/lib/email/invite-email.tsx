import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface InviteEmailProps {
  firstName: string;
  inviterName: string;
  spaceName: string;
  acceptUrl: string;
}

export function InviteEmail({
  firstName,
  inviterName,
  spaceName,
  acceptUrl,
}: InviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        You&apos;ve been invited to collaborate on a FinalSpace memorial
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>You&apos;re Invited</Heading>
          <Text style={text}>Hi {firstName},</Text>
          <Text style={text}>
            {inviterName} has invited you to collaborate on the FinalSpace
            memorial for <strong>{spaceName}</strong>.
          </Text>
          <Text style={text}>
            As a collaborator, you&apos;ll be able to help manage photos,
            stories, and tributes for this memorial.
          </Text>
          <Section style={buttonContainer}>
            <Button href={acceptUrl} style={button}>
              Accept Invitation
            </Button>
          </Section>
          <Text style={textMuted}>
            If you don&apos;t have an account yet, you&apos;ll be asked to
            create one when you accept this invitation.
          </Text>
          <Text style={textMuted}>
            This link will expire in 7 days. If you didn&apos;t expect this
            invitation, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const body = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  marginBottom: "64px",
  borderRadius: "8px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600" as const,
  color: "#1a1a1a",
  marginBottom: "24px",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#374151",
};

const textMuted = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#6b7280",
  marginTop: "24px",
};

const buttonContainer = {
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#0f172a",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  textDecoration: "none",
  padding: "12px 24px",
  display: "inline-block",
};
