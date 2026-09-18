import { Patient } from "../types";

export class ReportService {
  /**
   * Generates a printable view or invokes native print
   */
  printReport(): void {
    window.print();
  }

  /**
   * Generates a clean filename for saving or downloading
   */
  generateReportFileName(patient: Patient): string {
    const cleanName = patient.name.replace(/[^a-zA-Z0-9]/g, "_");
    return `SmileProgress_Treatment_Report_${patient.id}_${cleanName}.pdf`;
  }

  /**
   * Copies shareable clinical report link to clipboard
   */
  async shareReport(patientId: string): Promise<string> {
    const url = `${window.location.origin}/patients/${patientId}/report`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
    return url;
  }
}

export const reportService = new ReportService();
