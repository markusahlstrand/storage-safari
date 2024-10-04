import Cookies from 'js-cookie';

const setIndexedDB = (timestamp) => {
  return new Promise((resolve, reject) => {
    const dbName = 'TestDB';
    const dbVersion = 1;
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['testStore'], 'readwrite');
      const objectStore = transaction.objectStore('testStore');
      
      // Check if a value already exists
      const getRequest = objectStore.get('timestamp');
      
      getRequest.onsuccess = (event) => {
        if (!event.target.result) {
          // Only set if no value exists
          const addRequest = objectStore.put({ id: 'timestamp', value: timestamp });
          addRequest.onsuccess = () => resolve();
          addRequest.onerror = (event) => reject(event.target.error);
        } else {
          resolve(); // Value already exists, do nothing
        }
      };
      
      getRequest.onerror = (event) => reject(event.target.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('testStore', { keyPath: 'id' });
    };
  });
};

export const setAllStorage = async () => {
  const timestamp = new Date().toISOString();

  // LocalStorage
  if (!localStorage.getItem('testTimestamp')) {
    localStorage.setItem('testTimestamp', timestamp);
  }

  // SessionStorage
  if (!sessionStorage.getItem('testTimestamp')) {
    sessionStorage.setItem('testTimestamp', timestamp);
  }

  // IndexedDB
  try {
    await setIndexedDB(timestamp);
  } catch (e) {
    console.error('IndexedDB error:', e);
  }

  // Browser Cookie
  if (!Cookies.get('testTimestamp')) {
    Cookies.set('testTimestamp', timestamp, { expires: 7 }); // Set to expire in 7 days
  }

  // HTTP-only Cookie (set via API call)
  try {
    await fetch('/api/set-cookie', { method: 'POST' });
  } catch (error) {
    console.error('Error setting HTTP-only cookie:', error);
  }
};

export const getAllStorage = async () => {
  const data = {
    localStorage: localStorage.getItem('testTimestamp') || 'Not set',
    sessionStorage: sessionStorage.getItem('testTimestamp') || 'Not set',
    indexedDB: 'Checking...',
    browserCookie: Cookies.get('testTimestamp') || 'Not set',
    httpOnlyCookie: 'Checking...',
  };

  // Check IndexedDB
  try {
    const dbName = 'TestDB';
    const dbVersion = 1;
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });

    const transaction = db.transaction(['testStore'], 'readonly');
    const objectStore = transaction.objectStore('testStore');
    const getRequest = objectStore.get('timestamp');

    const result = await new Promise((resolve, reject) => {
      getRequest.onsuccess = (event) => resolve(event.target.result);
      getRequest.onerror = (event) => reject(event.target.error);
    });

    data.indexedDB = result ? result.value : 'Not set';
  } catch (error) {
    data.indexedDB = 'Error retrieving';
    console.error('Error checking IndexedDB:', error);
  }

  // Check HTTP-only Cookie
  try {
    const response = await fetch('/api/get-cookie');
    const cookieData = await response.json();
    data.httpOnlyCookie = cookieData.httpOnlyCookie || 'Not set';
  } catch (error) {
    data.httpOnlyCookie = 'Error retrieving';
    console.error('Error checking HTTP-only cookie:', error);
  }

  return data;
};

export const clearAllStorage = async () => {
  // Clear LocalStorage
  localStorage.removeItem('testTimestamp');

  // Clear SessionStorage
  sessionStorage.removeItem('testTimestamp');

  // Clear IndexedDB
  const dbName = 'TestDB';
  const request = indexedDB.deleteDatabase(dbName);

  request.onerror = (event) => {
    console.error('Error deleting IndexedDB:', event.target.error);
  };

  // Clear Cookies
  Cookies.remove('testTimestamp');

  // Clear HTTP-only Cookie
  try {
    await fetch('/api/clear-cookie', { method: 'POST' });
  } catch (error) {
    console.error('Error clearing HTTP-only cookie:', error);
  }
};