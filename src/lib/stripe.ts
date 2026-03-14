import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "placeholder_key_not_set", {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});
