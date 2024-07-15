"use client";

const Tabs = ({
  tabs,
  className,
  onChange,
  active,
}: {
  className?: string;
  tabs: string[];
  onChange: (data: string) => void;
  active: string;
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {tabs.map((tab) => (
        <button
          onClick={() => onChange(tab)}
          className={` ${
            active === tab ? "border-purple-600 border-b-2" : ""
          } font-bold mr-10`}
          key={tab}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
