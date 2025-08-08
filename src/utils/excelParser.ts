import * as XLSX from 'xlsx';

export type BulkCustomer = {
  name: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  creditLimit?: number;
};

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

        for (let index = 1; index < sheetData.length; index++) {
          const values = sheetData[index].map((v) => String(v).trim());

          if (values.every((v) => !v)) continue;

          const customer: BulkCustomer = {
            name: '',
          };

          for (const [headerIndex, header] of headers.entries()) {
            const value = values[headerIndex];
            if (!value) continue;

            switch (header) {
              case 'name':
                customer.name = value;
                break;
              case 'companyname':
                customer.companyName = value;
                break;
              case 'contactemail':
                customer.contactEmail = value;
                break;
              case 'contactphone':
                customer.contactPhone = value;
                break;
              case 'address':
                customer.address = value;
                break;
              case 'creditlimit':
                customer.creditLimit = parseFloat(value) || undefined;
                break;
              default:
                break;
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

export const generateCustomerExcelTemplate = () => {
  const headers = ['Name', 'CompanyName', 'ContactEmail', 'ContactPhone', 'Address', 'CreditLimit'];
  const sample = [
    ['John Doe', 'Acme Inc', 'john@acme.com', '555-1234', '123 Main St', '10000'],
    ['Jane Smith', 'Tech Corp', 'jane@tech.com', '555-5678', '456 Oak Ave', '15000'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sample]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  XLSX.writeFile(workbook, 'customers_template.xlsx');
};
