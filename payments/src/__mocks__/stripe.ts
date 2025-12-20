// Mock Stripe for testing with charge tracking
const mockCharges: any[] = [];

export const stripe = {
  charges: {
    create: jest.fn().mockImplementation((params: any) => {
      const charge = {
        id: `mock_charge_${Math.random().toString(36).substring(7)}`,
        amount: params.amount,
        currency: params.currency || 'usd',
        status: 'succeeded',
        source: params.source,
      };
      mockCharges.push(charge);
      return Promise.resolve(charge);
    }),
    list: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        data: mockCharges,
      });
    }),
  },
};
