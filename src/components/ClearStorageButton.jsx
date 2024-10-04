import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

const ClearStorageButton = ({ onClear }) => {
  return (
    <Button onClick={onClear} variant="destructive" className="w-full">
      <Trash2 className="mr-2 h-4 w-4" /> Clear All Storage
    </Button>
  );
};

export default ClearStorageButton;