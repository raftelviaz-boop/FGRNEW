/**
 * Utility untuk mengompresi dan memotong foto profil menjadi rasio 1:1 (persegi)
 * berukuran optimal (~160x160 piksel) agar ringan dimuat, disimpan di localStorage,
 * dan ditransmisikan secara instan ke server maupun WebSocket.
 */
export async function compressAndCropProfilePhoto(file: File, maxDimension: number = 160): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar (JPG, PNG, WebP, dll)');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }

          // Hitung center square crop (1:1)
          const minSide = Math.min(img.width, img.height);
          const startX = (img.width - minSide) / 2;
          const startY = (img.height - minSide) / 2;

          canvas.width = maxDimension;
          canvas.height = maxDimension;

          // Aktifkan image smoothing berkualitas tinggi
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Gambar crop persegi
          ctx.drawImage(
            img,
            startX,
            startY,
            minSide,
            minSide,
            0,
            0,
            maxDimension,
            maxDimension
          );

          // Ekspor ke format JPEG dengan kualitas 0.88 untuk ukuran file super efisien (~15-25KB)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(compressedDataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('Gagal memproses gambar. Format mungkin tidak didukung.'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file foto.'));
    };

    reader.readAsDataURL(file);
  });
}
