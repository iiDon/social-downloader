'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Loader2, Clipboard, AlertCircle, Timer } from 'lucide-react';
import { downloadMedia } from '@/app/actions';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [result, setResult] = useState<{
    success: boolean;
    downloadUrl?: string;
    fileName?: string;
    platform?: string;
    error?: string;
    thumbnail?: string;
    rateLimited?: boolean;
    retryAfter?: number;
    remaining?: number;
  } | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleDownload = async () => {
    if (!url) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await downloadMedia(url);
      setResult(response);

      // Set countdown if rate limited
      if (response.rateLimited && response.retryAfter) {
        setCountdown(response.retryAfter);
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'فشل في معالجة الرابط'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleDirectDownload = () => {
    if (result?.downloadUrl) {
      window.open(result.downloadUrl, '_blank');
    }
  };

  return (
    <div className="h-screen bg-black font-cairo overflow-hidden flex items-center justify-center">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />

      {/* Animated Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

      <div className="relative w-full max-w-2xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              محمل الوسائط
            </span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg">
            تيك توك • يوتيوب • تويتر • انستغرام
          </p>
          {result?.remaining !== undefined && (
            <p className="text-xs text-gray-500 mt-2">
              الطلبات المتبقية: {result.remaining}/5
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 sm:p-6 shadow-2xl">
          {/* Input Section */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              type="url"
              placeholder="الصق الرابط هنا..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-gray-800/50 border-gray-700 text-gray-100 placeholder:text-gray-500 h-12 text-sm sm:text-base font-medium"
              style={{ direction: 'ltr', textAlign: 'left' }}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDownload();
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={handlePaste}
                variant="outline"
                className="h-12 px-4 flex-1 sm:flex-none bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-gray-300 hover:text-white flex items-center justify-center gap-2"
                disabled={loading}
              >
                <Clipboard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="sm:hidden">لصق</span>
              </Button>
              <Button
                onClick={handleDownload}
                disabled={loading || !url}
                className="h-12 px-4 sm:px-6 flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin flex-shrink-0" />
                    <span className="sm:hidden">جاري...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="sm:hidden">تحميل</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Result Section */}
          {result && (
            <div className={`p-4 rounded-xl backdrop-blur ${
              result.success
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              {result.success ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {result.thumbnail && (
                    <img
                      src={result.thumbnail}
                      alt="thumbnail"
                      className="w-20 h-20 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 text-center sm:text-right">
                    <p className="text-gray-300 text-xs sm:text-sm truncate" dir="ltr">{result.fileName}</p>
                  </div>
                  <Button
                    onClick={handleDirectDownload}
                    className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5 flex-shrink-0" />
                    <span>تحميل الملف</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  {countdown > 0 ? (
                    <Timer className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{result.error}</p>
                    {countdown > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        يمكنك المحاولة مرة أخرى بعد {countdown} ثانية
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}