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
  try {
    if (!localStorage.getItem('testTimestamp')) {
      localStorage.setItem('testTimestamp', timestamp);
    }
  } catch (e) {
    console.error('LocalStorage not available:', e);
  }

  // SessionStorage
  try {
    if (!sessionStorage.getItem('testTimestamp')) {
      sessionStorage.setItem('testTimestamp', timestamp);
    }
  } catch (e) {
    console.error('SessionStorage not available:', e);
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

  // HTTP-only Cookie (Note: This can only be set by the server)
  // For demonstration purposes, we'll just set a regular cookie
  if (!Cookies.get('httpOnlyTestTimestamp')) {
    Cookies.set('httpOnlyTestTimestamp', timestamp, { expires: 7 });
  }
};

export const getAllStorage = () => {
  return new Promise((resolve) => {
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
        resolve(data);
      };

      getRequest.onerror = () => {
        data.indexedDB = 'Error retrieving';
        resolve(data);
      };
    };

    request.onerror = () => {
      data.indexedDB = 'Error opening database';
      resolve(data);
    };
  });
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
