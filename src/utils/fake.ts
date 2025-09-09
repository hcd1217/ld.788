import type { GetMeResponse } from '@/lib/api/schemas/auth.schemas';
import { normalizeVietnameseChars } from './string';

// Cspell:disable
const lastNames = [
  'Bùi',
  'Châu',
  'Cao',
  'Dương',
  'Hoàng',
  'Huỳnh',
  'Hà',
  'Hồ',
  'Lâm',
  'Lê',
  'Lý',
  'Lưu',
  'Lương',
  'Mai',
  'Nguyễn',
  'Ngô',
  'Phan',
  'Phùng',
  'Phạm',
  'Trương',
  'Trần',
  'Trịnh',
  'Tăng',
  'Tạ',
  'Võ',
  'Vũ',
  'Đinh',
  'Đoàn',
  'Đào',
  'Đặng',
  'Đỗ',
];

const firstNames: Array<[string, 'F' | 'M']> = [
  ['An Nhiên', 'F'],
  ['Anh Duy', 'M'],
  ['Anh Dũng', 'M'],
  ['Anh Khoa', 'M'],
  ['Anh Khôi', 'M'],
  ['Anh Minh', 'M'],
  ['Anh Thư', 'F'],
  ['Anh Tuấn', 'M'],
  ['Anh Vũ', 'M'],
  ['Anh Đào', 'F'],
  ['Anh Đức', 'M'],
  ['Bình Minh', 'F'],
  ['Bình Minh', 'M'],
  ['Bình Nguyên', 'M'],
  ['Bích Chiêu', 'F'],
  ['Bích Châu', 'F'],
  ['Bích Hiền', 'F'],
  ['Bích Hợp', 'F'],
  ['Bích Liên', 'F'],
  ['Băng Tâm', 'F'],
  ['Bạch Liên', 'F'],
  ['Bạch Mai', 'F'],
  ['Bạch Tuyết', 'F'],
  ['Bạch Yến', 'F'],
  ['Bảo An', 'F'],
  ['Bảo Anh', 'F'],
  ['Bảo Bình', 'M'],
  ['Bảo Nghi', 'F'],
  ['Bảo Quốc', 'M'],
  ['Bảo Trâm', 'F'],
  ['Bảo Trân', 'F'],
  ['Cao Minh', 'M'],
  ['Chiêu Nghi', 'F'],
  ['Chiêu Quân', 'F'],
  ['Chí Công', 'M'],
  ['Chí Thiện', 'M'],
  ['Mạnh Hùng', 'M'],
  ['Bá Hưng', 'M'],
  ['Thành Phong', 'M'],
  ['Cát Tường', 'F'],
  ['Công Duy', 'M'],
  ['Công Lý', 'M'],
  ['Công Tuấn', 'M'],
  ['Cẩm Linh', 'F'],
  ['Cẩm Ly', 'F'],
  ['Cẩm Nhung', 'F'],
  ['Cẩm Vân', 'F'],
  ['Diễm My', 'F'],
  ['Diễm Phương', 'F'],
  ['Diệu Anh', 'F'],
  ['Diệu Hiền', 'F'],
  ['Duy Anh', 'M'],
  ['Duy Hùng', 'M'],
  ['Duy Khang', 'M'],
  ['Duy Khương', 'M'],
  ['Duy Mạnh', 'M'],
  ['Dạ Thảo', 'F'],
  ['Gia Bình', 'M'],
  ['Gia Bảo', 'M'],
  ['Gia Huy', 'M'],
  ['Gia Hào', 'M'],
  ['Gia Hưng', 'M'],
  ['Gia Khánh', 'M'],
  ['Gia Linh', 'F'],
  ['Giáng Ngọc', 'F'],
  ['Giáng Tiên', 'F'],
  ['Giáng Uyên', 'F'],
  ['Hiếu Minh', 'M'],
  ['Hiếu Nghĩa', 'M'],
  ['Hiền Mai', 'F'],
  ['Hiền Thục', 'F'],
  ['Hoài Nam', 'M'],
  ['Hoài Phong', 'M'],
  ['Hoài Phương', 'F'],
  ['Hoài Thanh', 'M'],
  ['Hoài Trung', 'M'],
  ['Hoàng Oanh', 'F'],
  ['Hoàng Phát', 'M'],
  ['Hoàng Quân', 'M'],
  ['Huyền Trang', 'F'],
  ['Huệ An', 'F'],
  ['Huệ Linh', 'F'],
  ['Hương Thảo', 'F'],
  ['Hương Thủy', 'F'],
  ['Hương Trà', 'F'],
  ['Hướng Dương', 'F'],
  ['Hữu Bình', 'M'],
  ['Hữu Tín', 'M'],
  ['Hữu Trí', 'M'],
  ['Hữu Đạt', 'M'],
  ['Khánh Chi', 'F'],
  ['Khánh Trâm', 'F'],
  ['Kim Ngân', 'F'],
  ['Mai Hương', 'F'],
  ['Minh Anh', 'M'],
  ['Minh Châu', 'F'],
  ['Minh Khuê', 'F'],
  ['Minh Quân', 'M'],
  ['Mỹ Dung', 'F'],
  ['Mỹ Lan', 'F'],
  ['Như Anh', 'F'],
  ['Như Ngọc', 'F'],
  ['Như Quỳnh', 'F'],
  ['Như Lan', 'F'],
  ['Như Hoa', 'F'],
  ['Nguyên Thảo', 'F'],
  ['Nguyên Anh', 'F'],
  ['Nguyệt Anh', 'F'],
  ['Nguyệt Minh', 'F'],
  ['Nguyệt Quế', 'F'],
  ['Nguyệt Ánh', 'F'],
  ['Ngọc Anh', 'F'],
  ['Ngọc Anh', 'F'],
  ['Ngọc Dung', 'F'],
  ['Ngọc Hiền', 'F'],
  ['Ngọc Hoa', 'F'],
  ['Ngọc Huệ', 'F'],
  ['Ngọc Hà', 'F'],
  ['Ngọc Hân', 'F'],
  ['Ngọc Hạ', 'F'],
  ['Ngọc Hằng', 'F'],
  ['Ngọc Khoa', 'M'],
  ['Ngọc Khánh', 'F'],
  ['Ngọc Lan', 'F'],
  ['Ngọc Linh', 'F'],
  ['Ngọc Linh', 'F'],
  ['Ngọc Liên', 'F'],
  ['Ngọc Loan', 'F'],
  ['Ngọc Ly', 'F'],
  ['Ngọc Lệ', 'F'],
  ['Ngọc Mai', 'F'],
  ['Ngọc Minh', 'F'],
  ['Ngọc Ngân', 'F'],
  ['Ngọc Nhi', 'F'],
  ['Ngọc Nữ', 'F'],
  ['Ngọc Phương', 'F'],
  ['Ngọc Quyên', 'F'],
  ['Ngọc Sơn', 'M'],
  ['Ngọc Thi', 'F'],
  ['Ngọc Thơ', 'F'],
  ['Ngọc Trinh', 'F'],
  ['Ngọc Trâm', 'F'],
  ['Ngọc Tâm', 'F'],
  ['Ngọc Tú', 'F'],
  ['Ngọc Uyên', 'F'],
  ['Ngọc Yến', 'F'],
  ['Ngọc Ái', 'F'],
  ['Ngọc Điệp', 'F'],
  ['Ngọc Đào', 'F'],
  ['Nhã Hương', 'F'],
  ['Nhã Khanh', 'F'],
  ['Nhã Mai', 'F'],
  ['Nhã Thanh', 'F'],
  ['Nhã Trúc', 'F'],
  ['Nhã Uyên', 'F'],
  ['Quốc Hoàng', 'M'],
  ['Quốc Huy', 'M'],
  ['Quốc Hòa', 'M'],
  ['Quốc Hùng', 'M'],
  ['Quốc Hưng', 'M'],
  ['Quốc Hải', 'M'],
  ['Quốc Khánh', 'M'],
  ['Quốc Phong', 'M'],
  ['Quốc Thắng', 'M'],
  ['Quốc Thịnh', 'M'],
  ['Quốc Tiến', 'M'],
  ['Quốc Toản', 'M'],
  ['Quốc Trung', 'M'],
  ['Quốc Trường', 'M'],
  ['Quỳnh Anh', 'F'],
  ['Quỳnh Anh', 'F'],
  ['Quỳnh Chi', 'F'],
  ['Quỳnh Dao', 'F'],
  ['Quỳnh Dung', 'F'],
  ['Quỳnh Giang', 'F'],
  ['Quỳnh Giao', 'F'],
  ['Quỳnh Hoa', 'F'],
  ['Quỳnh Hương', 'F'],
  ['Quỳnh Lam', 'F'],
  ['Quỳnh Liên', 'F'],
  ['Quỳnh Nhi', 'F'],
  ['Quỳnh Nhung', 'F'],
  ['Quỳnh Phương', 'F'],
  ['Quỳnh Thơ', 'F'],
  ['Quỳnh Tiên', 'F'],
  ['Quỳnh Trang', 'F'],
  ['Quỳnh Trâm', 'F'],
  ['Sơn Ca', 'F'],
  ['Thanh Hằng', 'F'],
  ['Thanh Lan', 'F'],
  ['Thanh Nhàn', 'F'],
  ['Thanh Nhã', 'F'],
  ['Thanh Thảo', 'F'],
  ['Thanh Thủy', 'F'],
  ['Thanh Trang', 'F'],
  ['Thanh Trang', 'F'],
  ['Thanh Tú', 'F'],
  ['Thu Trang', 'F'],
  ['Thuỳ Dương', 'F'],
  ['Thuỳ Trang', 'F'],
  ['Thảo Mai', 'F'],
  ['Thảo Nguyên', 'F'],
  ['Thảo Trang', 'M'],
  ['Trang Nhã', 'F'],
  ['Việt Hưng', 'M'],
  ['Xuân Mai', 'F'],
  ['Ánh Ngân', 'F'],
  ['Ánh Tuyết', 'F'],
  ['Đan Thanh', 'F'],
  ['Đan Thư', 'F'],
  ['Đoan Trang', 'F'],
  ['Đông Hương', 'F'],
  ['Đông Hậu', 'F'],
  ['Đông Nghi', 'F'],
  ['Đăng Khoa', 'M'],
  ['Đăng Minh', 'M'],
  ['Đăng Quang', 'M'],
  ['Đức Thành', 'M'],
  ['Đức Nam', 'M'],
  ['Đức Thắng', 'M'],
  ['Đức Toàn', 'M'],
  ['Đức Trung', 'M'],
  ['Đức Trí', 'M'],
  ['Đức Tuấn', 'M'],
  ['Đức Việt', 'M'],
];

export function shuffleArray<T>(arr: T[]) {
  return arr.sort(() => Math.random() - 0.5);
}

export function randomElement<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function firstName() {
  const [firstName] = randomElement(firstNames);
  return firstName;
}

export function lastName() {
  return randomElement(lastNames);
}

export function nameAndGender() {
  const [firstName, gender] = randomElement(firstNames);
  return {
    lastName,
    firstName,
    name: `${lastName()} ${firstName}`,
    gender,
  };
}

export function fakeEmail(name: string) {
  const domains = ['gmail.com', 'yahoo.com', 'company.com', 'business.com', 'corp.com'];
  return (
    normalizeVietnameseChars(name).toLowerCase().replaceAll(/\s+/g, '.') +
    '@' +
    randomElement(domains)
  );
}

export type FakeDepartmentCode = 'sales' | 'delivery' | 'warehouse' | 'accounting' | 'manager';
export function fakePermission(code: FakeDepartmentCode): GetMeResponse['permissions'] {
  const basePermission = {
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  };

  function generateDefaultPermission(): GetMeResponse['permissions'] {
    return {
      customer: {
        ...basePermission,
      },
      product: {
        ...basePermission,
      },
      employee: {
        ...basePermission,
        actions: {
          canSetPassword: false,
        },
      },
      purchaseOrder: {
        ...basePermission,
        actions: {
          canConfirm: false,
          canProcess: false,
          canShip: false,
          canMarkReady: false,
          canDeliver: false,
          canCancel: false,
        },
      },
      deliveryRequest: {
        ...basePermission,
        query: {
          canFilter: false,
          canViewAll: false,
        },
        actions: {
          canUpdateDeliveryOrderInDay: false,
          canStartTransit: false,
          canComplete: false,
          canTakePhoto: false,
        },
      },
    };
  }

  interface Permission {
    [key: string]: boolean | Permission;
  }

  function toTrue(permission: Permission): Permission {
    Object.keys(permission).forEach((key) => {
      if (typeof permission[key] === 'object') {
        permission[key] = toTrue(permission[key]);
      } else {
        permission[key] = true;
      }
    });
    return permission;
  }

  const permissions = generateDefaultPermission();
  const fullPermissions = toTrue(generateDefaultPermission()) as typeof permissions;

  switch (code) {
    case 'manager': {
      return fullPermissions;
    }
    case 'sales': {
      permissions.purchaseOrder = {
        ...permissions.purchaseOrder,
        canView: true,
        canCreate: true,
        canEdit: true,
        actions: {
          ...permissions.purchaseOrder.actions,
          canConfirm: true,
          canDeliver: true,
          canCancel: true,
        },
      };
      permissions.deliveryRequest = {
        ...permissions.deliveryRequest,
        query: {
          canFilter: true,
          canViewAll: true,
        },
        canView: true,
      };
      return permissions;
    }
    case 'delivery': {
      permissions.deliveryRequest = {
        ...permissions.deliveryRequest,
        canView: true,
        actions: {
          canStartTransit: true,
          canComplete: true,
          canTakePhoto: true,
        },
      };
      return permissions;
    }
    case 'warehouse': {
      permissions.purchaseOrder = {
        ...permissions.purchaseOrder,
        canView: true,
        actions: {
          canProcess: true,
          canMarkReady: true,
          canDeliver: true,
          canShip: true,
        },
      };
      permissions.deliveryRequest = {
        ...permissions.deliveryRequest,
        canView: true,
        canCreate: true,
      };
      return permissions;
    }
    case 'accounting': {
      permissions.employee.canView = true;
      permissions.purchaseOrder = {
        ...permissions.purchaseOrder,
        canView: true,
        canEdit: true,
        actions: {
          canShip: true,
          canRefund: true,
        },
      };
      permissions.deliveryRequest = {
        ...permissions.deliveryRequest,
        query: {
          canFilter: true,
          canViewAll: true,
        },
        canView: true,
        canCreate: true,
      };
      return permissions;
    }
    default: {
      return permissions;
    }
  }
}
