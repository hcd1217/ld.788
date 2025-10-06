import { type Vendor as APIVendor, salesApi } from '@/lib/api';
import {
  type BulkUpsertVendorsRequest,
  type BulkUpsertVendorsResponse,
} from '@/lib/api/schemas/sales.schemas';

// Re-export types for compatibility
export type {
  CreateVendorRequest,
  UpdateVendorRequest,
  BulkUpsertVendorsRequest,
  BulkUpsertVendorsResponse,
} from '@/lib/api/schemas/sales.schemas';

export type Vendor = {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  googleMapsUrl?: string;
  memo?: string;
  taxCode?: string;
  isActive: boolean;
  pic?: string;
};

/**
 * Transform API Vendor to Frontend Vendor
 */
function transformVendor(vendor: APIVendor): Vendor {
  return {
    ...vendor,
    name: vendor.name,
    contactEmail: vendor.contactEmail,
    contactPhone: vendor.contactPhone,
    address: vendor.address,
    googleMapsUrl: vendor.googleMapsUrl,
    taxCode: vendor.taxCode,
    isActive: vendor.isActive ?? true,
    memo: vendor.memo,
    pic: vendor.pic,
  };
}

export const vendorService = {
  async getAllVendors(): Promise<Vendor[]> {
    const response = await salesApi.getVendors();
    return response.vendors.map(transformVendor).sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return a.name.localeCompare(b.name);
    });
  },

  async getVendor(id: string): Promise<Vendor | undefined> {
    try {
      const response = await salesApi.getVendors();
      const vendor = response.vendors.find((v) => v.id === id);
      return vendor ? transformVendor(vendor) : undefined;
    } catch {
      return undefined;
    }
  },

  async createVendor(data: Omit<Vendor, 'metadata' | 'id' | 'clientId'>): Promise<Vendor> {
    const vendor = await salesApi.createVendor({
      ...data,
      metadata: {
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        googleMapsUrl: data.googleMapsUrl,
        taxCode: data.taxCode,
        memo: data.memo || undefined,
        isActive: true,
        pic: data.pic,
      },
    });
    return transformVendor(vendor);
  },

  async updateVendor(
    id: string,
    data: Omit<Vendor, 'metadata' | 'id' | 'clientId'>,
  ): Promise<void> {
    console.log('updateVendor', data);
    await salesApi.updateVendor(id, {
      ...data,
      metadata: {
        contactEmail: data.contactEmail || undefined,
        contactPhone: data.contactPhone || undefined,
        address: data.address || undefined,
        googleMapsUrl: data.googleMapsUrl || undefined,
        taxCode: data.taxCode || undefined,
        memo: data.memo || undefined,
        isActive: data.isActive ?? true,
        pic: data.pic || undefined,
      },
    });
  },

  async deleteVendor(id: string): Promise<void> {
    await salesApi.deleteVendor(id);
  },

  async activateVendor(vendor: Vendor): Promise<void> {
    await salesApi.updateVendor(vendor.id, {
      metadata: {
        isActive: true,
      },
    });
  },

  async deactivateVendor(vendor: Vendor): Promise<void> {
    await salesApi.updateVendor(vendor.id, {
      metadata: {
        isActive: false,
      },
    });
  },

  async bulkUpsertVendors(data: BulkUpsertVendorsRequest): Promise<BulkUpsertVendorsResponse> {
    return salesApi.bulkUpsertVendors(data);
  },
};
