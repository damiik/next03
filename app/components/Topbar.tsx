"use client";
import React from 'react';
import Image from "next/image";
import { Save, PlayCircle, RotateCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useComponentContext } from '../context/ComponentContext';

const Topbar: React.FC = () => {
  const { setComponents, setIsRefreshing, setPreviewKey, editableCode, selectedComponent, setCodeMirrorHeight, resetChatHistory } = useComponentContext();
  const handleSave = () => {
    // Update components with the current editableCode
    setComponents(prev => ({
      ...prev,
      [selectedComponent]: editableCode[selectedComponent]
    }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Update components with the current editableCode
    setComponents(prev => ({
      ...prev,
      [selectedComponent]: editableCode[selectedComponent]
    }));
    setTimeout(() => {
      setIsRefreshing(false);
      setPreviewKey(prev => prev + 1);
    }, 500);
  };

  const handleReset = () => {
    resetChatHistory(); // Call the resetChatHistory function
    setComponents(prev => ({ ...prev }));
    setPreviewKey(prev => prev + 1);
  };

  const handleIncreaseHeight = () => {
    setCodeMirrorHeight(prevHeight => prevHeight + 400);
  };

  const handleDecreaseHeight = () => {
    setCodeMirrorHeight(prevHeight => Math.max(prevHeight - 400, 0));
  };

  return (
    <header className="bg-black p-1 flex justify-between items-center">
      <div className="flex gap-1 items-center">
        <Image
          className="dark"
          src="/images/daryo-logo.svg"
          alt="daryo.pl logo"
          width={180}
          height={28}
          priority
        />
      </div>
      <div className="flex gap-4 items-center">
        <button onClick={handleSave} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" title="Save changes"><Save size={16} /></button>
        <button onClick={handleRefresh} className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors" title="Refresh preview"><PlayCircle size={16} /></button>
        <button onClick={handleReset} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors" title="Reset to default"><RotateCw size={16} /></button>
        <button onClick={handleIncreaseHeight} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" title="Increase height"><ChevronDown size={16} /></button>
        <button onClick={handleDecreaseHeight} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" title="Decrease height"><ChevronUp size={16} /></button>
        <a
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-[50%] sm:h-[50%] px-4 sm:px-5"
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read our docs
        </a>
      </div>

    </header>
  );
};

export default Topbar;
