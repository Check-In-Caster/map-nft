import Link from "next/link";
import Heading from "../ui/heading";

const HowItWorks = () => {
  return (
    <div className="mt-8 max-w-7xl mx-auto mb-8 p-2 md:p-0">
      <div className="text-center my-10">
        <Heading label="How it works for MAP creators" />
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="flex items-center justify-between flex-col">
          <img
            src="/assets/images/how_it_works1.png"
            className="w-[278px] h-[206px]"
            alt=""
          />
          <p className="text-xl line-clamp-2 mt-3">1. Curate your recos</p>
        </div>
        <div className="grid place-items-center">
          <img
            src="/assets/images/how_it_works2.png"
            className="w-[272px] h-[278px]"
            alt=""
          />
          <p className="text-xl line-clamp-2 mt-3">2. Publish MAPs</p>
        </div>
        <div className="grid place-items-center">
          <img
            src="/assets/images/how_it_works3.png"
            className="w-[272px] h-[278px]"
            alt=""
          />
          <p className="text-xl line-clamp-2 mt-3">3. Share and Earn</p>
        </div>
      </div>
      <div className="text-center mt-10">
        <Link
          href="/maps/create"
          className="bg-[#0067D9] text-white mt-7 text-lg px-6 py-2 tracking-wider"
        >
          Create your maps
        </Link>
      </div>
    </div>
  );
};

export default HowItWorks;
