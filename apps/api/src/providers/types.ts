import { Customer, CustomerInfo } from '@/types';

export interface AuthProvider {
  parseToken(token: string): Promise<JwtPayload | null>;
}

export interface JwtPayload {
  sub: string;
  exp: number;
  [key: string]: any;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  items: {
    id: string;
    price: {
      id: string;
    };
  }[];
}

export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid';

export interface BillionSession {
  id: string;
  url: string;
}

export interface SubscriptionManagementSession {
  id: string;
  url: string;
}

export interface PaymentProvider {
  getSubscriptions: (customerId: string) => Promise<Subscription[]>;
  getCustomerById: (id: string) => Promise<Customer | null>;
  getCustomerByEmail: (email: string) => Promise<Customer | null>;
  upsertCustomer: (info: CustomerInfo) => Promise<Customer>;
  updateCustomer: (id: string, info: CustomerInfo) => Promise<Customer | null>;
  deleteCustomer: (id: string) => Promise<void>;

  createBillionSession: (params: {
    customerId: string;
    successUrl: string;
    cancelUrl: string;
  }) => Promise<BillionSession>;

  createSubscriptionManagementSession: (params: {
    customerId: string;
    returnUrl: string;
  }) => Promise<SubscriptionManagementSession>;
}
