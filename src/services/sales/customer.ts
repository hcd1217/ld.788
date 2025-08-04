import { firstName, lastName, randomElement } from '@/utils/fake';

export type Customer = {
  id: string;
  name: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  creditLimit?: number;
  currentBalance?: number;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Sample company names and domains
const companyNames = [
  'ABC Corporation',
  'XYZ Industries',
  'Global Tech Solutions',
  'Prime Manufacturing',
  'Elite Services',
  'Innovative Systems',
  'Quality Products Ltd',
  'Dynamic Enterprises',
  'Modern Solutions',
  'Advanced Technologies',
  'Future Vision Corp',
  'Smart Industries',
];

const domains = ['gmail.com', 'yahoo.com', 'company.com', 'business.com', 'corp.com'];

// Fake data generation
const generateFakeCustomers = (): Customer[] => {
  return Array.from({ length: 20 }, (_, index) => {
    const fname = firstName();
    const lname = lastName();
    const fullName = `${lname} ${fname}`;
    const company = randomElement(companyNames);
    const domain = randomElement(domains);

    return {
      id: `cust-${Date.now()}-${index}`,
      name: fullName,
      companyName: Math.random() > 0.3 ? company : undefined,
      contactEmail: `${fname.toLowerCase().replace(/\s+/g, '')}@${domain}`,
      contactPhone: `0${Math.floor(Math.random() * 9) + 1}0-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}`,
      creditLimit: Math.floor(Math.random() * 100 + 50) * 1000000, // 50M to 150M
      currentBalance: Math.floor(Math.random() * 40) * 1000000, // 0 to 40M
      address: `${Math.floor(Math.random() * 999) + 1} ${randomElement(['Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Võ Văn Tần'])} Street, District ${Math.floor(Math.random() * 12) + 1}`,
      isActive: Math.random() > 0.1, // 90% active
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2), // Past 2 years
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Past 30 days
    };
  });
};

export const customerService = {
  customers: [] as Customer[],

  async getAllCustomers(): Promise<Customer[]> {
    // Fake implementation
    if (this.customers.length === 0) {
      this.customers = generateFakeCustomers();
    }
    return Promise.resolve(this.customers);
  },

  async getCustomer(id: string): Promise<Customer | undefined> {
    if (this.customers.length === 0) {
      await this.getAllCustomers();
    }
    return Promise.resolve(this.customers.find((c) => c.id === id));
  },

  async getActiveCustomers(): Promise<Customer[]> {
    const all = await this.getAllCustomers();
    return all.filter((c) => c.isActive);
  },
};
