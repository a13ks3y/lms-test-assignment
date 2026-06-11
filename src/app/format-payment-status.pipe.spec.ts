import { FormatPaymentStatusPipe } from "./format-payment-status.pipe"

describe("Format payment status pipe", () => {
  let pipe: FormatPaymentStatusPipe;
  beforeEach(() => {
    pipe = new FormatPaymentStatusPipe();
  });

  it('should transform payment status to readble strings', () => {
    expect(pipe.transform('paid')).toEqual('Paid');
    expect(pipe.transform('pending')).toEqual('Pending');
    expect(pipe.transform('not_required')).toEqual('Not required');
  });
});
