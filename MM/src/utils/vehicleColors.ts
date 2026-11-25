/**
 * Rich vehicle colors presets for Voiture Sans Permis (VSP)
 * Real automotive colors used by Aixam, Ligier, Microcar, Chatenet, Bellier
 */

export interface VehicleColorPreset {
  name: string;
  hex: string;
  border?: boolean;
  gradient?: string;
  category: 'Classiques' | 'Sportives & Vives' | 'Élégantes & Rares' | 'Bicolores';
}

export const VSP_COLOR_PRESETS: VehicleColorPreset[] = [
  // Classiques
  { name: 'Blanc Nacré Métallisé', hex: '#F6F7F9', border: true, category: 'Classiques' },
  { name: 'Blanc Glacier Pur', hex: '#FFFFFF', border: true, category: 'Classiques' },
  { name: 'Noir Ébène Brillant', hex: '#1C1C1E', category: 'Classiques' },
  { name: 'Noir Mat Carbone', hex: '#2C2D30', category: 'Classiques' },
  { name: 'Gris Titane Métallisé', hex: '#5D6571', category: 'Classiques' },
  { name: 'Gris Minéral Foncé', hex: '#3E4249', category: 'Classiques' },
  { name: 'Gris Argent Lunaire', hex: '#B8BDC5', category: 'Classiques' },
  { name: 'Gris Nardo / Craie', hex: '#979A9E', category: 'Classiques' },
  { name: 'Gris Anthracite Verni', hex: '#2C3038', category: 'Classiques' },

  // Sportives & Vives
  { name: 'Bleu Récif Sport', hex: '#185ADB', category: 'Sportives & Vives' },
  { name: 'Bleu Miami Électrique', hex: '#00A3E0', category: 'Sportives & Vives' },
  { name: 'Bleu Nuit Saphir', hex: '#11224D', category: 'Sportives & Vives' },
  { name: 'Bleu Céleste Clair', hex: '#87B0E2', category: 'Sportives & Vives' },
  { name: 'Rouge Rubis Sport', hex: '#DC2626', category: 'Sportives & Vives' },
  { name: 'Rouge Grenat Intense', hex: '#991B1B', category: 'Sportives & Vives' },
  { name: 'Rouge Vif Écarlate', hex: '#EF4444', category: 'Sportives & Vives' },
  { name: 'Jaune Canari Sport', hex: '#FACC15', category: 'Sportives & Vives' },
  { name: 'Orange Cuivré Sensation', hex: '#EA580C', category: 'Sportives & Vives' },

  // Élégantes & Rares
  { name: 'Vert Forêt Profond', hex: '#164E35', category: 'Élégantes & Rares' },
  { name: 'Vert Olive Baroudeur', hex: '#4B5C3D', category: 'Élégantes & Rares' },
  { name: 'Bronze Doré Baroudeur', hex: '#8C6D3F', category: 'Élégantes & Rares' },
  { name: 'Champagne Sable Doré', hex: '#D6C7A1', category: 'Élégantes & Rares' },
  { name: 'Marron Glacé Moka', hex: '#533B2B', category: 'Élégantes & Rares' },
  { name: 'Violet Améthyste Nuit', hex: '#4C1D68', category: 'Élégantes & Rares' },

  // Bicolores
  {
    name: 'Bicolore Rouge & Toit Noir',
    hex: '#DC2626',
    gradient: 'linear-gradient(135deg, #DC2626 50%, #1C1C1E 50%)',
    category: 'Bicolores',
  },
  {
    name: 'Bicolore Blanc & Toit Noir',
    hex: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #FFFFFF 50%, #1C1C1E 50%)',
    border: true,
    category: 'Bicolores',
  },
  {
    name: 'Bicolore Bleu & Toit Noir',
    hex: '#185ADB',
    gradient: 'linear-gradient(135deg, #185ADB 50%, #1C1C1E 50%)',
    category: 'Bicolores',
  },
  {
    name: 'Bicolore Gris & Toit Noir',
    hex: '#979A9E',
    gradient: 'linear-gradient(135deg, #979A9E 50%, #1C1C1E 50%)',
    category: 'Bicolores',
  },
];

/**
 * Compresses an image file from the user's gallery / filesystem
 * so that it can be stored quickly in local persistence and Firestore documents
 * without exceeding storage quotas or slowing down the UI.
 */
export function compressImageFile(file: File, maxWidth = 960, quality = 0.74): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or gif, return as base64 without canvas resize
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        // Fallback to raw base64 if image drawing fails
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function reencodeDataUrl(dataUrl: string, maxWidth: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.startsWith('data:image/svg+xml')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      let width = img.width || maxWidth;
      let height = img.height || Math.round(maxWidth * 0.75);
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const out = canvas.toDataURL('image/jpeg', quality);
      resolve(out.length < dataUrl.length ? out : dataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Guarantees a single data:image/... URL fits cleanly under maxChars (default ~160 KB)
 * while leaving regular https:// URLs untouched.
 */
export async function fitDataUrlToMaxBytes(dataUrl: string, maxChars = 160000): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  if (dataUrl.length <= maxChars) {
    return dataUrl;
  }

  const attempts: Array<[number, number]> = [
    [960, 0.72],
    [800, 0.64],
    [680, 0.56],
    [540, 0.48],
    [420, 0.42],
    [320, 0.36],
  ];

  let current = dataUrl;
  for (const [maxW, q] of attempts) {
    current = await reencodeDataUrl(current, maxW, q);
    if (current.length <= maxChars) {
      return current;
    }
  }
  return current.slice(0, maxChars);
}

/**
 * Ensures mainImage + all gallery photos combined fit safely inside a single
 * Cloud Firestore document (< 1 MB) and comply with firestore.rules (<= 500k chars/image).
 */
export async function fitVehicleImagesToFirestoreBudget(
  mainImage: string,
  gallery: string[],
  totalCharBudget = 760000
): Promise<{ mainImage: string; gallery: string[] }> {
  const safeMainTarget = Math.min(180000, Math.floor(totalCharBudget * 0.3));
  const compressedMain = await fitDataUrlToMaxBytes(mainImage, safeMainTarget);

  const rawList = gallery.length > 0 ? gallery.slice(0, 30) : [compressedMain];
  // Collect distinct data URLs beyond mainImage
  const extraDataUrls = Array.from(
    new Set(
      rawList.filter(
        (item) => item && item.startsWith('data:image/') && item !== mainImage && item !== compressedMain
      )
    )
  );

  const remainingBudget = Math.max(80000, totalCharBudget - compressedMain.length);
  const perExtraBudget =
    extraDataUrls.length > 0
      ? Math.max(22000, Math.min(140000, Math.floor(remainingBudget / extraDataUrls.length)))
      : 140000;

  const extraMap = new Map<string, string>();
  for (const src of extraDataUrls) {
    extraMap.set(src, await fitDataUrlToMaxBytes(src, perExtraBudget));
  }

  const finalGallery = rawList.map((item) => {
    if (item === mainImage || item === compressedMain) return compressedMain;
    return extraMap.get(item) || item;
  });

  // Final total safeguard in case many distinct images were included
  let totalDataChars =
    (compressedMain.startsWith('data:image/') ? compressedMain.length : 0) +
    Array.from(extraMap.values()).reduce((sum, val) => sum + val.length, 0);

  if (totalDataChars > totalCharBudget && extraDataUrls.length > 0) {
    const tighterBudget = Math.max(
      18000,
      Math.floor((totalCharBudget - compressedMain.length) / extraDataUrls.length)
    );
    for (const [orig, val] of extraMap.entries()) {
      extraMap.set(orig, await fitDataUrlToMaxBytes(val, tighterBudget));
    }
    totalDataChars =
      (compressedMain.startsWith('data:image/') ? compressedMain.length : 0) +
      Array.from(extraMap.values()).reduce((sum, val) => sum + val.length, 0);
    if (totalDataChars > totalCharBudget) {
      const ultraMain = await fitDataUrlToMaxBytes(compressedMain, 100000);
      return {
        mainImage: ultraMain,
        gallery: rawList.map((item) =>
          item === mainImage || item === compressedMain ? ultraMain : extraMap.get(item) || item
        ),
      };
    }
    return {
      mainImage: compressedMain,
      gallery: rawList.map((item) =>
        item === mainImage || item === compressedMain ? compressedMain : extraMap.get(item) || item
      ),
    };
  }

  return { mainImage: compressedMain, gallery: finalGallery };
}

