import { overviewApi } from '@/lib/api';
import { logError } from '@/utils/logger';
import type {
  EmployeeOverview as BEEmployeeOverview,
  DepartmentOverview as BEDepartmentOverview,
  ProductOverview as BEProductOverview,
  CustomerOverview as BECustomerOverview,
  CombinedOverview as BECombinedOverview,
  OverviewParams,
} from '@/lib/api/schemas/overview.schemas';
import { renderFullName } from '@/utils/string';

// Frontend-specific types
export type EmployeeOverview = {
  id: string;
  userId: string | undefined;
  employeeCode: string;
  fullName: string;
  departmentId: string | undefined;
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
};

export type CustomerOverview = {
  id: string;
  name: string;
  address: string | undefined;
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
  /**
   * Fetch combined overview data and return it as-is
   */
  async getOverviewData(params?: OverviewParams): Promise<OverviewData> {
    try {
      const response = await overviewApi.getCombinedOverview(params);
      return this.transformOverviewData(response);
    } catch (error) {
      logError('Failed to fetch overview data', error, {
        module: 'OverviewService',
        action: 'getOverviewData',
      });
      throw error;
    }
  },

  /**
   * Fetch overview data and return separated employee data
   */
  async getEmployeeOverview(params?: OverviewParams): Promise<EmployeeOverview[]> {
    const data = await this.getOverviewData(params);
    return data.employees;
  },

  /**
   * Fetch overview data and return separated department data
   */
  async getDepartmentOverview(params?: OverviewParams): Promise<DepartmentOverview[]> {
    const data = await this.getOverviewData(params);
    return data.departments;
  },

  /**
   * Fetch overview data and return separated product data
   */
  async getProductOverview(params?: OverviewParams): Promise<ProductOverview[]> {
    const data = await this.getOverviewData(params);
    return data.products;
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
      googleMapsUrl: beCustomer.googleMapsUrl ?? undefined,
    };
  },

  /**
   * Transform backend employee to frontend format
   */
  transformEmployee(beEmployee: BEEmployeeOverview): EmployeeOverview {
    const fullName = renderFullName(beEmployee);

    return {
      id: beEmployee.id,
      departmentId: beEmployee.departmentId ?? undefined,
      userId:
        beEmployee.userId === null || beEmployee.userId === undefined
          ? undefined
          : String(beEmployee.userId),
      fullName,
      employeeCode: beEmployee.employeeCode ?? '',
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
    };
  },
};
