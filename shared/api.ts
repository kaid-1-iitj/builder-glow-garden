/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "admin" | "society_user" | "agent";
  societyId?: string;
  permissions?: {
    canRead: boolean;
    canWrite: boolean;
  };
}

export interface RegisterResponse {
  message: string;
  token: string;
  user: User;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "society_user" | "agent";
  societyId?: Society;
  permissions: {
    canRead: boolean;
    canWrite: boolean;
  };
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Society Types
export interface Society {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  registrationNumber?: string;
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  status: "active" | "inactive" | "suspended";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction Types
export interface Transaction {
  _id: string;
  vendorName: string;
  nature: string;
  amount?: number;
  status:
    | "pending_on_society"
    | "pending_on_agent"
    | "pending_for_clarification"
    | "completed";
  remarks: Array<{
    text: string;
    author: string;
    timestamp: string;
    type: "info" | "clarification" | "approval" | "rejection";
  }>;
  attachments: Array<{
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    uploadedAt: string;
  }>;
  createdBy: string;
  societyId: string;
  assignedToAgent?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
