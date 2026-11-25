/**
 * Service to generate the authentic Jean Auto VSP dealership stamp (cachet commercial officiel)
 * as a high-resolution transparent PNG Data URL matching the user's physical self-inking stamp.
 */

let cachedStampDataUrl: string | null = null;

export function getDealershipStampDataUrl(): string {
  if (cachedStampDataUrl) {
    return cachedStampDataUrl;
  }

  // If running in SSR or node without document, fallback
  if (typeof document === 'undefined') {
    return '';
  }

  try {
    const size = 600;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const center = size / 2; // 300
    const stampBlue = '#0e4e9b'; // Authentic French dealership stamp ink blue

    ctx.save();
    // Slight authentic tilt (-2.8 degrees) to look naturally hand-stamped on the paper
    ctx.translate(center, center);
    ctx.rotate(-0.048);
    ctx.translate(-center, -center);

    // 1. Outer Circle Border
    ctx.beginPath();
    ctx.arc(center, center, 274, 0, Math.PI * 2);
    ctx.lineWidth = 5.8;
    ctx.strokeStyle = stampBlue;
    ctx.stroke();

    // 2. Inner Concentric Circle Border
    ctx.beginPath();
    ctx.arc(center, center, 214, 0, Math.PI * 2);
    ctx.lineWidth = 4.4;
    ctx.strokeStyle = stampBlue;
    ctx.stroke();

    const ringRadius = (274 + 214) / 2; // 244px

    // Setup text style for curved ring text
    ctx.fillStyle = stampBlue;
    ctx.font = 'bold 31px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 3. Top Arc Text: "Voiture sans permis"
    const topText = 'Voiture sans permis';
    const topChars = topText.split('');
    // Arc spanning across the top from ~ -148 deg to -32 deg (centered at -90 deg)
    const topArcSpan = Math.PI * 0.65; // ~117 degrees
    const topStartAngle = -Math.PI / 2 - topArcSpan / 2;
    const topStep = topArcSpan / (topChars.length - 1);

    for (let i = 0; i < topChars.length; i++) {
      const charAngle = topStartAngle + i * topStep;
      const x = center + ringRadius * Math.cos(charAngle);
      const y = center + ringRadius * Math.sin(charAngle);
      const tangent = charAngle + Math.PI / 2;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tangent);
      ctx.fillText(topChars[i], 0, 0);
      ctx.restore();
    }

    // 4. Stars (Left and Right)
    ctx.font = '900 28px Arial, Helvetica, sans-serif';
    // Left star at 180°
    const leftStarX = center + ringRadius * Math.cos(Math.PI);
    const leftStarY = center + ringRadius * Math.sin(Math.PI);
    ctx.fillText('★', leftStarX, leftStarY + 1);

    // Right star at 0°
    const rightStarX = center + ringRadius * Math.cos(0);
    const rightStarY = center + ringRadius * Math.sin(0);
    ctx.fillText('★', rightStarX, rightStarY + 1);

    // 5. Bottom Arc Text: "Voiture sans permis"
    // Left to right along bottom curve, baseline against outer circle, tops facing center
    ctx.font = 'bold 31px Arial, Helvetica, sans-serif';
    const bottomText = 'Voiture sans permis';
    const bottomChars = bottomText.split('');
    const bottomArcSpan = Math.PI * 0.65;
    // Left is +90 + span/2, Right is +90 - span/2
    const bottomStartAngle = Math.PI / 2 + bottomArcSpan / 2;
    const bottomStep = bottomArcSpan / (bottomChars.length - 1);

    for (let i = 0; i < bottomChars.length; i++) {
      const charAngle = bottomStartAngle - i * bottomStep;
      const x = center + ringRadius * Math.cos(charAngle);
      const y = center + ringRadius * Math.sin(charAngle);
      // Rotation angle so text is upright at bottom center and tilts naturally along the arc
      const tangent = Math.PI / 2 - charAngle;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tangent);
      ctx.fillText(bottomChars[i], 0, 0);
      ctx.restore();
    }

    // 6. Center Oval / Capsule Border
    const ovalWidth = 322;
    const ovalHeight = 112;
    const ovalRadius = ovalHeight / 2; // 56px (semicircular ends)
    const ovalX = center - ovalWidth / 2;
    const ovalY = center - ovalHeight / 2;

    ctx.beginPath();
    ctx.roundRect(ovalX, ovalY, ovalWidth, ovalHeight, ovalRadius);
    ctx.lineWidth = 4.8;
    ctx.strokeStyle = stampBlue;
    ctx.stroke();

    // 7. Center Text: "Jean auto vsp"
    ctx.font = 'bold 47px Arial, Helvetica, sans-serif';
    ctx.fillStyle = stampBlue;
    ctx.fillText('Jean auto vsp', center, center + 2);

    // 8. Very subtle realistic ink porosity (to ensure it looks like physical ink stamp, not a flat rectangle)
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 60; i++) {
      const rx = center + (Math.random() - 0.5) * 500;
      const ry = center + (Math.random() - 0.5) * 500;
      const dist = Math.hypot(rx - center, ry - center);
      if (dist < 275) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(rx, ry, Math.random() * 2 + 0.5, Math.random() * 2 + 0.5);
      }
    }
    ctx.globalAlpha = 1.0;

    ctx.restore();

    cachedStampDataUrl = canvas.toDataURL('image/png');
    return cachedStampDataUrl;
  } catch (err) {
    console.warn('Error generating dealership stamp image:', err);
    return '';
  }
}
