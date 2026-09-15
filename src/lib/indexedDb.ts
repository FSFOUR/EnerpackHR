// IndexedDB offline cache helper for Enerpack HR Attendance and Tasks

const DB_NAME = 'EnerpackOfflineDB';
const DB_VERSION = 1;
const STORE_ATTENDANCE = 'attendanceCache';
const STORE_TASKS = 'tasksCache';

export function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported by this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB.'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ATTENDANCE)) {
        db.createObjectStore(STORE_ATTENDANCE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_TASKS)) {
        db.createObjectStore(STORE_TASKS, { keyPath: 'id' });
      }
    };
  });
}

export async function cacheAttendanceData(records: any[]): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_ATTENDANCE, 'readwrite');
    const store = tx.objectStore(STORE_ATTENDANCE);
    
    for (const record of records) {
      store.put(record);
    }
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB cache attendance error:', err);
  }
}

export async function getCachedAttendance(): Promise<any[]> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_ATTENDANCE, 'readonly');
    const store = tx.objectStore(STORE_ATTENDANCE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB get cached attendance error:', err);
    return [];
  }
}

export async function cacheTasksData(tasks: any[]): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_TASKS, 'readwrite');
    const store = tx.objectStore(STORE_TASKS);
    
    for (const task of tasks) {
      store.put(task);
    }
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB cache tasks error:', err);
  }
}

export async function getCachedTasks(): Promise<any[]> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_TASKS, 'readonly');
    const store = tx.objectStore(STORE_TASKS);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB get cached tasks error:', err);
    return [];
  }
}
