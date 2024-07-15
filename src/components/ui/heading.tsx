const Heading = ({
  label,
  className,
  children,
}: {
  label?: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`flex justify-center items-center my-16 ${className}`}>
      <h1 className="text-black relative text-2xl font-bold bg-[#d8b4fe] px-8 py-3 border border-black  w-[315px] h-20 grid place-content-center rounded-[50%] ">
        <span className="relative" style={{ width: "max-content" }}>
          {label || children}
        </span>
      </h1>
    </div>
  );
};

export default Heading;
