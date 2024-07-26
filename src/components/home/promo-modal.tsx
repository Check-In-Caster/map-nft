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
      <DialogContent className="px-0 border-0 bg-[#FFF8F0]">
        <div className="flex flex-col items-center justify-center px-6">
          <div className="text-3xl font-bold text-center">
            Support Creators by <br /> minting and sharing MAPs! 🎉
          </div>
          <OSFont
            defaultFont="coolvetica"
            as="p"
            className="text-[#666666] text-xl text-center mt-5"
          >
            Collect MAP NFTs and support creators! You can earn referral fee by
            sharing it.
          </OSFont>
        </div>

        <div className="mt-5 relative h-[278px] w-full overflow-hidden">
          <div className="absolute flex items-center justify-center gap-x-10">
            <img
              src="/assets/images/modal/3.png"
              className="w-[272px] h-[278px]"
              alt=""
            />
            <img
              src="/assets/images/modal/3.png"
              className="w-[272px] h-[278px]"
              alt=""
            />
            <img
              src="/assets/images/modal/3.png"
              className="w-[272px] h-[278px]"
              alt=""
            />
          </div>
        </div>
        <div className="grid place-items-center mt-8">
          <button
            className="bg-[#5844C1] text-white px-10 py-2 text-lg "
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
