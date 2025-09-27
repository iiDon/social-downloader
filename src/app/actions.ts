'use server';

import { detectPlatform, extractMediaInfo } from '@/lib/utils';
import { Platform, MediaInfo } from '@/types';
import { getRealIP, checkRateLimit, getRateLimitKey } from '@/lib/rate-limiter';

export async function downloadMedia(url: string) {
  try {
    // Get real IP and check rate limit
    const clientIP = await getRealIP();
    const rateLimitKey = getRateLimitKey(clientIP);
    const rateLimitResult = checkRateLimit(rateLimitKey, {
      maxRequests: 5,  // 5 requests
      windowMs: 60 * 1000  // per minute
    });

    if (!rateLimitResult.success) {
      return {
        success: false,
        error: `تم تجاوز حد الطلبات. حاول مرة أخرى بعد ${rateLimitResult.retryAfter} ثانية.`,
        rateLimited: true,
        retryAfter: rateLimitResult.retryAfter
      };
    }

    const platform = detectPlatform(url);

    if (!platform) {
      return {
        success: false,
        error: 'منصة غير مدعومة. يرجى استخدام رابط من تيك توك، تويتر، يوتيوب، أو انستغرام.'
      };
    }

    const mediaInfo = await extractMediaInfo(url, platform);

    if (!mediaInfo) {
      return {
        success: false,
        error: 'لا يمكن استخراج الوسائط من هذا الرابط. يرجى التحقق من الرابط والمحاولة مرة أخرى.'
      };
    }

    return {
      success: true,
      downloadUrl: mediaInfo.downloadUrl,
      fileName: mediaInfo.fileName,
      platform: platform,
      thumbnail: mediaInfo.thumbnail,
      remaining: rateLimitResult.remaining
    };

  } catch (error) {
    console.error('Error processing media:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
    };
  }
}