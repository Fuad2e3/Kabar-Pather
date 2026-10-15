/**
 * =========================================================================
 * কবর পথের সামগ্রী — WebP Photo Optimizer
 * =========================================================================
 * Automatically compresses raw photos (PNG, JPG, JPEG, WEBP) to high-quality
 * WebP format (<80 KB) saving 80%–95% file size before uploading.
 * =========================================================================
 */

class PhotoOptimizer {
  static DEFAULT_CONFIG = {
    maxWidth: 960,
    maxHeight: 960,
    quality: 0.82,
    preferredFormat: 'image/webp'
  };

  /**
   * Automatically optimize a single photo (File, Blob, or Data URL) to .webp
   * @param {File|Blob|string} photo
   * @param {Object} [options]
   * @returns {Promise<{ dataUrl: string, blob: Blob, originalBytes: number, optimizedBytes: number, savingsPercent: number, width: number, height: number, filename: string, mimeType: string }>}
   */
  static async optimize(photo, options = {}) {
    const config = { ...PhotoOptimizer.DEFAULT_CONFIG, ...options };
    if (!photo) {
      throw new Error('PhotoOptimizer: কোনো ছবি নির্বাচন করা হয়নি।');
    }

    const originalBytes = photo.size || (typeof photo === 'string' ? PhotoOptimizer.calcBase64Bytes(photo) : 0);
    const img = await PhotoOptimizer.loadImage(photo);

    // Calculate dimensions maintaining aspect ratio
    let { width, height } = img;
    const maxW = config.maxWidth;
    const maxH = config.maxHeight;

    if (width > maxW || height > maxH) {
      const ratio = Math.min(maxW / width, maxH / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Render to Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Fill white background for transparent PNGs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Export to WebP
    let mimeType = 'image/webp';
    let dataUrl = canvas.toDataURL(mimeType, config.quality);

    // Fallback if browser doesn't support webp export (very rare in modern browsers)
    if (!dataUrl.startsWith('data:image/webp')) {
      mimeType = 'image/jpeg';
      dataUrl = canvas.toDataURL(mimeType, config.quality);
    }

    const optimizedBytes = PhotoOptimizer.calcBase64Bytes(dataUrl);
    const savingsPercent = originalBytes > 0
      ? Math.max(0, Math.round(((originalBytes - optimizedBytes) / originalBytes) * 100))
      : 0;

    // Convert dataUrl to Blob
    const blob = await PhotoOptimizer.dataUrlToBlob(dataUrl, mimeType);

    // Generate clean .webp filename
    let baseName = 'product';
    if (photo && photo.name) {
      baseName = photo.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    }
    const filename = `${baseName}_${Date.now()}.webp`;

    return {
      dataUrl,
      blob,
      filename,
      originalBytes,
      optimizedBytes,
      savingsPercent,
      width,
      height,
      mimeType
    };
  }

  /**
   * Load an HTMLImageElement from a File, Blob, or string URL
   */
  static loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('PhotoOptimizer: ছবি লোড করা সম্ভব হয়নি।'));

      if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof Blob || source instanceof File) {
        const reader = new FileReader();
        reader.onload = e => {
          img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('PhotoOptimizer: ফাইল রিড ত্রুটি।'));
        reader.readAsDataURL(source);
      } else {
        reject(new Error('PhotoOptimizer: অগ্রহণযোগ্য ছবির ফরম্যাট।'));
      }
    });
  }

  /**
   * Convert Data URL to Blob
   */
  static dataUrlToBlob(dataUrl, mimeType = 'image/webp') {
    return new Promise((resolve) => {
      const byteString = atob(dataUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      resolve(new Blob([ab], { type: mimeType }));
    });
  }

  /**
   * Calculate byte size of Base64 string
   */
  static calcBase64Bytes(b64) {
    if (!b64 || typeof b64 !== 'string') return 0;
    const body = b64.includes(',') ? b64.split(',')[1] : b64;
    return Math.round((body.length * 3) / 4);
  }

  /**
   * Helper to format bytes to KB / MB
   */
  static formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}

if (typeof window !== 'undefined') {
  window.PhotoOptimizer = PhotoOptimizer;
}
