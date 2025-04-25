import { AppointmentsList } from "@/components/appointments/AppointmentsList";
import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";

export default function AppointmentsPage() {
  return (
    <MainLayout>
      <Helmet>
        <title>My Appointments</title>
      </Helmet>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-gray-600 mt-2">
            View and manage your upcoming and past appointments
          </p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <AppointmentsList />
        </div>
      </main>
    </MainLayout>
  );
} 