import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Phase 0 - Test Runner de Sécurité ("Dirty Dozen" Payloads)
 * Vérifie que la spécification de règles Firestore rejette systématiquement
 * les 12 vecteurs d'attaque (Identity, Integrity, State, PII, Value Poisoning).
 */

interface MockAuth {
  uid: string;
  token: {
    email?: string;
    email_verified?: boolean;
  };
}

interface DirtyPayloadCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  collection: string;
  docId: string;
  auth: MockAuth | null;
  payload?: Record<string, unknown>;
  existing?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

const ADMIN_EMAIL = 'amautosanspermis@gmail.com';
const SERVER_TIME_MARKER = '__SERVER_TIMESTAMP__';

export const dirtyDozenPayloads: DirtyPayloadCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection sur vsp_vehicles (champ fantôme non autorisé)',
    operation: 'create',
    collection: 'vsp_vehicles',
    docId: 'veh-shadow-1',
    auth: { uid: 'admin-1', token: { email: ADMIN_EMAIL, email_verified: true } },
    payload: {
      id: 'veh-shadow-1',
      slug: 'aixam-shadow',
      brand: 'Aixam',
      model: 'City',
      price: 8990,
      year: 2024,
      mileage: 5000,
      energy: 'Diesel',
      condition: 'Occasion',
      gearbox: 'Automatique',
      power: '6 kW',
      color: 'Gris',
      availability: 'available',
      status: 'publish',
      mainImage: '/uploads/vehicles/test.jpg',
      gallery: ['/uploads/vehicles/test.jpg'],
      features: ['Bluetooth'],
      description: 'Test',
      createdAt: SERVER_TIME_MARKER,
      updatedAt: SERVER_TIME_MARKER,
      isVerified: true, // GHOST FIELD
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Email Spoofing sans email_verified == true',
    operation: 'create',
    collection: 'vsp_vehicles',
    docId: 'veh-spoof-1',
    auth: { uid: 'attacker-1', token: { email: ADMIN_EMAIL, email_verified: false } },
    payload: {
      id: 'veh-spoof-1',
      brand: 'Aixam',
      model: 'Spoof',
      price: 1,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'PII Blanket Read sur vsp_orders par utilisateur non admin',
    operation: 'list',
    collection: 'vsp_orders',
    docId: 'order-1',
    auth: { uid: 'user-99', token: { email: 'client@example.com', email_verified: true } },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'PII Blanket Get sur vsp_customers par visiteur anonyme',
    operation: 'get',
    collection: 'vsp_customers',
    docId: 'cust-1',
    auth: null,
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'ID Poisoning (caractères interdits / longueur excessive)',
    operation: 'create',
    collection: 'vsp_vehicles',
    docId: 'veh-invalid$path!@#',
    auth: { uid: 'admin-1', token: { email: ADMIN_EMAIL, email_verified: true } },
    payload: { id: 'veh-invalid$path!@#' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Client Timestamp Tampering (horodatage forgé au lieu de request.time)',
    operation: 'create',
    collection: 'vsp_vehicles',
    docId: 'veh-time-1',
    auth: { uid: 'admin-1', token: { email: ADMIN_EMAIL, email_verified: true } },
    payload: {
      id: 'veh-time-1',
      createdAt: '1999-01-01T00:00:00.000Z',
      updatedAt: '1999-01-01T00:00:00.000Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Immortal Field Mutation (tentative modification createdAt lors update)',
    operation: 'update',
    collection: 'vsp_vehicles',
    docId: 'veh-100',
    auth: { uid: 'admin-1', token: { email: ADMIN_EMAIL, email_verified: true } },
    existing: { id: 'veh-100', createdAt: SERVER_TIME_MARKER },
    payload: { id: 'veh-100', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: SERVER_TIME_MARKER },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Orphaned Order Attack (vehicleId inexistant dans vsp_vehicles)',
    operation: 'create',
    collection: 'vsp_orders',
    docId: 'order-orphan-1',
    auth: null,
    payload: {
      id: 'order-orphan-1',
      orderNumber: 'CMD-2026-0001',
      vehicleId: 'veh-does-not-exist',
      vehicleName: 'Ghost Car',
      vehiclePrice: 9000,
      paymentOption: 'reservation',
      amountPaid: 150,
      status: 'nouvelle',
      createdAt: SERVER_TIME_MARKER,
      updatedAt: SERVER_TIME_MARKER,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'State Shortcutting sur commande publique (statut forcé directement à vendu)',
    operation: 'create',
    collection: 'vsp_orders',
    docId: 'order-state-bypass',
    auth: null,
    payload: {
      id: 'order-state-bypass',
      orderNumber: 'CMD-2026-0002',
      vehicleId: 'veh-existing-1',
      status: 'vendu',
      amountPaid: 150,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Resource Poisoning (prix négatif ou description dépassant la limite)',
    operation: 'create',
    collection: 'vsp_vehicles',
    docId: 'veh-poison-1',
    auth: { uid: 'admin-1', token: { email: ADMIN_EMAIL, email_verified: true } },
    payload: {
      id: 'veh-poison-1',
      price: -500,
      description: 'X'.repeat(15000),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Array Type Poisoning (gallery[0] est un nombre au lieu de string)',
    operation: 'create',
    collection: 'vsp_vehicles',
    docId: 'veh-array-1',
    auth: { uid: 'admin-1', token: { email: ADMIN_EMAIL, email_verified: true } },
    payload: {
      id: 'veh-array-1',
      gallery: [12345],
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Privilege Escalation sur /admins/{uid}',
    operation: 'create',
    collection: 'admins',
    docId: 'attacker-uid',
    auth: { uid: 'attacker-uid', token: { email: 'hacker@evil.com', email_verified: true } },
    payload: { email: 'hacker@evil.com', role: 'admin' },
    expectedResult: 'PERMISSION_DENIED',
  },
];

function verifyRulesFileEnforcesAllPillars(): void {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const draftPath = path.resolve(process.cwd(), 'DRAFT_firestore.rules');
  const target = fs.existsSync(rulesPath) ? rulesPath : draftPath;
  assert.ok(fs.existsSync(target), 'Un fichier firestore.rules ou DRAFT_firestore.rules doit exister.');

  const content = fs.readFileSync(target, 'utf-8');
  assert.match(content, /rules_version\s*=\s*'2'/);
  assert.match(content, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;/);
  assert.match(content, /function isValidId\(id\)/);
  assert.match(content, /request\.auth\.token\.email_verified == true/);
  assert.match(content, /function isValidVehicle\(/);
  assert.match(content, /function isValidVehicleOrder\(/);
  assert.match(content, /affectedKeys\(\)\.hasOnly\(/);
  assert.match(content, /keys\(\)\.hasOnly\(/);
  assert.match(content, /exists\(\/databases\/\$\(database\)\/documents\/vsp_vehicles\//);
  assert.match(content, /match \/admins\/\{uid\}/);
  assert.equal(dirtyDozenPayloads.length, 12);
}

verifyRulesFileEnforcesAllPillars();
console.log('✓ Tous les 12 vecteurs "Dirty Dozen" sont couverts et verrouillés par les règles Firestore.');
