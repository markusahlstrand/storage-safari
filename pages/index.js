import { useEffect, useState } from 'react';
import { setAllStorage, getAllStorage, clearAllStorage } from '../utils/storage';
import StorageInfo from '../components/StorageInfo';
import ClearStorageButton from '../components/ClearStorageButton';

export default function Home() {
  const [storageData, setStorageData] = useState({});

  const updateStorageData = async () => {
    const data = await getAllStorage();
    setStorageData(data);
  };

  useEffect(() => {
    const initializeStorage = async () => {
      await setAllStorage();
      await updateStorageData();
    };
    initializeStorage();
  }, []);

  const handleClearStorage = async () => {
    await clearAllStorage();
    await updateStorageData();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Browser Storage Test App</h1>
        <StorageInfo storageData={storageData} />
        <div className="mt-8">
          <ClearStorageButton onClear={handleClearStorage} />
        </div>
      </div>
    </div>
  );
}