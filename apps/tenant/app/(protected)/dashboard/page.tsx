import DailyBriefingCard from "../components/DailyBriefingCard";
import DashBoardBookings from "./DashBoardBookings";
// import BookingList from "./components/BookingList";

export default async function DashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <DailyBriefingCard />
      <DashBoardBookings />
    </main>
  );
}