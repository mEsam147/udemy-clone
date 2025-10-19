// services/contact.service.ts
import { fetchWrapper } from "@/lib/api";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
  updatedAt: string;
}

export interface ContactStats {
  total: number;
  new: number;
  read: number;
  replied: number;
}

export const contactService = {
  // Create new contact message (public)
  createContact: (data: ContactFormData) =>
    fetchWrapper('/contact', 'POST', data),

  // Get all contacts (admin only)
  getContacts: () =>
    fetchWrapper('/contact', 'GET'),

  // Get contact by ID (admin only)
  getContact: (contactId: string) =>
    fetchWrapper(`/contact/${contactId}`, 'GET'),

  // Update contact (admin only)
  updateContact: (contactId: string, data: Partial<Contact>) =>
    fetchWrapper(`/contact/${contactId}`, 'PUT', data),

  // Delete contact (admin only)
  deleteContact: (contactId: string) =>
    fetchWrapper(`/contact/${contactId}`, 'DELETE'),

  // Get contact statistics (admin only)
  getContactStats: () =>
    fetchWrapper('/contact/stats/overview', 'GET'),
};