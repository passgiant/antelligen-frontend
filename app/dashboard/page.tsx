import DashboardLayout from "@/features/dashboard/ui/components/DashboardLayout";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            History Dashboard
          </h1>
        </div>
      </div>
      <DashboardLayout />
    </div>
  );
}
