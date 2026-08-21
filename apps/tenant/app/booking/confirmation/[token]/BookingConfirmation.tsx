"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  XCircle,
} from "lucide-react";

import { apiClient } from "@/libs/api";

type Props = {
  token: string;
  tenantId: string;
};

type BookingConfirmationValue = {
  booking_ref: string | null;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  payment_method: string;
  bank_details: {
    bank_name: string | null;
    account_name: string | null;
    account_number: string | null;
    iban: string | null;
    swift: string | null;
    bank_instructions: string | null;
  } | null;
};

export default function BookingConfirmation({
  token,
  tenantId
}: Props) {
  const [booking, setBooking] = useState<BookingConfirmationValue | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data =
          await apiClient.api<BookingConfirmationValue>(
            `v1/tenants/${tenantId}/bookings/confirmation/${token}`
          );

        if (!cancelled) {
          setBooking(data);
        }
      } catch (error) {
        console.error(
          "Could not load booking confirmation:",
          error
        );

        if (!cancelled) {
          setError(
            "Could not load booking."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [token, tenantId]);

  async function cancelBooking() {
    if (
      !window.confirm(
        "Are you sure you want to cancel this booking?"
      )
    ) {
      return;
    }

    setCancelling(true);
    setError(null);

    try {
      await apiClient.api(
        `v1/tenants/${tenantId}/bookings/cancel/${token}`,
        {
          method: "POST",
        }
      );

      setBooking((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          status: "cancelled",
        };
      });
    } catch (error) {
      console.error(
        "Could not cancel booking:",
        error
      );

      setError(
        "Could not cancel booking."
      );
    } finally {
      setCancelling(false);
    }
  }
  if (loading) {
    return (
      <div className="px-6 py-20 text-center text-sm text-slate-500">
        Loading booking...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="px-6 py-20 text-center text-sm text-red-600">
        {error ?? "Booking not found."}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-14 text-slate-900">
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
              booking.status === "cancelled"
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {booking.status === "cancelled" ? (
              <XCircle className="h-7 w-7" />
            ) : (
              <CheckCircle2 className="h-7 w-7" />
            )}
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            {booking.status === "cancelled"
              ? "Booking cancelled"
              : "Booking confirmed"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {booking.status === "cancelled"
              ? "This booking has been cancelled."
              : "Your booking has been successfully created."}
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Booking reference
            </div>

            <div className="mt-1 text-xl font-semibold">
              {booking.booking_ref ??
                "Pending"}
            </div>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 text-slate-400" />

              <div>
                <div className="text-xs text-slate-400">
                  Stay
                </div>

                <div className="mt-1 text-sm font-medium">
                  {booking.check_in}
                  {" → "}
                  {booking.check_out}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-5 w-5 text-slate-400" />

              <div>
                <div className="text-xs text-slate-400">
                  Total
                </div>
                <div
                  className={`mt-1 text-sm font-semibold ${
                    booking.status === "cancelled"
                      ? "text-red-600 line-through"
                      : ""
                  }`}
                >
                  ${booking.total_price}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <div className="text-xs text-slate-400">
                Payment method
              </div>

              <div className="mt-1 text-sm font-medium">
                {booking.payment_method ===
                "pay_on_property"
                  ? "Pay at property"
                  : booking.payment_method ===
                      "pay_withbank_transfer"
                    ? "Bank transfer"
                    : "Online payment"}
              </div>
            </div>
            {booking.payment_method === "pay_withbank_transfer" && booking.bank_details && (
                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="text-sm font-semibold">
                      Bank transfer details
                    </h3>

                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      {booking.bank_details.bank_name && (
                        <div>
                          <span className="font-medium text-slate-800">
                            Bank:
                          </span>{" "}
                          {booking.bank_details.bank_name}
                        </div>
                      )}

                      {booking.bank_details.account_name && (
                        <div>
                          <span className="font-medium text-slate-800">
                            Account name:
                          </span>{" "}
                          {booking.bank_details.account_name}
                        </div>
                      )}

                      {booking.bank_details.account_number && (
                        <div>
                          <span className="font-medium text-slate-800">
                            Account number:
                          </span>{" "}
                          {booking.bank_details.account_number}
                        </div>
                      )}

                      {booking.bank_details.iban && (
                        <div>
                          <span className="font-medium text-slate-800">
                            IBAN:
                          </span>{" "}
                          {booking.bank_details.iban}
                        </div>
                      )}

                      {booking.bank_details.swift && (
                        <div>
                          <span className="font-medium text-slate-800">
                            SWIFT / BIC:
                          </span>{" "}
                          {booking.bank_details.swift}
                        </div>
                      )}

                      {booking.bank_details.bank_instructions && (
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          {booking.bank_details.bank_instructions}
                        </p>
                      )}
                    </div>
                  </div>
            )}
            {booking.status !== "cancelled" && (
              <div className="border-t border-slate-100 px-6 py-5">
                <button
                  type="button"
                  onClick={cancelBooking}
                  disabled={cancelling}
                  className="w-full rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                >
                  {cancelling
                    ? "Cancelling..."
                    : "Cancel booking"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}