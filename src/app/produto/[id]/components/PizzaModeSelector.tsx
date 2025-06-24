"use client";

import { Button } from "@/components/ui/button";
import OptionsTitle from "./OptionsTitle";

interface PizzaModeSelectorProps {
  isHalfHalfMode: boolean;
  onSelectMode: (isHalfHalf: boolean) => void;
}

const PizzaModeSelector = ({
  isHalfHalfMode,
  onSelectMode,
}: PizzaModeSelectorProps) => {
  return (
    <>
      <OptionsTitle title="Como você quer sua pizza?" />
      <div className="flex gap-2 justify-stretch p-4">
        <Button
          variant={!isHalfHalfMode ? "default" : "outline"}
          onClick={() => onSelectMode(false)}
          className="flex-1"
        >
          Inteira
        </Button>
        <Button
          variant={isHalfHalfMode ? "default" : "outline"}
          onClick={() => onSelectMode(true)}
          className="flex-1"
        >
          Meio a Meio
        </Button>
      </div>
    </>
  );
};

export default PizzaModeSelector;
