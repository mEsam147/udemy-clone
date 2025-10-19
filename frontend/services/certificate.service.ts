import { fetchWrapper } from "@/lib/api";

export interface Certificate {
  _id: string;
  courseId: string;
  userId: string;
  verificationCode: string;
  issuedAt: string;
}

export const certificateService = {
  getUserCertificates: async () => {
    return fetchWrapper(`/certificates/student`, "GET");
  },

  getCertificate: (courseId: string) =>
    fetchWrapper(`/certificates/course/${courseId}`, "GET"),

  verifyCertificate: (verificationCode: string) =>
    fetchWrapper(`/certificates/verify/${verificationCode}`, "GET"),
};
