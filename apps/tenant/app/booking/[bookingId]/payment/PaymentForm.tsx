"use client";

import { useState } from "react";
import {
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

export default function PaymentForm({
  returnUrl,
}: {
  returnUrl: string;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmPayment() {
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (result.error) {
      setError(
        result.error.message ??
          "Payment could not be completed."
      );

      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <ExpressCheckoutElement
        onConfirm={confirmPayment}
        options={{
          buttonHeight: 48,
          buttonType: {
            applePay: "check-out",
            googlePay: "checkout",
            paypal: "buynow",
          },
        }}
      />

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />

        <span className="text-xs uppercase tracking-wider text-gray-400">
          Or pay with
        </span>

        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <PaymentElement />

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={confirmPayment}
        disabled={!stripe || !elements || submitting}
        className="w-full rounded-xl bg-black px-5 py-4 font-medium text-white disabled:opacity-50"
      >
        {submitting
          ? "Processing payment..."
          : "Pay now"}
      </button>
    </div>
  );
}