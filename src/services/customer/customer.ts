export type Customer = {
  id: string;
  status: string;
  name: string;
  content: string;
  taxCode: string;
};

export const customerService = {
  customers: [] as Customer[],
  async getAllCustomer(): Promise<Customer[]> {
    if (!this.customers.length) {
      // @todo: implement api call
    }
    return this.customers;
  },
}
