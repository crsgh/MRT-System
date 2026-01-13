export const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || '';

const BASE_URL = 'https://api.paymongo.com/v1';

const getHeaders = () => {
  const token = Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString('base64');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${token}`,
  };
};

export interface CreateSourceResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      amount: number;
      billing: any;
      currency: string;
      livemode: boolean;
      redirect: {
        checkout_url: string;
        failed: string;
        success: string;
      };
      status: string;
      type: string;
      created_at: number;
      updated_at: number;
    };
  };
}

export const createSource = async (
  amount: number,
  type: 'gcash' | 'grab_pay' | 'paymaya' | 'maya' | 'bpi' | 'ubp_online' = 'gcash',
  redirect: { success: string; failed: string }
): Promise<CreateSourceResponse> => {
  const normalizedType = type === 'maya' ? 'paymaya' : type;
  const response = await fetch(`${BASE_URL}/sources`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amount * 100, // PayMongo uses cents
          redirect: {
            success: redirect.success,
            failed: redirect.failed,
          },
          type: normalizedType,
          currency: 'PHP',
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.detail || 'Failed to create source');
  }

  return response.json();
};

export const retrieveSource = async (id: string) => {
  const response = await fetch(`${BASE_URL}/sources/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to retrieve source');
  }

  return response.json();
};

export const createPayment = async (amount: number, sourceId: string, description: string) => {
  const response = await fetch(`${BASE_URL}/payments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amount * 100, // PayMongo uses cents
          source: {
            id: sourceId,
            type: 'source',
          },
          currency: 'PHP',
          description,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.detail || 'Failed to create payment');
  }

  return response.json();
};
