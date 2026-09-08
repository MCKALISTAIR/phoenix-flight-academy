import { loadStripe, Stripe } from "@stripe/stripe-js";

// Mirrored structurally from the server utility — this client module has no
// cross-tree imports so values pass through server-function inputs cleanly.
type StripeEnv = "sandbox" | "live";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

// Derive the environment from the token prefix. Missing/unknown token is a
// configuration error — never fall through to "live".
function paymentsEnvironment(): StripeEnv {
  if (clientToken?.startsWith("pk_test_")) return "sandbox";
  if (clientToken?.startsWith("pk_live_")) return "live";
  throw new Error(
    "Payments are not configured for this build. Complete payments go-live in your Lovable project to enable production checkout.",
  );
}

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    paymentsEnvironment();
    stripePromise = loadStripe(clientToken as string);
  }
  return stripePromise;
}

export function getStripeEnvironment(): StripeEnv {
  return paymentsEnvironment();
}
