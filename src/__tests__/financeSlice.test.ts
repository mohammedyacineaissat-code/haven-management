import { describe, it, expect, beforeEach } from 'vitest';
import { useNexiaStore } from '../store/useNexiaStore';

describe('financeSlice', () => {
  beforeEach(() => {
    // Reset store before each test
    useNexiaStore.setState({ paymentLedger: {} });
  });

  it('adds a payment to the ledger', async () => {
    const { addPayment } = useNexiaStore.getState();
    const testBuildingId = 'test-building-1';
    
    await addPayment(testBuildingId, {
      aptNumber: '101',
      amount: 5000,
      period: '2026-09',
      method: 'cash'
    });

    const state = useNexiaStore.getState();
    const payments = state.paymentLedger[testBuildingId];
    
    expect(payments).toBeDefined();
    expect(payments.length).toBe(1);
    expect(payments[0].amount).toBe(5000);
    expect(payments[0].aptNumber).toBe('101');
    expect(payments[0].method).toBe('cash');
    expect(payments[0].id).toMatch(/^pay-/);
  });

  it('removes a payment from the ledger', async () => {
    const { addPayment, removePayment } = useNexiaStore.getState();
    const testBuildingId = 'test-building-1';
    
    await addPayment(testBuildingId, {
      aptNumber: '102',
      amount: 3000,
      period: '2026-09',
      method: 'transfer'
    });

    let state = useNexiaStore.getState();
    const paymentId = state.paymentLedger[testBuildingId][0].id;

    await removePayment(testBuildingId, paymentId);

    state = useNexiaStore.getState();
    expect(state.paymentLedger[testBuildingId].length).toBe(0);
  });
});
