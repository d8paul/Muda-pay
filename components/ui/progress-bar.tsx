import { useEffect, useState } from "react";

interface ProgressBarProps {
  isLoading: boolean;
}

const ProgressBar = ({ isLoading }: ProgressBarProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: number;
    let timeout: number;

    if (isLoading) {
      setProgress(0);
      
      interval = window.setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(interval);
            return prevProgress;
          }
          return prevProgress + (90 - prevProgress) * 0.1;
        });
      }, 100);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setProgress((prev) => {
        if (prev > 0) {
          return 100;
        }
        return 0;
      });
      
      timeout = window.setTimeout(() => {
        setProgress(0);
      }, 600);
      
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [isLoading]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50">
      <div
        className="h-full bg-blue-600 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;