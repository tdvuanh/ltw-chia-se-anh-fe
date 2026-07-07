/**
 * Định nghĩa toàn bộ kiểu dữ liệu (Types & Interfaces) cho cổng kết nối API.
 * Thiết kế tương thích 100% với đặc tả API.md và đảm bảo tương thích ngược với UI mock.
 */

// ----------------------------------------------------
// 1. Models (Đối tượng thực thể)
// ----------------------------------------------------

export interface User {
  id: string | number;
  username: string;
  email: string;
  full_name?: string;      // API.md
  displayName?: string;    // UI mock compatibility
  avatar_url?: string;     // API.md
  avatarUrl?: string;      // UI mock compatibility
  bio?: string;
  website?: string;
  location?: string;
  joinedAt?: string;       // UI mock compatibility
  created_at?: string;     // API.md
  photosCount?: number;    // UI mock compatibility
  photos_count?: number;   // API.md
  followersCount?: number; // UI mock compatibility
  followers_count?: number;// API.md
  followingCount?: number; // UI mock compatibility
  following_count?: number;// API.md
  totalLikes?: number;     // UI mock compatibility
  likes_count?: number;    // API.md
  status?: 'active' | 'locked' | 'banned'; // API.md sử dụng 'banned' thay vì 'locked'
  role?: 'user' | 'admin'; // API.md
  isFollowing?: boolean;   // follow status
}

export interface CameraEXIF {
  cameraModel?: string;
  lensModel?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
}

export interface Photo {
  id: string | number;
  image_url: string;        // API.md
  imageUrl?: string;        // UI mock compatibility
  title: string;
  description?: string;
  username?: string;        // UI mock compatibility
  userAvatar?: string;      // UI mock compatibility
  userId?: string | number; // Flat user ID property
  user?: {                  // API.md nested user
    id: string | number;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  likes?: number;           // UI mock compatibility
  likes_count: number;      // API.md
  comments?: number;        // UI mock compatibility
  comments_count: number;    // API.md
  views?: number;           // UI mock compatibility
  views_count?: number;     // API.md
  tags?: any[];             // Hỗ trợ cả mảng chuỗi ["nature"] và đối tượng [{"id":1,"name":"nature"}]
  isLiked?: boolean;        // UI mock compatibility
  is_liked?: boolean;       // API.md
  uploadedAt?: string;      // UI mock compatibility
  created_at: string;       // API.md
  status?: 'pending' | 'approved' | 'rejected'; // API.md
  cameraInfo?: CameraEXIF;
}

export interface Comment {
  id: string | number;
  content: string;          // API.md
  comment?: string;         // UI mock compatibility
  photo_id?: string | number;// API.md
  username?: string;        // UI mock compatibility
  avatar?: string;          // UI mock compatibility
  user?: {                  // API.md nested user
    id: string | number;
    username: string;
    avatar_url?: string;
    full_name?: string;
  };
  timestamp?: string;       // UI mock compatibility
  created_at?: string;      // API.md
}

export interface Report {
  id: string | number;
  type: 'ảnh' | 'bình luận' | string;   // Nhãn hiển thị tiếng Việt
  targetType: 'photo' | 'comment';       // Loại đối tượng gốc từ API
  status: 'pending' | 'resolved' | 'dismissed' | string;
  content: string;                       // Nội dung/tiêu đề bị báo cáo
  contentOwner?: string;                 // Chủ sở hữu nội dung
  imageUrl?: string;                     // Ảnh xem trước (nếu báo cáo ảnh)
  photoId?: string | number | null;
  commentId?: string | number | null;
  reportedBy: string;
  reason: string;
  description?: string;
  timestamp: string;
}

export interface ReportPayload {
  target_type: 'photo' | 'comment';
  target_id: string | number;
  reason: string;
  description?: string;
}

export interface AppNotification {
  id: string | number;
  type: 'like' | 'comment' | 'follow' | string;
  isRead: boolean;
  createdAt: string;
  actorName: string;
  actorAvatar?: string;
  actorId?: string | number;
  photoId?: string | number | null;
  photoTitle?: string | null;
  message: string;
}

export interface ActivityItem {
  type: 'photo' | 'comment' | 'follow' | string;
  user: string;
  action: string;
  target: string;
  created_at: string;
}

export interface TopTag {
  name: string;
  count: number;
}

// ----------------------------------------------------
// 2. DTOs (Data Transfer Objects - Dữ liệu truyền nhận)
// ----------------------------------------------------

export interface LoginCredentials {
  email: string;            // API.md sử dụng email để đăng nhập
  password?: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password?: string;
  confirmPassword?: string; // API.md
  full_name?: string;       // API.md
}

export interface UploadPhotoDto {
  title: string;
  description?: string;
  image_url: string;        // API.md sử dụng image_url thay vì imageUrl
  tags?: string[];
  cameraModel?: string;
  lensModel?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
}

export interface UploadPhotoPayload {
  title: string;
  description?: string;
  image: File;
  tags?: string[];
}

export interface UpdateProfileDto {
  full_name?: string;       // API.md sử dụng full_name
  bio?: string;
  website?: string;
  avatar_url?: string;      // API.md sử dụng avatar_url
  location?: string;
}

export interface UpdatePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DashboardStats {
  total_photos: number;      // API.md
  total_users: number;       // API.md
  banned_users: number;      // API.md
  active_users: number;      // API.md
  total_likes?: number;      // Tổng lượt thích toàn hệ thống
  total_comments?: number;   // Tổng bình luận
  pending_reports?: number;  // Số báo cáo đang chờ xử lý
  photos_by_status: {        // API.md
    pending: number;
    approved: number;
    rejected: number;
  };
  top_tags?: TopTag[];       // Thẻ phổ biến (dữ liệu thật)
}

export interface Pagination {
  page: number;
  limit: number;
  total?: number;
}

// ----------------------------------------------------
// 3. API Response Wrapper (Cấu trúc phản hồi chuẩn)
// ----------------------------------------------------

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
  timestamp?: string;
}

export interface ApiError {
  success?: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
