import { endpoints } from '@/configs/endpoints';
import { NextRequest, NextResponse } from 'next/server';

export interface UserData {
  id: number;
  username: string;
  email: string;
  permissions: string[];
  nameSalary: string;
}

interface AuthResponse {
  data: UserData;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

// Các trang cần xác thực
const PROTECTED_ROUTES = [
  '/dashboard',
  '/users',
  '/menus',
  '/dishes',
  '/tables',
  '/reservations',
  '/schedules',
  '/roles',
  '/salary',
  '/categories',
  '/attachments',
  '/table',
  '/order'
];

// Map các route với permission cần thiết
const PERMISSION_MAP: Record<string, string[]> = {
  '/users': ['users:list'],
  '/users/create': ['users:create'],
  '/users/edit': ['users:update'],
  '/menus': ['menus:list'],
  '/dishes': ['dishes:list'],
  '/tables': ['tables:list'],
  '/reservations': ['reservations:list'],
  '/schedules': ['schedules:list'],
  '/roles': ['roles:list'],
  '/salary': ['salary_rate:list'],
  '/categories': ['categories:list'],
  '/attachments': ['attachments:list'],
  '/table': ['table:list'],
  '/order': ['order:list']
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các route public
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Kiểm tra xem có token không
  const token = request.cookies.get('auth_token')?.value;
  console.log('[Middleware] Checking auth token for path:', pathname, 'Token exists:', !!token);

  // Xử lý trường hợp đặc biệt cho trang login
  if (pathname === '/login') {
    // Nếu đã có token, kiểm tra xem token có hợp lệ không
    if (token) {
      try {
        console.log('[Middleware] Validating token for login page redirect');
        const userDataResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}${endpoints.authMe}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // Nếu token hợp lệ, chuyển hướng về trang dashboard
        if (userDataResponse.ok) {
          console.log('[Middleware] Token valid, redirecting to dashboard');
          return NextResponse.redirect(new URL('/', request.url));
        } else {
          console.log('[Middleware] Token invalid, allowing access to login page');
        }
      } catch (error) {
        console.error('[Middleware] Error checking auth for login page:', error);
        // Nếu có lỗi khi kiểm tra token, xóa token và cho phép truy cập trang login
        const response = NextResponse.next();
        response.cookies.delete('auth_token');
        return response;
      }
    }
    // Nếu không có token hoặc token không hợp lệ, cho phép truy cập trang login
    const response = NextResponse.next();
    // Thêm header để không cache trên trang login
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }

  // Xử lý các route khác (route được bảo vệ)
  if (!token) {
    // Redirect về trang login nếu không có token
    console.log('[Middleware] No token found, redirecting to login page');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Thực hiện request để lấy thông tin người dùng
    console.log('[Middleware] Fetching user data with token');
    const userDataResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store',
        },
      },
    );

    if (!userDataResponse.ok) {
      // Token không hợp lệ hoặc đã hết hạn
      console.log('[Middleware] Token invalid or expired, redirecting to login page', userDataResponse.status);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    const userData: AuthResponse = await userDataResponse.json();
    console.log('[Middleware] User data fetched successfully');

    // Kiểm tra quyền hạn
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
      pathname.startsWith(route),
    );

    if (isProtectedRoute) {
      // Lấy các quyền cần thiết cho route hiện tại
      const requiredPermissions = PERMISSION_MAP[pathname] || [];

      // Kiểm tra xem người dùng có đủ quyền không
      const hasPermission =
        requiredPermissions.length === 0 ||
        requiredPermissions.some(perm =>
          userData.data.permissions.includes(perm),
        );

      if (!hasPermission) {
        // Redirect về trang dashboard nếu không có quyền
        console.log('[Middleware] User does not have required permissions, redirecting to dashboard');
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Mã hoá dữ liệu người dùng thành base64 trước khi thêm vào headers
    const base64UserData = Buffer.from(JSON.stringify(userData.data)).toString(
      'base64',
    );

    // Thêm thông tin người dùng vào headers để có thể sử dụng trong các server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-data', base64UserData);

    // Thêm headers Cache-Control để đảm bảo không cache trang sau khi xác thực
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    // Thêm header Cache-Control vào response để ngăn cache
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('[Middleware] Authentication middleware error:', error);
    // Redirect về trang login nếu có lỗi
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

// Áp dụng middleware cho tất cả các routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};