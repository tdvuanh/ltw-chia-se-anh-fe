import { AppNotification, Comment, Photo, Report, User } from './types';

const NOTIF_MESSAGE: Record<string, string> = {
  like: 'đã thích ảnh của bạn',
  comment: 'đã bình luận ảnh của bạn',
  follow: 'đã theo dõi bạn',
};

/**
 * Chuẩn hoá một thông báo từ API về định dạng dùng cho UI.
 */
export const transformNotification = (apiNotif: any): AppNotification => {
  if (!apiNotif) return {} as AppNotification;
  const actor = apiNotif.actor || {};
  const base = NOTIF_MESSAGE[apiNotif.type] || 'có hoạt động mới';
  const withTitle =
    apiNotif.photo_title && apiNotif.type !== 'follow'
      ? `${base}: "${apiNotif.photo_title}"`
      : base;

  return {
    id: apiNotif.id,
    type: apiNotif.type,
    isRead: !!apiNotif.is_read,
    createdAt: apiNotif.created_at || '',
    actorName: actor.full_name || actor.username || 'Ai đó',
    actorAvatar: actor.avatar_url || '',
    actorId: actor.id,
    photoId: apiNotif.photo_id ?? null,
    photoTitle: apiNotif.photo_title ?? null,
    message: withTitle,
  };
};

/**
 * Bộ chuyển đổi dữ liệu trung gian (Adapter/Transformers)
 * Tự động chuyển đổi định dạng thô từ API (thường là snake_case hoặc lồng nhau)
 * sang định dạng chuẩn hóa phẳng (flat camelCase) dễ đọc và tương thích ngược với UI.
 */

export const transformUser = (apiUser: any): User => {
  if (!apiUser) return {} as User;
  
  return {
    id: apiUser.id,
    username: apiUser.username,
    email: apiUser.email || '',
    full_name: apiUser.full_name,
    displayName: apiUser.full_name || apiUser.displayName || apiUser.username || 'user',
    avatar_url: apiUser.avatar_url,
    avatarUrl: apiUser.avatar_url || apiUser.avatarUrl || '',
    bio: apiUser.bio,
    website: apiUser.website,
    location: apiUser.location,
    created_at: apiUser.created_at || apiUser.joinedAt,
    joinedAt: apiUser.joinedAt || apiUser.created_at || '',
    photos_count: apiUser.photos_count !== undefined ? apiUser.photos_count : apiUser.photosCount,
    photosCount: apiUser.photosCount !== undefined ? apiUser.photosCount : (apiUser.photos_count || 0),
    followers_count: apiUser.followers_count !== undefined ? apiUser.followers_count : apiUser.followersCount,
    followersCount: apiUser.followersCount !== undefined ? apiUser.followersCount : (apiUser.followers_count || 0),
    following_count: apiUser.following_count !== undefined ? apiUser.following_count : apiUser.followingCount,
    followingCount: apiUser.followingCount !== undefined ? apiUser.followingCount : (apiUser.following_count || 0),
    likes_count: apiUser.likes_count !== undefined ? apiUser.likes_count : apiUser.totalLikes,
    totalLikes: apiUser.totalLikes !== undefined ? apiUser.totalLikes : (apiUser.likes_count || 0),
    status: apiUser.status || 'active',
    role: apiUser.role || 'user',
    isFollowing: apiUser.is_following !== undefined ? apiUser.is_following : (apiUser.isFollowing || false),
  };
};

export const transformPhoto = (apiPhoto: any): Photo => {
  if (!apiPhoto) return {} as Photo;

  // Lấy ra username và avatar từ đối tượng lồng nhau 'user'
  const nestedUser = apiPhoto.user || {};
  const username = nestedUser.username || apiPhoto.username || 'user';
  const userAvatar = nestedUser.avatar_url || apiPhoto.userAvatar || apiPhoto.avatar_url || '';

  // Chuyển đổi định dạng tags: biến danh sách [{id, name}] thành mảng chuỗi string ['nature']
  let tags: string[] = [];
  if (Array.isArray(apiPhoto.tags)) {
    tags = apiPhoto.tags.map((t: any) => (typeof t === 'string' ? t : t.name || ''));
  }

  return {
    id: apiPhoto.id,
    image_url: apiPhoto.image_url || apiPhoto.imageUrl || '',
    imageUrl: apiPhoto.image_url || apiPhoto.imageUrl || '',
    title: apiPhoto.title || 'Untitled',
    description: apiPhoto.description || '',
    username,
    userAvatar,
    userId: nestedUser.id || apiPhoto.user_id || '',
    user: {
      id: nestedUser.id || apiPhoto.user_id || '',
      username,
      full_name: nestedUser.full_name || apiPhoto.full_name || username,
      avatar_url: userAvatar,
    },
    likes_count: apiPhoto.likes_count !== undefined ? apiPhoto.likes_count : (apiPhoto.likes || 0),
    likes: apiPhoto.likes_count !== undefined ? apiPhoto.likes_count : (apiPhoto.likes || 0),
    comments_count: apiPhoto.comments_count !== undefined ? apiPhoto.comments_count : (apiPhoto.comments || 0),
    comments: apiPhoto.comments_count !== undefined ? apiPhoto.comments_count : (apiPhoto.comments || 0),
    views: apiPhoto.views || 0,
    tags,
    is_liked: apiPhoto.is_liked !== undefined ? apiPhoto.is_liked : (apiPhoto.isLiked || false),
    isLiked: apiPhoto.is_liked !== undefined ? apiPhoto.is_liked : (apiPhoto.isLiked || false),
    created_at: apiPhoto.created_at || apiPhoto.uploadedAt || '',
    uploadedAt: apiPhoto.uploadedAt || apiPhoto.created_at || '',
    status: apiPhoto.status || 'approved',
    cameraInfo: apiPhoto.cameraInfo || {},
  };
};

export const transformComment = (apiComment: any): Comment => {
  if (!apiComment) return {} as Comment;

  const nestedUser = apiComment.user || apiComment.users || {};
  const username = nestedUser.username || apiComment.username || 'user';
  const avatar = nestedUser.avatar_url || apiComment.avatar || apiComment.avatar_url || '';

  return {
    id: apiComment.id,
    content: apiComment.content || apiComment.comment || '',
    comment: apiComment.content || apiComment.comment || '',
    photo_id: apiComment.photo_id,
    username,
    avatar,
    user: {
      id: nestedUser.id || apiComment.user_id || '',
      username,
      avatar_url: avatar,
      full_name: nestedUser.full_name || apiComment.full_name || '',
    },
    created_at: apiComment.created_at || apiComment.timestamp || '',
    timestamp: apiComment.timestamp || apiComment.created_at || '',
  };
};

/**
 * Chuẩn hoá một phiếu báo cáo vi phạm từ API về định dạng dùng cho UI Admin.
 */
export const transformReport = (apiReport: any): Report => {
  if (!apiReport) return {} as Report;

  const targetType = apiReport.target_type === 'comment' ? 'comment' : 'photo';
  const createdAt = apiReport.created_at || apiReport.timestamp || '';

  let timestamp = createdAt;
  try {
    if (createdAt) timestamp = new Date(createdAt).toLocaleString('vi-VN');
  } catch {
    timestamp = createdAt;
  }

  return {
    id: apiReport.id,
    type: targetType === 'comment' ? 'bình luận' : 'ảnh',
    targetType,
    status: apiReport.status || 'pending',
    content: apiReport.content || '',
    contentOwner: apiReport.content_owner || '',
    imageUrl: apiReport.image_url || '',
    photoId: apiReport.photo_id ?? null,
    commentId: apiReport.comment_id ?? null,
    reportedBy: apiReport.reported_by || apiReport.reporter?.username || 'unknown',
    reason: apiReport.reason || '',
    description: apiReport.description || '',
    timestamp,
  };
};
