import { DashboardLayout } from "@/components/dashboard-layout";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Feuerwehr-Patienten-Management
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Bitte wählen Sie eine Feuerwehr in der Seitenleiste aus, um
              Patienten zu verwalten, oder klicken Sie auf
              &quot;Kostenträger&quot;, um Kostenträger zu verwalten.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
