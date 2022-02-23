import { PaymentProvider } from '../types';

const BASE_URL = 'https://api.stripe.com/v1';

// TODO: fix this damn function
export const encodeFormData = (data: any, ctx: string[] = []): string => {
  return Object.entries(data)
    .flatMap(([key, value]) => {
      const [rootKey, ...keyParts] = ctx.concat(key);

      const fullKey = rootKey + keyParts.map((part) => `[${part}]`).join('');

      if (value === null || value === undefined) {
        return `${fullKey}=`;
      }

      if (Array.isArray(value)) {
        return value.map((v, i) => {
          if (typeof v === 'object') {
            return encodeFormData(v, ctx.concat(key + `[${i}]`));
          }

          return `${fullKey}[${i}]=${encodeURIComponent(v)}`;
        });
      }

      if (typeof value === 'object') {
        return encodeFormData(value, ctx.concat(key));
      }

      return `${fullKey}=${encodeURIComponent(String(value))}`;
    })
    .join('&');
};

export default function createStripePaymentProvider(options: {
  apiKey: string;
  premiumPriceId: string;
}): PaymentProvider {
  const api = async (
    endpoint: string,
    init: RequestInit & { data?: any } = {},
  ) => {
    const isWrite = ['post', 'put', 'patch'].includes(
      init.method?.toLowerCase() || 'get',
    );

    const contentType = isWrite
      ? 'application/x-www-form-urlencoded'
      : 'application/json';

    const body = init.body || isWrite ? encodeFormData(init.data) : undefined;

    const response = await fetch(BASE_URL + endpoint, {
      ...init,
      body,
      headers: {
        ...init.headers,
        'Content-Type': contentType,
        Authorization: `Bearer ${options.apiKey}`,
      },
    });

    const payload: any = await response.json();

    if (payload.error) {
      return new Error(payload.error.message);
    }

    return payload;
  };

  const stripe: PaymentProvider = {
    getSubscriptions: async (customerId) => {
      const response: any = await api(`/subscriptions?customer=${customerId}`);

      return (
        response.data?.map((sub: any) => ({
          id: sub.id,
          status: sub.status,
          items: sub.items.data.map((item: any) => ({
            id: item.id,
            price: { id: item.price.id },
          })),
        })) || []
      );
    },

    createSubscriptionManagementSession: async ({ customerId, returnUrl }) => {
      const data = await api('/billing_portal/sessions', {
        method: 'POST',
        data: {
          customer: customerId,
          return_url: returnUrl,
        },
      });

      return { id: data.id, url: data.url };
    },

    createBillionSession: async (params) => {
      const session: any = await api(`/checkout/sessions`, {
        method: 'POST',
        data: {
          mode: 'subscription',
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
          customer: params.customerId,
          line_items: [{ price: options.premiumPriceId, quantity: 1 }],
        },
      });

      if (session.error) {
        throw new Error(session.error.message);
      }

      return {
        id: session.id,
        url: session.url,
      };
    },

    getCustomerById: async (id) => {
      return api(`/customers/${id}`)
        .then(({ id, email }: any) => {
          return { id, email };
        })
        .catch((err) => {
          console.error(err);
          return null;
        });
    },

    getCustomerByEmail: async (email) => {
      return api(`/customers?email=${email}`)
        .then(({ data }: any) => {
          if (data.length === 0) {
            return null;
          }

          const { id, email } = data[0];
          return { id, email };
        })
        .catch((err) => {
          console.error(err);
          return null;
        });
    },

    upsertCustomer: async (info) => {
      const existing = await stripe.getCustomerByEmail(info.email);

      if (existing) {
        return existing;
      }

      return api('/customers', {
        method: 'POST',
        data: {
          email: info.email,
        },
      }).then(({ id, email }: any) => {
        return { id, email };
      });
    },

    updateCustomer: async (id, info) => {
      return api(`/customers/${id}`, {
        method: 'POST',
        data: {
          email: info.email,
        },
      }).then(({ id, email }: any) => {
        return { id, email };
      });
    },

    deleteCustomer: async (id) => {
      await api(`/customers/${id}`, {
        method: 'DELETE',
      });
    },
  };

  return stripe;
}
