import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PatientsPage } from "./pages/PatientsPage";
import { CreatePatientPage } from "./pages/CreatePatientPage";
import { PatientDetailPage } from "./pages/PatientDetailPage";
import { PatientTreatmentPage } from "./pages/PatientTreatmentPage";
import { SmileSimulationPage } from "./pages/SmileSimulationPage";
import { PatientProgressPage } from "./pages/PatientProgressPage";
import { PatientReportPage } from "./pages/PatientReportPage";
import { SettingsPage } from "./pages/SettingsPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Routes wrapped in AppLayout */}
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />

        <Route
          path="/patients"
          element={
            <AppLayout>
              <PatientsPage />
            </AppLayout>
          }
        />

        <Route
          path="/patients/new"
          element={
            <AppLayout>
              <CreatePatientPage />
            </AppLayout>
          }
        />

        <Route
          path="/patients/:id"
          element={
            <AppLayout>
              <PatientDetailPage />
            </AppLayout>
          }
        />

        <Route
          path="/patients/:id/treatment"
          element={
            <AppLayout>
              <PatientTreatmentPage />
            </AppLayout>
          }
        />

        <Route
          path="/patients/:id/simulation"
          element={
            <AppLayout>
              <SmileSimulationPage />
            </AppLayout>
          }
        />

        <Route
          path="/patients/:id/progress"
          element={
            <AppLayout>
              <PatientProgressPage />
            </AppLayout>
          }
        />

        <Route
          path="/patients/:id/report"
          element={
            <AppLayout>
              <PatientReportPage />
            </AppLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          }
        />

        {/* Default redirect to /dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
