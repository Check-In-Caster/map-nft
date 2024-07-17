import Image from "next/image";

const Footer = () => {
  return (
    <div className="p-2 md:p-0 mt-32">
      <div className="relative max-w-7xl mx-auto">
        <footer className="my-10 p-2 grid space-y-8 place-items-center items-center w-full max-w-7xl py-24 mx-auto border border-gray-900 relative z-10">
          <img
            src="/assets/images/footer-logo.svg"
            alt=""
            className="max-w-[300px]"
          />

          <a
            href="https://app.checkincaster.xyz/"
            target="_blank"
            rel="noreferrer"
            className="border border-gray-900 px-8 py-2 text-[#000] bg-[#EF9854]"
          >
            Checkin Now!
          </a>
        </footer>

        <div className="absolute inset-0">
          <Image
            src="/assets/images/footer.png"
            alt=""
            fill
            className="object-left-bottom object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Footer;
