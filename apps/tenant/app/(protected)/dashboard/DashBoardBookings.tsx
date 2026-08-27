"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MessageSquareText
} from "lucide-react";

import { createPortal } from "react-dom";
import { apiClient } from "@/libs/api";
import { useSettings } from "@/providers/SettingsProvider";
import DailyBriefingCard from "../components/DailyBriefingCard";

type Props = {
  tenantId: string;
};

type DashboardBooking = {
  id: string;
  booking_ref: string | null;

  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  payment_method: string | null;
  special_requests: string | null;
  property_id: string;
  property_name: string;

  check_in: string;
  check_out: string;

  guests: number | null;
  units: number | null;
  total_price: number | null;

  status: string;
  source: string;
  external: boolean;
};

type DashboardBookingsResponse = {
  year: number;
  month: number;
  days_in_month: number;
  bookings: DashboardBooking[];
};

type BookingPeriod =
  | "previous"
  | "current"
  | "future";

export default function DashBoardBookings() {
  const { tenantId } = useSettings()
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  const [month, setMonth] = useState(now.getMonth() + 1);

  const [data, setData] = useState<DashboardBookingsResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await apiClient.api<DashboardBookingsResponse>(
            `v1/tenants/${tenantId}/dashboard/bookings?year=${year}&month=${month}`
          );

        if (!cancelled) {
          setData(response);
        }
      } catch (error) {
        console.error(
          "Could not load dashboard bookings:",
          error
        );

        if (!cancelled) {
          setError(
            "Could not load bookings."
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
  }, [
    tenantId,
    year,
    month,
  ]);

  function bookingCancelled(bookingId: string) {
    setData((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        bookings: current.bookings.map(
          (booking) =>
            booking.id === bookingId
              ? {
                  ...booking,
                  status: "cancelled",
                }
              : booking
        ),
      };
    });
  }
  function previousMonth() {
    if (month === 1) {
      setYear((current) => current - 1);
      setMonth(12);
      return;
    }

    setMonth((current) => current - 1);
  }
  function nextMonth() {
    if (month === 12) {
      setYear((current) => current + 1);
      setMonth(1);
      return;
    }

    setMonth((current) => current + 1);
  }
  const monthLabel = new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric",
    }).format(
      new Date(
        year,
        month - 1,
        1
      )
    );

  const days = useMemo(() => {
    if (!data) {
      return [];
    }

    return Array.from(
      {
        length:
          data.days_in_month,
      },
      (_, index) =>
        index + 1
    );
  }, [data]);

  return (
    <section className="text-slate-900">
      <div className="mb-6 flex items-center justify-between gap-5">
        <div>
          <h2 className="text-xl font-semibold">
            Bookings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Overview of stays and external calendar bookings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previousMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="min-w-36 text-center text-sm font-semibold">
            {monthLabel}
          </div>

          <button
            type="button"
            onClick={nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            Loading bookings...
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-sm text-red-600">
            {error}
          </div>
        ) : !data ? null : (
          <>
            <div className="overflow-x-auto">
              <div className="min-w-262.5">
                <MonthHeader
                  days={days}
                  month={month}
                  year={year}
                />

                {data.bookings.length >
                0 ? (
                  <div className="divide-y divide-slate-100">
                    {data.bookings.map(
                      (booking) => (
                        <BookingRow
                          key={`${booking.external ? "external" : "booking"}-${booking.id}`}
                          booking={booking}
                          days={days}
                          month={month}
                          year={year}
                          onCancelled={bookingCancelled}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="px-6 py-14 text-center text-sm text-slate-400">
                    No bookings this month.
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-5 border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
              <Legend
                className="bg-blue-500"
                label="Future"
              />

              <Legend
                className="bg-emerald-500"
                label="Current stay"
              />

              <Legend
                className="bg-slate-300"
                label="Previous"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function MonthHeader({
  days,
  month,
  year,
}: {
  days: number[];
  month: number;
  year: number;
}) {
  const monthName =
    new Intl.DateTimeFormat("en", {
      month: "long",
    }).format(
      new Date(
        year,
        month - 1,
        1
      )
    );

  return (
    <div className="grid grid-cols-[220px_1fr] border-b border-slate-200 bg-slate-50">
      <div className="flex items-center px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Booking
      </div>

      <div>
        <div className="border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500">
          1 {monthName} –{" "}
          {days.length} {monthName}
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${days.length}, minmax(27px, 1fr))`,
          }}
        >
          {days.map((day) => (
            <div
              key={day}
              className="border-l border-slate-100 py-2 text-center text-[10px] text-slate-400"
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingRow({
  booking,
  days,
  month,
  year,
  onCancelled,
}: {
  booking: DashboardBooking;
  days: number[];
  month: number;
  year: number;
  onCancelled: (bookingId: string) => void;
}) {
  const { tenantId } = useSettings()
  const [menuOpen, setMenuOpen] = useState(false);
  const [specialRequestOpen, setSpecialRequestOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const specialRequestRef = useRef<HTMLDivElement | null>(null);
  const [cancelling, setCancelling] = useState(false);

  async function cancelBooking() {
    setCancelling(true);
    try {
      await apiClient.api(
        `v1/tenants/${tenantId}/bookings/${booking.id}/cancel`,
        {
          method: "PUT",
        }
      );
      setMenuOpen(false);
      onCancelled(booking.id);
    } catch (error) {
      console.error(
        "Could not cancel booking:",
        error
      );
    } finally {
      setCancelling(false);
    }
  }
  const period = getBookingPeriod(booking);

  const visibleRange = getVisibleRange(
    booking,
    year,
    month,
    days.length
  );

  const colorClass =
    period === "current"
      ? "bg-emerald-500"
      : period === "future"
        ? "bg-blue-500"
        : "bg-slate-300";

  return (
    <div className="grid grid-cols-[220px_1fr]">
      <div className="relative flex min-w-0 items-center gap-3 px-5 py-4">
        {booking.special_requests && (
          <div className="absolute top-1 right-1" ref={specialRequestRef}>
            <MessageSquareText
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setMenuPosition({
                  top: rect.bottom + 6,
                  left: rect.left,
                });
                setSpecialRequestOpen((current) => !current)
              }}
              className="w-4 h-4 text-cyan-800"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          {booking.guest_name && (
          <div
            ref={menuRef}
            className="relative z-100"
          >
            <button
              type="button"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setMenuPosition({
                  top: rect.bottom + 6,
                  left: rect.left,
                });
                setMenuOpen((current) => !current)
              }
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {specialRequestOpen && menuPosition && createPortal(
                <div
                  className="fixed z-9999 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                  style={{
                    top: menuPosition.top,
                    left: menuPosition.left,
                  }}
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Guest request
                    </div>
                    <div className="mt-2 space-y-1.5 text-sm text-slate-700">
                      {booking.special_requests}
                    </div>
                  </div>
                </div>,
              document.body
            )}
            {menuOpen && menuPosition && createPortal(
                <div
                  className="fixed z-9999 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                  style={{
                    top: menuPosition.top,
                    left: menuPosition.left,
                  }}
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Guest details
                    </div>

                    <div className="mt-2 space-y-1.5 text-sm text-slate-700">
                      {booking.total_price && (
                        <div>
                          <span className="font-bold">
                            Total price:
                          </span>{" "}
                          ${booking.total_price}
                        </div>
                      )}
                      {booking.payment_method && (
                        <div>
                          <span className="font-bold">
                            Payment method:
                          </span>{" "}
                          {booking.payment_method}
                        </div>
                      )}
                      {booking.guest_name && (
                        <div>
                          <span className="font-bold">
                            Name:
                          </span>{" "}
                          {booking.guest_name}
                        </div>
                      )}

                      {booking.guest_email && (
                        <div>
                          <span className="font-bold">
                            Email:</span>{" "}
                          {booking.guest_email}
                        </div>
                      )}

                      {booking.guest_phone && (
                        <div>
                          <span className="font-bold">
                            Phone:
                          </span>{" "}
                          {booking.guest_phone}
                        </div>
                      )}

                      {booking.guests && (
                        <div>
                          <span className="font-bold">
                            Guests:
                          </span>{" "}
                          {booking.guests}
                        </div>
                      )}

                      {booking.booking_ref && (
                        <div>
                          <span className="font-bold">
                            Booking ref:
                          </span>{" "}
                          {booking.booking_ref}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={cancelBooking}
                    disabled={cancelling}
                    className="block w-full px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancelling
                      ? "Cancelling..."
                      : "Cancel booking"}
                  </button>
                </div>,
                document.body
              )}
          </div>
        )}
          <div className={`min-w-0 flex-1 truncate text-sm font-semibold ${booking.status === "cancelled"
                ? "text-red-400 line-through"
                : "text-slate-800"
            }`}
          >
            { booking.guest_name ?? booking.source }<br />
            {booking.property_name}
          </div>
        </div>
      </div>
      <div
        className="relative grid min-h-20"
        style={{
          gridTemplateColumns: `repeat(${days.length}, minmax(27px, 1fr))`,
        }}
      >
        {days.map((day) => (
          <div
            key={day}
            className="border-l border-slate-100"
          />
        ))}

        {visibleRange && (
          <div
            className={`absolute top-1/2 h-8 -translate-y-1/2 rounded-lg ${colorClass}`}
            style={{
              left: `${
                ((visibleRange.startDay -
                  1) /
                  days.length) *
                100
              }%`,

              width: `${
                ((visibleRange.endDay -
                  visibleRange.startDay) /
                  days.length) *
                100
              }%`,
            }}
          >
            <div className="flex h-full items-center px-3">
              <span className="truncate text-[11px] font-medium text-white">
                {formatDate(
                  booking.check_in
                )}{" "}
                →{" "}
                {formatDate(
                  booking.check_out
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getBookingPeriod(booking: DashboardBooking): BookingPeriod {
  const today = startOfDay(
    new Date()
  );
  const checkIn = parseDate(
    booking.check_in
  );
  const checkOut = parseDate(
    booking.check_out
  );

  if (today >= checkOut) {
    return "previous";
  }

  if (
    today >= checkIn &&
    today < checkOut
  ) {
    return "current";
  }

  return "future";
}

function getVisibleRange(
  booking: DashboardBooking,
  year: number,
  month: number,
  daysInMonth: number
) {
  const monthStart = new Date(
    year,
    month - 1,
    1
  );

  const monthEnd = new Date(
    year,
    month - 1,
    daysInMonth + 1
  );

  const bookingStart =
    parseDate(
      booking.check_in
    );

  const bookingEnd =
    parseDate(
      booking.check_out
    );

  const visibleStart =
    bookingStart < monthStart
      ? monthStart
      : bookingStart;

  const visibleEnd =
    bookingEnd > monthEnd
      ? monthEnd
      : bookingEnd;

  if (
    visibleEnd <= visibleStart
  ) {
    return null;
  }

  return {
    startDay:
      visibleStart.getDate(),

    endDay:
      visibleEnd >= monthEnd
        ? daysInMonth + 1
        : visibleEnd.getDate(),
  };
}

function parseDate(
  value: string
) {
  const [year, month, day] =
    value.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

function startOfDay(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      day: "numeric",
      month: "short",
    }
  ).format(
    parseDate(value)
  );
}

function Legend({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${className}`}
      />

      {label}
    </div>
  );
}