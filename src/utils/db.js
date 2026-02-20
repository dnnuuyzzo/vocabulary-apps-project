/**
 * db.js
 * 
 * IndexedDB Wrapper (using 'idb' library).
 * 
 * WHY THIS EXISTS?
 * LocalStorage is limited to ~5MB. IndexedDB allows storing unlimited data
 * (thousands of words, history records, etc.) without size errors.
 * 
 * We use this as the "Heavy Storage" while localStroage is for simple settings.
 */
import { openDB } from 'idb';

const DB_NAME = 'vocabulary-app-db';
const DB_VERSION = 1;

// Initialize database
const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        // Create object stores
        if (!db.objectStoreNames.contains('vocab')) {
            db.createObjectStore('vocab');
        }
        if (!db.objectStoreNames.contains('progress')) {
            db.createObjectStore('progress');
        }
        if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('trash')) {
            db.createObjectStore('trash');
        }
    },
});

// Generic database operations
export const DB = {
    async get(storeName, key) {
        try {
            const db = await dbPromise;
            return await db.get(storeName, key);
        } catch (error) {
            console.error(`Error getting ${key} from ${storeName}:`, error);
            return null;
        }
    },

    async set(storeName, key, value) {
        try {
            const db = await dbPromise;
            await db.put(storeName, value, key);
            return true;
        } catch (error) {
            console.error(`Error setting ${key} in ${storeName}:`, error);
            return false;
        }
    },

    async delete(storeName, key) {
        try {
            const db = await dbPromise;
            await db.delete(storeName, key);
            return true;
        } catch (error) {
            console.error(`Error deleting ${key} from ${storeName}:`, error);
            return false;
        }
    },

    async clear(storeName) {
        try {
            const db = await dbPromise;
            await db.clear(storeName);
            return true;
        } catch (error) {
            console.error(`Error clearing ${storeName}:`, error);
            return false;
        }
    },

    async getAll(storeName) {
        try {
            const db = await dbPromise;
            return await db.getAll(storeName);
        } catch (error) {
            console.error(`Error getting all from ${storeName}:`, error);
            return [];
        }
    }
};

// Migration from localStorage to IndexedDB
export const migrateFromLocalStorage = async () => {
    try {
        // Check if data exists in localStorage
        const vocabData = localStorage.getItem('vocab_app_data');
        const progressData = localStorage.getItem('vocab_app_progress');
        const settingsData = localStorage.getItem('vocab_app_settings');
        const trashData = localStorage.getItem('vocab_app_trash');

        // Migrate if data exists
        if (vocabData) {
            await DB.set('vocab', 'data', JSON.parse(vocabData));
            console.log('✓ Migrated vocab data to IndexedDB');
        }
        if (progressData) {
            await DB.set('progress', 'data', JSON.parse(progressData));
            console.log('✓ Migrated progress data to IndexedDB');
        }
        if (settingsData) {
            await DB.set('settings', 'data', JSON.parse(settingsData));
            console.log('✓ Migrated settings data to IndexedDB');
        }
        if (trashData) {
            await DB.set('trash', 'data', JSON.parse(trashData));
            console.log('✓ Migrated trash data to IndexedDB');
        }

        // Clear localStorage after successful migration
        if (vocabData || progressData || settingsData || trashData) {
            console.log('✓ Migration completed successfully');
        }

        return true;
    } catch (error) {
        console.error('Migration failed:', error);
        return false;
    }
};
