import { overviewApi } from '@/lib/api';
import type {
  CombinedOverview as BECombinedOverview,
  CustomerOverview as BECustomerOverview,
  DepartmentOverview as BEDepartmentOverview,
  EmployeeOverview as BEEmployeeOverview,
  ProductOverview as BEProductOverview,
  OverviewParams,
} from '@/lib/api/schemas/overview.schemas';
import { renderFullName } from '@/utils/string';

// Frontend-specific types
export type EmployeeOverview = {
  id: string;
  userId: string | undefined;
  employeeCode: string;
  fullName: string;
  departmentName: string | undefined;
};

export type DepartmentOverview = {
  id: string;
  name: string;
  code: string;
};

export type ProductOverview = {
  id: string;
  name: string;
  code: string;
  unit: string;
};

export type CustomerOverview = {
  id: string;
  name: string;
  isActive: boolean;
  deliveryAddress: string | undefined;
  address: string | undefined;
  pic: string | undefined;
  phone: string | undefined;
  email: string | undefined;
  googleMapsUrl: string | undefined;
};

export type OverviewData = {
  employees: EmployeeOverview[];
  departments: DepartmentOverview[];
  products: ProductOverview[];
  customers: CustomerOverview[];
};

// Service object
export const overviewService = {
  overviewData: undefined as OverviewData | undefined,
  /**
   * Fetch combined overview data and return it as-is
   */
  async getOverviewData(params?: OverviewParams): Promise<OverviewData> {
    if (this.overviewData) {
      return this.overviewData;
    }
    const response = await overviewApi.getCombinedOverview(params);
    this.overviewData = this.transformOverviewData(response);
    return this.overviewData;
  },

  /**
   * Fetch overview data and return separated customer data
   */
  async getCustomerOverview(params?: OverviewParams): Promise<Map<string, CustomerOverview>> {
    const data = await this.getOverviewData(params);
    return new Map(data.customers.map((customer) => [customer.id, customer]));
  },

  /**
   * Fetch overview data and return separated employee data
   */
  async getEmployeeOverview(params?: OverviewParams): Promise<Map<string, EmployeeOverview>> {
    const data = await this.getOverviewData(params);
    return new Map(data.employees.map((employee) => [employee.id, employee]));
  },

  /**
   * Transform backend data to frontend format
   */
  transformOverviewData(beData: BECombinedOverview): OverviewData {
    return {
      employees: beData.employees.map(this.transformEmployee),
      departments: beData.departments.map(this.transformDepartment),
      products: beData.products.map(this.transformProduct),
      customers: beData.customers.map(this.transformCustomer),
    };
  },

  /**
   * Transform backend customer to frontend format
   */
  transformCustomer(beCustomer: BECustomerOverview): CustomerOverview {
    return {
      id: beCustomer.id,
      name: beCustomer.name,
      address: beCustomer.address ?? undefined,
      pic: beCustomer.pic ?? undefined,
      phone: beCustomer.phone ?? undefined,
      email: beCustomer.email ?? undefined,
      googleMapsUrl: beCustomer.googleMapsUrl ?? undefined,
      isActive: beCustomer.isActive,
      deliveryAddress: beCustomer.deliveryAddress ?? beCustomer.address ?? undefined,
    };
  },

  /**
   * Transform backend employee to frontend format
   */
  transformEmployee(beEmployee: BEEmployeeOverview): EmployeeOverview {
    const fullName = renderFullName(beEmployee);

    return {
      id: beEmployee.id,
      userId:
        beEmployee.userId === null || beEmployee.userId === undefined
          ? undefined
          : String(beEmployee.userId),
      fullName,
      employeeCode: beEmployee.employeeCode ?? '',
      departmentName: beEmployee.departmentName ?? undefined,
    };
  },

  /**
   * Transform backend department to frontend format
   */
  transformDepartment(beDepartment: BEDepartmentOverview): DepartmentOverview {
    return {
      id: beDepartment.id,
      name: beDepartment.name,
      code: beDepartment.code,
    };
  },

  /**
   * Transform backend product to frontend format
   */
  transformProduct(beProduct: BEProductOverview): ProductOverview {
    return {
      id: beProduct.id,
      name: beProduct.name,
      code: beProduct.code,
      unit: beProduct.unit,
    };
  },
};
