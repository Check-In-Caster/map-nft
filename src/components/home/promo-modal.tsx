import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

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
      <DialogContent className="px-0">
        <div className="flex flex-col items-center justify-center px-6">
          <div className="text-3xl font-bold text-center">
            Support Creators by <br /> minting and sharing MAPs! 🎉
          </div>
          <p className="text-[#666666] text-xl text-center mt-5">
            Collect MAP NFTs and support creators! You can earn referral fee by
            sharing it.
          </p>
        </div>

        <div className="mt-5 relative h-[278px] w-full overflow-hidden">
          <div className="absolute flex items-center justify-center gap-x-10">
            <img
              src="/assets/images/how_it_works3.png"
              className="w-[272px] h-[278px]"
              alt=""
            />
            <img
              src="/assets/images/how_it_works3.png"
              className="w-[272px] h-[278px]"
              alt=""
            />
            <img
              src="/assets/images/how_it_works3.png"
              className="w-[272px] h-[278px]"
              alt=""
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoModal;
