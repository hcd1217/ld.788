import type { Employee } from "../hr/employee";
import type { Customer } from "./customer";

export type PurchasingOrder = {
  id: string;
  status: string;
  poNumber: string;
  customerId: string;
  customer?: Customer;
  createdBy?: Employee;
  createdAt?: Date;
  approvedBy?: Employee;
  approvedAt?: Date;
  deliveredBy?: Employee;
  deliveredAt?: Date;
  updatedAt?: Date;
  content: string;
  detail?: {
    id: string;
    productName: string;
    unit: string;
    amount: string;
    unitPrice: number;
    taxRate: number;
    subTotalAmount: number;
    taxAmount: number;
    totalAmount: number;
  }[]
  subTotalAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  memo: string;
};
