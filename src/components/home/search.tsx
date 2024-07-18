"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { Properties } from "@/types/property";
import { Search as SearchIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPlaceDetails } from "./actions";

const Search: React.FC<{
  setProperty: (location: Properties[number] & { excluded: boolean }) => void;
}> = ({ setProperty }) => {
  const [inputValue, setInputValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 500);
  const [predictionResults, setPredictionResults] = useState<
    Array<google.maps.places.AutocompletePrediction>
  >([]);
  const [showResults, setShowResults] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  const onInputChange = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      const value = (event.target as HTMLInputElement)?.value;

      setInputValue(value);
    },
    []
  );

  // Fetch predictions on debounced input value change
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      if (!debouncedInputValue) {
        setPredictionResults([]);
        return;
      }

      try {
        const response = await fetch(
          `https://${
            process.env.NODE_ENV === "production" ? "app" : "dev"
          }.checkincaster.xyz/api/maps/autocomplete?q=${debouncedInputValue}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        setPredictionResults(data.predictions);
      } catch {}
    })();

    return () => {
      controller.abort();
    };
  }, [debouncedInputValue]);

  const handleClick = useCallback(
    async (placeId: string) => {
      const details = await getPlaceDetails(placeId);

      if (details) {
        setProperty(details as Properties[number] & { excluded: boolean });

        setInputValue("");
      }
    },
    [setProperty]
  );

  // detect clicks outside and inside group ref and close results accordingly
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        groupRef.current &&
        !groupRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    const handleClickInside = (event: MouseEvent) => {
      if (groupRef.current && groupRef.current.contains(event.target as Node)) {
        setShowResults(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", handleClickInside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleClickInside);
    };
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div className="md:w-3/5 flex gap-x-5" ref={groupRef}>
        <div
          className="flex items-center relative p-1 px-2 text-[16px] border w-full border-gray-900 bg-white cursor-pointer"
          onClick={() => {
            inputRef.current?.focus();
          }}
        >
          <SearchIcon />
          <input
            type="text"
            placeholder="Search location"
            className="ml-2 w-full placeholder:text-[#060707] outline-none"
            value={inputValue}
            onChange={onInputChange}
            ref={inputRef}
          />
          <div
            className={`absolute z-100 bg-white left-0 right-0 top-9 ${
              showResults ? "block" : "hidden"
            }`}
          >
            {inputValue &&
              predictionResults.map((prediction) => (
                <button
                  key={prediction.place_id}
                  className="flex w-full items-center border-b px-3 py-2 text-left text-sm"
                  onClick={() => handleClick(prediction.place_id)}
                >
                  <div>{prediction.description}</div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
