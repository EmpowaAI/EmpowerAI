// src/lib/profileImageStorage.ts

const PROFILE_IMAGE_KEY = 'empowaai_profile_image';
const PROFILE_IMAGE_USER_ID_KEY = 'empowaai_profile_image_user';

// Store profile image with user ID
export const saveProfileImage = (userId: string, imageBase64: string): void => {
  try {
    // Get existing images
    const images = getProfileImages();
    
    // Update or add new image
    images[userId] = {
      image: imageBase64,
      updatedAt: new Date().toISOString(),
    };
    
    // Save back to localStorage
    localStorage.setItem(PROFILE_IMAGE_KEY, JSON.stringify(images));
    
    // Also store current user's image separately for quick access
    localStorage.setItem(`${PROFILE_IMAGE_KEY}_${userId}`, imageBase64);
    
    console.log('✅ Profile image saved for user:', userId);
  } catch (error) {
    console.error('Failed to save profile image:', error);
  }
};

// Get all profile images
export const getProfileImages = (): Record<string, { image: string; updatedAt: string }> => {
  try {
    const stored = localStorage.getItem(PROFILE_IMAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Get profile image for specific user
export const getProfileImageForUser = (userId: string): string | null => {
  try {
    // First try the quick access key
    const quickAccess = localStorage.getItem(`${PROFILE_IMAGE_KEY}_${userId}`);
    if (quickAccess) return quickAccess;
    
    // Fallback to the main object
    const images = getProfileImages();
    return images[userId]?.image || null;
  } catch {
    return null;
  }
};

// Remove profile image for a user
export const removeProfileImageForUser = (userId: string): void => {
  try {
    const images = getProfileImages();
    delete images[userId];
    localStorage.setItem(PROFILE_IMAGE_KEY, JSON.stringify(images));
    localStorage.removeItem(`${PROFILE_IMAGE_KEY}_${userId}`);
    console.log('✅ Profile image removed for user:', userId);
  } catch (error) {
    console.error('Failed to remove profile image:', error);
  }
};

// Get current user's profile image (for quick access in components)
export const getCurrentUserProfileImage = (): string | null => {
  const userId = getCurrentUserId();
  if (!userId) return null;
  return getProfileImageForUser(userId);
};

// Helper to get current user ID from various sources
const getCurrentUserId = (): string | null => {
  try {
    // Try to get from user localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.id) return user.id;
      if (user.email) return user.email; // Use email as fallback ID
    }
    
    // Try token
    const token = localStorage.getItem('empowerai-token');
    if (token) {
      // You could decode the token to get user ID, but for simplicity
      // we'll use token as identifier (not ideal but works)
      return `token_${token.substring(0, 20)}`;
    }
    
    // Last resort: use a persistent device ID
    let deviceId = localStorage.getItem('empowaai_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('empowaai_device_id', deviceId);
    }
    return deviceId;
  } catch {
    return 'anonymous_user';
  }
};

// Clear all profile images (for testing)
export const clearAllProfileImages = (): void => {
  localStorage.removeItem(PROFILE_IMAGE_KEY);
  // Remove all user-specific keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${PROFILE_IMAGE_KEY}_`)) {
      localStorage.removeItem(key);
    }
  }
};