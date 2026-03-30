import { setGlobalOptions } from "firebase-functions"
import { onCall, HttpsError } from "firebase-functions/https"
import { defineSecret } from "firebase-functions/params"
import Stripe from "stripe"

setGlobalOptions({ maxInstances: 10 })

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY")

export const createCheckoutSession = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in to book.")
    }

    const { listingId, listingAddress, hours, total, date, origin } = request.data

    const stripe = new Stripe(stripeSecretKey.value())

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: `Parking at ${listingAddress}`,
              description: `${hours} hour${hours !== 1 ? "s" : ""} on ${date}`,
            },
            unit_amount: Math.round(total * 100), // Stripe requires cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/booking/success?listingId=${listingId}&hours=${hours}&total=${total}&date=${encodeURIComponent(date)}&address=${encodeURIComponent(listingAddress)}`,
      cancel_url: `${origin}/listing?id=${listingId}&date=${encodeURIComponent(date)}`,
    })

    return { url: session.url }
  }
)
