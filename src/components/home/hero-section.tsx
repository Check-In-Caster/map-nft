import Image from "next/image";
import Link from "next/link";

const HeroSection: React.FC = () => {
  return (
    <>
      <div className="p-2 md:p-0">
        <div className="mt-8 flex p-2 w-full max-w-7xl items-center justify-between mx-auto border border-gray-900 mb-8 relative">
          <div className="grid place-items-center w-full h-full my-20 z-10">
            <h1 className="text-center">
              <span className="text-[#5844C1] text-6xl block">MAPs</span>
              <span className="text-2xl">
                Curate, Mint, Earn. Your Recommendations, onchain.
              </span>
            </h1>
            <Link
              href="/maps/create"
              className="bg-[#0067D9] text-white mt-7 text-lg px-6 py-2 tracking-wider"
            >
              Create your maps
            </Link>
          </div>
          <div className="absolute inset-0">
            <Image
              src="/assets/images/header.png"
              alt=""
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[rgba(255,255,255,0.9)]"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
