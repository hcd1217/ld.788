import * as XLSX from 'xlsx';

export type BulkCustomer = {
  name: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  googleMapsUrl?: string;
  taxCode?: string;
};
// Cspell:disable
export const parseCustomerExcelFile = async (file: File): Promise<BulkCustomer[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
      try {
        const data = event.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const sheetData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        }) as string[][];

        if (sheetData.length < 2) {
          reject(new Error('File must contain at least a header row and one data row'));
          return;
        }

        const headers = sheetData[0].map((h) => String(h).trim().toLowerCase());
        const customers: BulkCustomer[] = [];

        // Map Vietnamese headers to English field names
        const headerMapping: Record<string, string> = {
          // English headers
          name: 'name',
          companyname: 'companyName',
          contactemail: 'contactEmail',
          contactphone: 'contactPhone',
          address: 'address',
          googlemapsurl: 'googleMapsUrl',
          taxcode: 'taxCode',
          // Vietnamese headers
          tên: 'name',
          'tên công ty': 'companyName',
          'email liên hệ': 'contactEmail',
          'điện thoại': 'contactPhone',
          'địa chỉ': 'address',
          'google maps url': 'googleMapsUrl',
          'mã số thuế': 'taxCode',
        };

        for (let index = 1; index < sheetData.length; index++) {
          const values = sheetData[index].map((v) => String(v).trim());

          if (values.every((v) => !v)) continue;

          const customer: BulkCustomer = {
            name: '',
          };

          for (const [headerIndex, header] of headers.entries()) {
            const value = values[headerIndex];
            if (!value) continue;

            const fieldName = headerMapping[header];
            if (!fieldName) continue;

            switch (fieldName) {
              case 'name': {
                customer.name = value;
                break;
              }
              case 'companyName': {
                customer.companyName = value;
                break;
              }
              case 'contactEmail': {
                customer.contactEmail = value;
                break;
              }
              case 'contactPhone': {
                customer.contactPhone = value;
                break;
              }
              case 'address': {
                customer.address = value;
                break;
              }
              case 'googleMapsUrl': {
                customer.googleMapsUrl = value;
                break;
              }
              case 'taxCode': {
                customer.taxCode = value;
                break;
              }
              default: {
                break;
              }
            }
          }

          if (customer.name) {
            customers.push(customer);
          }
        }

        resolve(customers);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse Excel file: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          ),
        );
      }
    });

    reader.addEventListener('error', () => {
      reject(new Error('Failed to read file'));
    });

    reader.readAsArrayBuffer(file);
  });
};

export const generateCustomerExcelTemplate = (language?: string) => {
  const isVietnamese = language === 'vi';

  // Headers based on locale
  const headers = isVietnamese
    ? [
        'Tên',
        'Tên Công ty',
        'Email Liên hệ',
        'Điện thoại',
        'Địa chỉ',
        'Google Maps URL',
        'Mã số thuế',
      ]
    : [
        'Name',
        'CompanyName',
        'ContactEmail',
        'ContactPhone',
        'Address',
        'GoogleMapsUrl',
        'TaxCode',
      ];

  // Sample data based on locale
  const sample = isVietnamese
    ? [
        [
          'Công ty ABC',
          'Công ty TNHH ABC Việt Nam',
          'lienhe@abc.vn',
          '0901234567',
          '123 Nguyễn Huệ, Q1, TP.HCM',
          'https://maps.app.goo.gl/example1',
          '0123456789',
        ],
        [
          'Doanh nghiệp XYZ',
          'Công ty Cổ phần XYZ',
          'info@xyz.vn',
          '0987654321',
          '456 Lê Lợi, Q1, TP.HCM',
          'https://maps.app.goo.gl/example2',
          '9876543210',
        ],
      ]
    : [
        [
          'John Doe',
          'NKTU Inc',
          'john@NKTU.com',
          '555-1234',
          '123 Main St',
          'https://maps.app.goo.gl/example1',
          'TAX-001',
        ],
        [
          'Jane Smith',
          'Tech Corp',
          'jane@tech.com',
          '555-5678',
          '456 Oak Ave',
          'https://maps.app.goo.gl/example2',
          'TAX-002',
        ],
      ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sample]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  XLSX.writeFile(workbook, 'customers_template.xlsx');
};

// Product bulk import types and functions
export type BulkProduct = {
  productCode: string;
  name: string;
  description?: string;
  category?: string;
  color?: string;
  status?: string;
  unit?: string;
  sku?: string;
  barcode?: string;
};

export const parseProductExcelFile = async (file: File): Promise<BulkProduct[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
      try {
        const data = event.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const sheetData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        }) as string[][];

        if (sheetData.length < 2) {
          reject(new Error('File must contain at least a header row and one data row'));
          return;
        }

        const headers = sheetData[0].map((h) => String(h).trim().toLowerCase());
        const products: BulkProduct[] = [];

        // Map Vietnamese headers to English field names
        const headerMapping: Record<string, string> = {
          // English headers
          productcode: 'productCode',
          name: 'name',
          description: 'description',
          category: 'category',
          color: 'color',
          status: 'status',
          unit: 'unit',
          sku: 'sku',
          barcode: 'barcode',
          // Vietnamese headers
          'mã sản phẩm': 'productCode',
          tên: 'name',
          'tên sản phẩm': 'name',
          'mô tả': 'description',
          'danh mục': 'category',
          loại: 'category',
          'màu sắc': 'color',
          'trạng thái': 'status',
          'đơn vị': 'unit',
          'mã sku': 'sku',
          'mã vạch': 'barcode',
        };

        for (let index = 1; index < sheetData.length; index++) {
          const values = sheetData[index].map((v) => String(v).trim());

          if (values.every((v) => !v)) continue;

          const product: BulkProduct = {
            productCode: '',
            name: '',
          };

          for (const [headerIndex, header] of headers.entries()) {
            const value = values[headerIndex];
            if (!value) continue;

            const fieldName = headerMapping[header];
            if (!fieldName) continue;

            switch (fieldName) {
              case 'productCode': {
                product.productCode = value;
                break;
              }
              case 'name': {
                product.name = value;
                break;
              }
              case 'description': {
                product.description = value;
                break;
              }
              case 'category': {
                product.category = value;
                break;
              }
              case 'color': {
                product.color = value;
                break;
              }
              case 'status': {
                product.status = value.toUpperCase();
                break;
              }
              case 'unit': {
                product.unit = value;
                break;
              }
              case 'sku': {
                product.sku = value;
                break;
              }
              case 'barcode': {
                product.barcode = value;
                break;
              }
              default: {
                break;
              }
            }
          }

          if (product.productCode && product.name) {
            products.push(product);
          }
        }

        resolve(products);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse Excel file: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          ),
        );
      }
    });

    reader.addEventListener('error', () => {
      reject(new Error('Failed to read file'));
    });

    reader.readAsArrayBuffer(file);
  });
};

export const generateProductExcelTemplate = (language?: string) => {
  const isVietnamese = language === 'vi';

  // Headers based on locale
  const headers = isVietnamese
    ? [
        'Mã sản phẩm',
        'Tên sản phẩm',
        'Mô tả',
        'Danh mục',
        'Màu sắc',
        'Trạng thái',
        'Đơn vị',
        'Mã SKU',
        'Mã vạch',
      ]
    : [
        'ProductCode',
        'Name',
        'Description',
        'Category',
        'Color',
        'Status',
        'Unit',
        'SKU',
        'Barcode',
      ];

  // Sample data based on locale
  const sample = isVietnamese
    ? [
        [
          'MX_800',
          'Mâm xoay bàn nhôm 800mm',
          'Mâm xoay cho bàn ăn, chất liệu nhôm cao cấp',
          'Phụ kiện bàn',
          'Trắng',
          'ACTIVE',
          'Cái',
          'SKU001',
          '8935001234567',
        ],
        [
          'KC_500',
          'Kính cường lực 500x500mm',
          'Kính cường lực 10mm cho mặt bàn',
          'Kính',
          'Trong suốt',
          'ACTIVE',
          'Tấm',
          'SKU002',
          '8935001234568',
        ],
        [
          'CB_1200',
          'Chân bàn sắt 1200mm',
          'Chân bàn sắt sơn tĩnh điện',
          'Phụ kiện bàn',
          'Đen',
          'ACTIVE',
          'Bộ',
          'SKU003',
          '8935001234569',
        ],
      ]
    : [
        [
          'PROD001',
          'Office Desk',
          'Ergonomic office desk with adjustable height',
          'Furniture',
          'Brown',
          'ACTIVE',
          'pcs',
          'SKU001',
          '123456789012',
        ],
        [
          'PROD002',
          'Office Chair',
          'Comfortable office chair with lumbar support',
          'Furniture',
          'Black',
          'ACTIVE',
          'pcs',
          'SKU002',
          '123456789013',
        ],
        [
          'PROD003',
          'Monitor Stand',
          'Adjustable monitor stand with USB hub',
          'Accessories',
          'Silver',
          'ACTIVE',
          'pcs',
          'SKU003',
          '123456789014',
        ],
      ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sample]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  XLSX.writeFile(workbook, 'products_template.xlsx');
};
