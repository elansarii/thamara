'use client';

import initSqlJs, { Database } from 'sql.js';

// Database singleton
let db: Database | null = null;
let dbReady: Promise<Database> | null = null;

const DB_NAME = 'thamara_sqlite_db';
const DB_STORE = 'sqliteStore';
const DB_KEY = 'database';

// Initialize IndexedDB for persistence
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };
  });
}

// Save database to IndexedDB
async function saveToIndexedDB(data: Uint8Array): Promise<void> {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = idb.transaction(DB_STORE, 'readwrite');
    const store = transaction.objectStore(DB_STORE);
    const request = store.put(data, DB_KEY);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();

    transaction.oncomplete = () => idb.close();
  });
}

// Load database from IndexedDB
async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = idb.transaction(DB_STORE, 'readonly');
      const store = transaction.objectStore(DB_STORE);
      const request = store.get(DB_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);

      transaction.oncomplete = () => idb.close();
    });
  } catch (error) {
    console.error('Failed to load from IndexedDB:', error);
    return null;
  }
}

// Initialize the database
async function initDatabase(): Promise<Database> {
  if (typeof window === 'undefined') {
    throw new Error('Database can only be initialized in the browser');
  }

  // Initialize sql.js with WASM
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`
  });

  // Try to load existing database from IndexedDB
  const savedData = await loadFromIndexedDB();

  if (savedData) {
    db = new SQL.Database(savedData);
    console.log('Loaded existing database from IndexedDB');
  } else {
    db = new SQL.Database();
    console.log('Created new database');
    createTables(db);
    await migrateFromLocalStorage(db);
  }

  return db;
}

// Create all tables
function createTables(db: Database): void {
  // Plots table
  db.run(`
    CREATE TABLE IF NOT EXISTS plots (
      id TEXT PRIMARY KEY,
      name TEXT,
      areaM2 REAL,
      locationMethod TEXT,
      lat REAL,
      lon REAL,
      salinity TEXT,
      contamination TEXT,
      debris TEXT,
      waterAccess TEXT,
      notes TEXT,
      createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Exchange listings table
  db.run(`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      mode TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      quantity REAL,
      unit TEXT,
      locationLabel TEXT,
      distanceBand TEXT,
      urgency TEXT,
      trust TEXT,
      notes TEXT,
      createdAt INTEGER,
      status TEXT DEFAULT 'active',
      dateTime TEXT,
      capacity TEXT,
      skillTags TEXT,
      availableItems TEXT,
      hours TEXT,
      hubName TEXT
    )
  `);

  // Request bundles table
  db.run(`
    CREATE TABLE IF NOT EXISTS request_bundles (
      id TEXT PRIMARY KEY,
      cropName TEXT NOT NULL,
      plotSize TEXT,
      items TEXT,
      createdAt INTEGER
    )
  `);

  // Water points table
  db.run(`
    CREATE TABLE IF NOT EXISTS water_points (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      lng REAL,
      lat REAL,
      name TEXT,
      lastConfirmed TEXT,
      reliabilityScore INTEGER,
      status TEXT
    )
  `);

  // Harvest drops table
  db.run(`
    CREATE TABLE IF NOT EXISTS harvest_drops (
      id TEXT PRIMARY KEY,
      cropType TEXT,
      cropCommonName TEXT,
      windowStart TEXT,
      windowEnd TEXT,
      quantityMin REAL,
      quantityMax REAL,
      unit TEXT,
      locationLabel TEXT,
      pickupPreference TEXT,
      spoilageRisk TEXT,
      status TEXT DEFAULT 'open',
      notes TEXT,
      createdAt TEXT
    )
  `);

  // Funding cases table
  db.run(`
    CREATE TABLE IF NOT EXISTS funding_cases (
      id TEXT PRIMARY KEY,
      farmerAlias TEXT,
      bundleType TEXT,
      supplierName TEXT,
      items TEXT,
      budgetEstimate REAL,
      currency TEXT DEFAULT 'USD',
      statusTimeline TEXT,
      receiptTokens TEXT,
      proofFlags TEXT,
      createdAt TEXT,
      currentStatus TEXT DEFAULT 'submitted',
      notes TEXT
    )
  `);

  // Crop cache table
  db.run(`
    CREATE TABLE IF NOT EXISTS crop_cache (
      cropId TEXT PRIMARY KEY,
      imageUrl TEXT,
      imageSource TEXT,
      description TEXT,
      descriptionSource TEXT,
      lastUpdated INTEGER
    )
  `);

  // App settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  console.log('Database tables created');
}

// Migrate data from localStorage to SQLite
async function migrateFromLocalStorage(db: Database): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Migrate exchange listings
    const listingsData = localStorage.getItem('thamara_exchange_listings');
    if (listingsData) {
      const listings = JSON.parse(listingsData);
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO listings
        (id, type, mode, category, title, quantity, unit, locationLabel, distanceBand, urgency, trust, notes, createdAt, status, dateTime, capacity, skillTags, availableItems, hours, hubName)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const l of listings) {
        stmt.run([
          l.id, l.type, l.mode, l.category, l.title, l.quantity, l.unit,
          l.locationLabel, l.distanceBand, l.urgency, l.trust, l.notes,
          l.createdAt, l.status, l.dateTime, l.capacity,
          l.skillTags ? JSON.stringify(l.skillTags) : null,
          l.availableItems ? JSON.stringify(l.availableItems) : null,
          l.hours, l.hubName
        ]);
      }
      stmt.free();
      console.log(`Migrated ${listings.length} listings from localStorage`);
    }

    // Migrate request bundles
    const bundlesData = localStorage.getItem('thamara_exchange_bundles');
    if (bundlesData) {
      const bundles = JSON.parse(bundlesData);
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO request_bundles (id, cropName, plotSize, items, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const b of bundles) {
        stmt.run([b.id, b.cropName, b.plotSize, JSON.stringify(b.items), b.createdAt]);
      }
      stmt.free();
      console.log(`Migrated ${bundles.length} bundles from localStorage`);
    }

    // Migrate harvest drops
    const dropsData = localStorage.getItem('thamara_harvest_drops');
    if (dropsData) {
      const drops = JSON.parse(dropsData);
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO harvest_drops
        (id, cropType, cropCommonName, windowStart, windowEnd, quantityMin, quantityMax, unit, locationLabel, pickupPreference, spoilageRisk, status, notes, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const d of drops) {
        stmt.run([
          d.id, d.cropType, d.cropCommonName, d.windowStart, d.windowEnd,
          d.quantityMin, d.quantityMax, d.unit, d.locationLabel,
          d.pickupPreference, d.spoilageRisk, d.status, d.notes, d.createdAt
        ]);
      }
      stmt.free();
      console.log(`Migrated ${drops.length} drops from localStorage`);
    }

    // Migrate funding cases
    const casesData = localStorage.getItem('thamara_funding_cases');
    if (casesData) {
      const cases = JSON.parse(casesData);
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO funding_cases
        (id, farmerAlias, bundleType, supplierName, items, budgetEstimate, currency, statusTimeline, receiptTokens, proofFlags, createdAt, currentStatus, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const c of cases) {
        stmt.run([
          c.id, c.farmerAlias, c.bundleType, c.supplierName,
          JSON.stringify(c.items), c.budgetEstimate, c.currency,
          JSON.stringify(c.statusTimeline), JSON.stringify(c.receiptTokens),
          JSON.stringify(c.proofFlags), c.createdAt, c.currentStatus, c.notes
        ]);
      }
      stmt.free();
      console.log(`Migrated ${cases.length} funding cases from localStorage`);
    }

    // Save after migration
    await persistDatabase();
    console.log('Migration from localStorage complete');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Get the database instance
export async function getDatabase(): Promise<Database> {
  if (db) return db;

  if (!dbReady) {
    dbReady = initDatabase();
  }

  return dbReady;
}

// Persist database to IndexedDB
export async function persistDatabase(): Promise<void> {
  if (!db) return;

  try {
    const data = db.export();
    const buffer = new Uint8Array(data);
    await saveToIndexedDB(buffer);
    console.log('Database persisted to IndexedDB');
  } catch (error) {
    console.error('Failed to persist database:', error);
  }
}

// Execute a query and return results
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const database = await getDatabase();

  try {
    const stmt = database.prepare(sql);
    stmt.bind(params);

    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as T);
    }
    stmt.free();

    return results;
  } catch (error) {
    console.error('Query error:', sql, error);
    throw error;
  }
}

// Execute a statement (INSERT, UPDATE, DELETE)
export async function execute(
  sql: string,
  params: unknown[] = []
): Promise<void> {
  const database = await getDatabase();

  try {
    database.run(sql, params);
    await persistDatabase();
  } catch (error) {
    console.error('Execute error:', sql, error);
    throw error;
  }
}

// Execute multiple statements in a transaction
export async function transaction(
  statements: { sql: string; params?: unknown[] }[]
): Promise<void> {
  const database = await getDatabase();

  try {
    database.run('BEGIN TRANSACTION');

    for (const { sql, params = [] } of statements) {
      database.run(sql, params);
    }

    database.run('COMMIT');
    await persistDatabase();
  } catch (error) {
    database.run('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  }
}

// Generate a unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
