import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import React, { useState } from "react";

const NumberSelector = ({
  label,
  active,
  onClick,
  className,
}: {
  label: number | string;
  active?: boolean;
  onClick: () => void;
  className?: string;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        `border px-5 py-2 text-center w-min cursor-pointer ${
          active ? "bg-[#000] text-white" : ""
        } `,
        className
      )}
    >
      {label}
    </div>
  );
};

const Quantity = ({
  count,
  setCount,
}: {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [option, setOption] = useState("");

  return (
    <>
      <div className="my-5 flex items-center space-x-5">
        <NumberSelector
          label={1}
          active={count === 1}
          onClick={() => {
            setCount(1);
          }}
        />
        <NumberSelector
          label={3}
          active={count === 3}
          onClick={() => {
            setCount(3);
          }}
        />
        <NumberSelector
          label={7}
          active={count === 7}
          onClick={() => {
            setCount(7);
          }}
          className="hidden sm:block"
        />
        <NumberSelector
          label={77}
          active={count === 77}
          onClick={() => {
            setCount(77);
          }}
          className="hidden sm:block"
        />
        <NumberSelector
          label={"Custom"}
          active={option === "custom"}
          onClick={() => {
            if (option === "custom") {
              setOption("");
              return;
            }
            setOption("custom");
          }}
        />
      </div>
      {option === "custom" && (
        <div className="flex justify-center items-center my-4 mb-8">
          <div
            className="flex  cursor-pointer justify-center items-center h-10 w-10 border-2 border-black"
            onClick={() => {
              if (count > 1) {
                setCount(count - 1);
              } else setCount(1);
            }}
          >
            <Minus className="h-6 w-6" strokeWidth={3} />
          </div>
          <input
            type="number"
            value={count}
            min="1"
            max="100"
            maxLength={3}
            onChange={(e) => {
              if (Number(e.target.value) > 100) {
                setCount(100);
                return;
              }
              setCount(Number(e.target.value));
            }}
            className="flex justify-center items-center text-center h-10 w-[150px] outline-none border-2 border-l-0 border-r-0 border-black font-bold text-xl"
          />

          <div
            className="flex cursor-pointer justify-center items-center h-10 w-10 border-2 border-black"
            onClick={() => {
              if (count < 100) {
                setCount(count + 1);
              } else {
                setCount(100);
              }
            }}
          >
            <Plus className="h-6 w-6" strokeWidth={3} />
          </div>
        </div>
      )}
    </>
  );
};

export default Quantity;
