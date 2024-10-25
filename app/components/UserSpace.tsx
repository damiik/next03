"use client";

import { useState, useEffect, useCallback } from 'react';

interface Step {
  array: number[];
  pivot: number;
  left: number;
  right: number;
  message: string;
  side: string | null;
}

const UserSpace = () => {
  // useState is used to declare state variables and their corresponding setter functions.
  const [array, setArray] = useState<number[]>([]);
  const [pivotIndex, setPivotIndex] = useState(-1);
  const [leftPointer, setLeftPointer] = useState(-1);
  const [rightPointer, setRightPointer] = useState(-1);
  const [isSorting, setIsSorting] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [partitionSide, setPartitionSide] = useState<string | null>(null);

  const generateArray = () => {
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10);
    setArray(newArray);
    setSteps([]);
    setCurrentStep(0);
    setPivotIndex(-1);
    setLeftPointer(-1);
    setRightPointer(-1);
    setIsSorting(false);
    setIsAutoPlay(false);
    setPartitionSide(null);
  };

  const quickSort = (arr: number[], low: number = 0, high: number = arr.length - 1, steps: Step[] = [], side: string | null = null): Step[] => {
    if (low < high) {
      const pivotIndex = partition(arr, low, high, steps, side);
      quickSort(arr, low, pivotIndex - 1, steps, "left");
      quickSort(arr, pivotIndex + 1, high, steps, "right");
    }
    return steps;
  };

  const partition = (arr: number[], low: number, high: number, steps: Step[], side: string | null): number => {
    const pivot = arr[low];
    let left = low + 1;
    let right = high;

    steps.push({
      array: [...arr],
      pivot: low,
      left,
      right,
      message: `Starting partition with pivot ${pivot}`,
      side
    });

    while (left <= right) {
      while (left <= high && arr[left] <= pivot) {
        steps.push({
          array: [...arr],
          pivot: low,
          left,
          right,
          message: `Left pointer at ${arr[left]} (≤ pivot ${pivot}), moving right`,
          side
        });
        left++;
      }
      if (left <= high) {
        steps.push({
          array: [...arr],
          pivot: low,
          left,
          right,
          message: `Left pointer found ${arr[left]} (> pivot ${pivot})`,
          side
        });
      }

      while (right > low && arr[right] > pivot) {
        steps.push({
          array: [...arr],
          pivot: low,
          left,
          right,
          message: `Right pointer at ${arr[right]} (> pivot ${pivot}), moving left`,
          side
        });
        right--;
      }
      if (right > low) {
        steps.push({
          array: [...arr],
          pivot: low,
          left,
          right,
          message: `Right pointer found ${arr[right]} (≤ pivot ${pivot})`,
          side
        });
      }

      if (left < right) {
        steps.push({
          array: [...arr],
          pivot: low,
          left,
          right,
          message: `Swapping elements at indices ${left} and ${right}: ${arr[left]} (greater than pivot) with ${arr[right]} (less than or equal to pivot) because ${arr[left]} > pivot and ${arr[right]} <= pivot`,
          side
        });
        [arr[left], arr[right]] = [arr[right], arr[left]];
        steps.push({
          array: [...arr],
          pivot: low,
          left,
          right,
          message: `Elements swapped. Array is now: [${arr.join(', ')}]`,
          side
        });
      }
    }

    [arr[low], arr[right]] = [arr[right], arr[low]];
    steps.push({
      array: [...arr],
      pivot: right,
      left: -1,
      right: -1,
      message: `Pivot ${pivot} placed in its final position at index ${right}`,
      side
    });

    return right;
  };

  const startSort = () => {
    const newSteps = quickSort([...array], 0, array.length - 1, [], null);
    setSteps(newSteps);
    setIsSorting(true);
    setIsAutoPlay(true);
    setCurrentStep(0);
  };

  // useCallback is used to memoize the handleStep function, ensuring that it is only recreated
  // when one of its dependencies changes.
  // By using useCallback, the component can avoid unnecessary re-renders and improve overall performance.
  // So when the same inputs occur again to handleStep then instead of expensive function call, React just returning the cached (memoized) result .
  // This is important for optimizing performance, especially in components that re-render frequently.
  const handleStep = useCallback(() => {
    if (steps.length === 0) {
      const newSteps = quickSort([...array], 0, array.length - 1, [], null);
      setSteps(newSteps);
      setIsSorting(true);
      setCurrentStep(0);
      return;
    }

    if (currentStep < steps.length) {
      const step = steps[currentStep];
      setArray(step.array);
      setPivotIndex(step.pivot);
      setLeftPointer(step.left);
      setRightPointer(step.right);
      setPartitionSide(step.side);
      setCurrentStep(prev => prev + 1);
    } else {
      setIsSorting(false);
      setPivotIndex(-1);
      setLeftPointer(-1);
      setRightPointer(-1);
      setPartitionSide(null);
    }
  }, [steps, currentStep, setArray, setPivotIndex, setLeftPointer, setRightPointer, setPartitionSide, setCurrentStep, setIsSorting]);

  // useEffect is used to perform side effects in function components.
  // The first useEffect initializes the array when the component mounts.
  useEffect(() => {
    generateArray();
  }, []);

  // The second useEffect handles the sorting steps and auto-play functionality.
  useEffect(() => {
    if (isSorting && isAutoPlay && currentStep < steps.length) {
      const timer = setTimeout(() => {
        handleStep();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length) {
      setIsSorting(false);
      setIsAutoPlay(false);
      setPivotIndex(-1);
      setLeftPointer(-1);
      setRightPointer(-1);
      setPartitionSide(null);
    }
  }, [currentStep, isSorting, isAutoPlay, steps, handleStep]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button onClick={generateArray} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" disabled={isSorting && isAutoPlay}>
          New Array
        </button>
        <button onClick={startSort} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" disabled={isSorting && isAutoPlay}>
          Auto Play
        </button>
        <button onClick={handleStep} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600" disabled={(currentStep >= steps.length && steps.length > 0) || (isSorting && isAutoPlay)}>
          Step
        </button>
      </div>

      <div className="h-64 flex items-end justify-center gap-1">
        {array.map((value, index) => (
          <div key={index} className={`w-8 transition-all duration-300 ${index === pivotIndex ? 'bg-red-500' : index === leftPointer ? 'bg-green-500' : index === rightPointer ? 'bg-blue-500' : 'bg-gray-400'} ${partitionSide === 'left' ? (index < pivotIndex ? 'bg-yellow-300' : '') : partitionSide === 'right' ? (index > pivotIndex ? 'bg-yellow-300' : '') : ''}`} style={{ height: `${value * 2}px` }}>
            <div className="text-xs text-center">{value}</div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        {steps[currentStep - 1]?.message || 'Click "Auto Play" or "Step" to begin'}
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-violet-500"></div>
          <span>Pivot</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600"></div>
          <span>Left Pointer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-600"></div>
          <span>Right Pointer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400"></div>
          <span>Active Partition</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-700"></div>
          <span>Inactive Partition</span>
        </div>
      </div>
    </div>
  );
};

export default UserSpace;
