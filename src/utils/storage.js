import Cookies from 'js-cookie';

export const setAllStorage = () => {
  const timestamp = new Date().toISOString();

  // LocalStorage
  try {
    localStorage.setItem('testTimestamp', timestamp);
  } catch (e) {
    console.error('LocalStorage not available:', e);
  }

  // SessionStorage
  try {
    sessionStorage.setItem('testTimestamp', timestamp);
  } catch (e) {
    console.error('SessionStorage not available:', e);
  }

  // IndexedDB
  const dbName = 'TestDB';
  const dbVersion = 1;
  const request = indexedDB.open(dbName, dbVersion);

  request.onerror = (event) => {
    console.error('IndexedDB error:', event.target.error);
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['testStore'], 'readwrite');
    const objectStore = transaction.objectStore('testStore');
    const addRequest = objectStore.put({ id: 'timestamp', value: timestamp });

    addRequest.onerror = (event) => {
      console.error('Error adding data to IndexedDB:', event.target.error);
    };
  };

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore('testStore', { keyPath: 'id' });
  };

  // Browser Cookie
  Cookies.set('testTimestamp', timestamp);

  // HTTP-only Cookie (Note: This can only be set by the server)
  // For demonstration purposes, we'll just set a regular cookie
  Cookies.set('httpOnlyTestTimestamp', timestamp, { httpOnly: true });
};

export const getAllStorage = () => {
  const data = {
    localStorage: localStorage.getItem('testTimestamp') || 'Not set',
    sessionStorage: sessionStorage.getItem('testTimestamp') || 'Not set',
    indexedDB: 'Checking...',
    browserCookie: Cookies.get('testTimestamp') || 'Not set',
    httpOnlyCookie: Cookies.get('httpOnlyTestTimestamp') || 'Not set (or HTTP-only)',
  };

  // Check IndexedDB
  const dbName = 'TestDB';
  const dbVersion = 1;
  const request = indexedDB.open(dbName, dbVersion);

  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['testStore'], 'readonly');
    const objectStore = transaction.objectStore('testStore');
    const getRequest = objectStore.get('timestamp');

    getRequest.onsuccess = (event) => {
      if (event.target.result) {
        data.indexedDB = event.target.result.value;
      } else {
        data.indexedDB = 'Not set';
      }
    };
  };

  return data;
};

export const clearAllStorage = () => {
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
  Cookies.remove('httpOnlyTestTimestamp');
};