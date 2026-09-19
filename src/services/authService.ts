import { DoctorUser } from "../types";

const AUTH_USER_KEY = "smileprogress_auth_user";

const DEFAULT_DOCTOR: DoctorUser = {
  name: "Dr. Alexander Wright, DDS",
  email: "dr.wright@smileprogress.dental",
  phone: "+1 (555) 234-5678",
  clinicName: "Wright Aesthetic & Digital Smile Center",
  specialization: "Aesthetic Dentistry & Orthodontics",
  licenseNumber: "DDS-948210",
  avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
};

export class AuthService {
  getCurrentUser(): DoctorUser {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (!stored) {
        this.setUser(DEFAULT_DOCTOR);
        return DEFAULT_DOCTOR;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_DOCTOR;
    }
  }

  setUser(user: DoctorUser): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  login(email: string): DoctorUser {
    const current = this.getCurrentUser();
    const updated = { ...current, email };
    this.setUser(updated);
    return updated;
  }

  register(doctor: Partial<DoctorUser>): DoctorUser {
    const newUser: DoctorUser = {
      name: doctor.name || "Dr. Dental Specialist",
      email: doctor.email || "doctor@clinic.com",
      phone: doctor.phone || "+1 (555) 000-0000",
      clinicName: doctor.clinicName || "Digital Smile Clinic",
      specialization: doctor.specialization || "Cosmetic Dentistry",
      licenseNumber: doctor.licenseNumber || "DDS-000000",
      avatarUrl: DEFAULT_DOCTOR.avatarUrl,
    };
    this.setUser(newUser);
    return newUser;
  }

  updateProfile(updates: Partial<DoctorUser>): DoctorUser {
    const current = this.getCurrentUser();
    const updated = { ...current, ...updates };
    this.setUser(updated);
    return updated;
  }

  logout(): void {
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

export const authService = new AuthService();
