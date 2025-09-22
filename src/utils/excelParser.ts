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
// cspell:disable
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
          pic: 'pic',
          taxcode: 'taxCode',
          // Vietnamese headers
          tên: 'name',
          'tên công ty': 'companyName',
          'email liên hệ': 'contactEmail',
          'điện thoại': 'contactPhone',
          'địa chỉ': 'address',
          'google maps url': 'googleMapsUrl',
          'người liên hệ': 'pic',
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

// Employee bulk import types and functions
export type BulkEmployee = {
  firstName: string;
  lastName: string;
  departmentName?: string;
  email?: string;
  phone?: string;
};

export const parseEmployeeExcelFile = async (file: File): Promise<BulkEmployee[]> => {
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
        const employees: BulkEmployee[] = [];

        // Map Vietnamese headers to English field names
        const headerMapping: Record<string, string> = {
          // English headers
          firstname: 'firstName',
          lastname: 'lastName',
          department: 'departmentName',
          email: 'email',
          phone: 'phone',
          // Vietnamese headers
          họ: 'lastName',
          tên: 'firstName',
          'bộ phận': 'departmentName',
          'điện thoại': 'phone',
          'số điện thoại': 'phone',
        };

        for (let index = 1; index < sheetData.length; index++) {
          const values = sheetData[index].map((v) => String(v).trim());

          if (values.every((v) => !v)) continue;

          const employee: BulkEmployee = {
            firstName: '',
            lastName: '',
          };

          for (const [headerIndex, header] of headers.entries()) {
            const value = values[headerIndex];
            if (!value) continue;

            const fieldName = headerMapping[header];
            if (!fieldName) continue;

            switch (fieldName) {
              case 'firstName': {
                employee.firstName = value;
                break;
              }
              case 'lastName': {
                employee.lastName = value;
                break;
              }
              case 'departmentName': {
                employee.departmentName = value;
                break;
              }
              case 'email': {
                employee.email = value;
                break;
              }
              case 'phone': {
                employee.phone = value;
                break;
              }
              default: {
                break;
              }
            }
          }

          if (employee.firstName && employee.lastName) {
            employees.push(employee);
          }
        }

        resolve(employees);
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

export const generateEmployeeExcelTemplate = (language?: string, departments?: string[]) => {
  const isVietnamese = language === 'vi';

  // Build headers based on locale
  const headers = isVietnamese
    ? ['Họ', 'Tên', 'Bộ phận', 'Email', 'Điện thoại']
    : ['FirstName', 'LastName', 'Department', 'Email', 'Phone'];

  // Build sample data
  const sampleDepartments = departments?.length
    ? departments
    : ['Sales', 'Marketing', 'Engineering'];
  const sample = isVietnamese
    ? [
        [
          'Nguyễn',
          'An',
          sampleDepartments[0] || 'Kinh doanh',
          'an.nguyen@example.com',
          '0901234567',
        ],
        [
          'Trần',
          'Bình',
          sampleDepartments[1] || 'Marketing',
          'binh.tran@example.com',
          '0987654321',
        ],
        ['Lê', 'Chi', sampleDepartments[2] || 'Kỹ thuật', 'chi.le@example.com', '0912345678'],
      ]
    : [
        ['John', 'Doe', sampleDepartments[0] || 'Sales', 'john.doe@example.com', '555-1234'],
        [
          'Jane',
          'Smith',
          sampleDepartments[1] || 'Marketing',
          'jane.smith@example.com',
          '555-5678',
        ],
        [
          'Mike',
          'Johnson',
          sampleDepartments[2] || 'Engineering',
          'mike.johnson@example.com',
          '555-9012',
        ],
      ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sample]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

  XLSX.writeFile(workbook, 'employees_template.xlsx');
};

export const generateCustomerExcelTemplate = (
  language?: string,
  features?: { noEmail?: boolean; noTaxCode?: boolean },
) => {
  const isVietnamese = language === 'vi';
  const { noEmail = false, noTaxCode = false } = features ?? {};

  // Build headers based on locale and features
  const headers = [];

  // Always include required fields
  if (isVietnamese) {
    headers.push('Tên', 'Tên Công ty', 'Người liên hệ');
    if (!noEmail) headers.push('Email Liên hệ');
    headers.push('Điện thoại', 'Địa chỉ', 'Google Maps URL');
    if (!noTaxCode) headers.push('Mã số thuế');
  } else {
    headers.push('Name', 'CompanyName');
    if (!noEmail) headers.push('ContactEmail');
    headers.push('ContactPhone', 'Address', 'GoogleMapsUrl');
    if (!noTaxCode) headers.push('TaxCode');
  }

  // Build sample data based on locale and features
  const buildSampleRow = (
    name: string,
    company: string,
    pic: string,
    email: string,
    phone: string,
    address: string,
    mapsUrl: string,
    taxCode: string,
  ) => {
    const row = [name, company, pic];
    if (!noEmail) row.push(email);
    row.push(phone, address, mapsUrl);
    if (!noTaxCode) row.push(taxCode);
    return row;
  };

  const sample = isVietnamese
    ? [
        buildSampleRow(
          'Công ty ABC',
          'Công ty TNHH ABC Việt Nam',
          'Nguyễn Văn An',
          'lienhe@abc.vn',
          '0901234567',
          '123 Nguyễn Huệ, Q1, TP.HCM',
          'https://maps.app.goo.gl/example1',
          '0123456789',
        ),
        buildSampleRow(
          'Doanh nghiệp XYZ',
          'Công ty Cổ phần XYZ',
          'Nguyễn Văn An',
          'info@xyz.vn',
          '0987654321',
          '456 Lê Lợi, Q1, TP.HCM',
          'https://maps.app.goo.gl/example2',
          '9876543210',
        ),
      ]
    : [
        buildSampleRow(
          'Company',
          'Company Inc',
          'John Doe',
          'john@company.com',
          '555-1234',
          '123 Main St',
          'https://maps.app.goo.gl/example1',
          'TAX-001',
        ),
        buildSampleRow(
          'Tech',
          'Tech Corp',
          'Jane Smith',
          'jane@tech.com',
          '555-5678',
          '456 Oak Ave',
          'https://maps.app.goo.gl/example2',
          'TAX-002',
        ),
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
  unit?: string;
  color?: string;
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
          unit: 'unit',
          color: 'color',
          // Vietnamese headers
          'mã sản phẩm': 'productCode',
          tên: 'name',
          'tên sản phẩm': 'name',
          'mô tả': 'description',
          'danh mục': 'category',
          loại: 'category',
          'đơn vị': 'unit',
          'màu sắc': 'color',
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
              case 'unit': {
                product.unit = value;
                break;
              }
              case 'color': {
                product.color = value;
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
    ? ['Mã sản phẩm', 'Tên sản phẩm', 'Mô tả', 'Danh mục', 'Đơn vị', 'Màu sắc']
    : ['ProductCode', 'Name', 'Description', 'Category', 'Department', 'Color'];

  // Sample data based on locale
  const sample = isVietnamese
    ? [
        [
          'MX_800',
          'Mâm xoay bàn nhôm 800mm',
          'Mâm xoay cho bàn ăn, chất liệu nhôm cao cấp',
          'Phụ kiện bàn',
          'Cái',
          'Trắng',
        ],
        [
          'KC_500',
          'Kính cường lực 500x500mm',
          'Kính cường lực 10mm cho mặt bàn',
          'Kính',
          'Tấm',
          'Trong suốt',
        ],
        [
          'CB_1200',
          'Chân bàn sắt 1200mm',
          'Chân bàn sắt sơn tĩnh điện',
          'Phụ kiện bàn',
          'Bộ',
          'Đen',
        ],
      ]
    : [
        [
          'PROD001',
          'Office Desk',
          'Ergonomic office desk with adjustable height',
          'Furniture',
          'pcs',
          'Brown',
        ],
        [
          'PROD002',
          'Office Chair',
          'Comfortable ergonomic chair with lumbar support',
          'Furniture',
          'pcs',
          'Black',
        ],
        [
          'PROD003',
          'Monitor Stand',
          'Adjustable monitor stand with cable management',
          'Accessories',
          'pcs',
          'Silver',
        ],
      ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sample]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  XLSX.writeFile(workbook, 'products_template.xlsx');
};
