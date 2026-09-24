/**
 * CLIENT-SIDE IMAGE COMPRESSOR (HTML5 Canvas)
 * Tự động nén ảnh gốc iPhone (5MB - 15MB) xuống còn ~150KB trong 0.1s
 * Giữ nguyên độ sắc nét chuẩn tỷ lệ màn hình điện thoại
 */

export async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('File không phải là định dạng hình ảnh hợp lệ'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh'));

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Không thể tải hình ảnh'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Tính toán kích thước scale giữ nguyên tỷ lệ khung hình
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Không thể khởi tạo Canvas 2D context'));
        }

        // Tối ưu render hình ảnh chất lượng cao
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Xuất định dạng WebP nếu hỗ trợ, fallback sang JPEG
        let dataUrl;
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch (e) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Tính dung lượng sau nén
        const approximateSizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          width,
          height,
          sizeKB: approximateSizeKB
        });
      };

      img.src = readerEvent.target.result;
    };

    reader.readAsDataURL(file);
  });
}
