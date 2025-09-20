// Contacts API services

import { apiClient, PaginatedResponse } from '../api';

export interface Contact {
  id: number;
  name: string;
  contact_type: 'customer' | 'vendor' | 'both';
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  gst_number?: string;
  pan_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContactRequest {
  name: string;
  contact_type: 'customer' | 'vendor' | 'both';
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  gst_number?: string;
  pan_number?: string;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {
  is_active?: boolean;
}

// Contacts API functions
export const contactsApi = {
  // Get all contacts with pagination and filters
  async getContacts(params?: {
    page?: number;
    search?: string;
    contact_type?: string;
    is_active?: boolean;
    ordering?: string;
  }): Promise<PaginatedResponse<Contact>> {
    return apiClient.get<PaginatedResponse<Contact>>('/master/contacts/', params);
  },

  // Get single contact by ID
  async getContact(id: number): Promise<Contact> {
    return apiClient.get<Contact>(`/master/contacts/${id}/`);
  },

  // Create new contact
  async createContact(contactData: CreateContactRequest): Promise<Contact> {
    return apiClient.post<Contact>('/master/contacts/', contactData);
  },

  // Update contact
  async updateContact(id: number, contactData: UpdateContactRequest): Promise<Contact> {
    return apiClient.put<Contact>(`/master/contacts/${id}/`, contactData);
  },

  // Partially update contact
  async patchContact(id: number, contactData: Partial<UpdateContactRequest>): Promise<Contact> {
    return apiClient.patch<Contact>(`/master/contacts/${id}/`, contactData);
  },

  // Delete contact
  async deleteContact(id: number): Promise<void> {
    return apiClient.delete<void>(`/master/contacts/${id}/`);
  },

  // Get only customers
  async getCustomers(): Promise<Contact[]> {
    return apiClient.get<Contact[]>('/master/contacts/customers/');
  },

  // Get only vendors
  async getVendors(): Promise<Contact[]> {
    return apiClient.get<Contact[]>('/master/contacts/vendors/');
  },
};
