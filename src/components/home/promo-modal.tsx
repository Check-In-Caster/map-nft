import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import OSFont from "./os-font";

const PromoModal = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowModal(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  return (
    <Dialog
      open={showModal}
      onOpenChange={(open) => {
        if (!open) {
          setShowModal(false);
        }
      }}
    >
      <DialogContent className="border-0 bg-[#FFF8F0] px-0">
        <div className="flex flex-col items-center justify-center px-6">
          <div className="text-center text-3xl font-bold">
            Support Creators by <br /> minting and sharing MAPs! 🎉
          </div>
          <OSFont
            defaultFont="coolvetica"
            as="p"
            className="mt-5 text-center text-xl text-[#666666]"
          >
            Collect MAP NFTs and support creators! You can also earn a referral
            fee by sharing
          </OSFont>
        </div>

        <div className="relative mt-5 h-[278px] w-full overflow-hidden">
          <div className="absolute flex items-center justify-center gap-x-10">
            <img
              src="/assets/images/modal/3.png"
              className="h-[278px] w-[272px]"
              alt=""
            />
            <img
              src="/assets/images/modal/3.png"
              className="h-[278px] w-[272px]"
              alt=""
            />
            <img
              src="/assets/images/modal/3.png"
              className="h-[278px] w-[272px]"
              alt=""
            />
          </div>
        </div>
        <div className="mt-8 grid place-items-center">
          <button
            className="bg-[#5844C1] px-10 py-2 text-lg text-white "
            onClick={() => setShowModal(false)}
          >
            Get Started!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoModal;
