const TextBlock = () => {
  return (
    <div className="text-[14px] font-medium mx-4 inline-block">
      <div className="flex items-center space-x-5">
        <img src="/assets/icons/banner_icon.svg" />
        <span>Onchain Property</span>
      </div>
    </div>
  );
};

const FreeOnChainBanner = () => {
  return (
    <div className="text-[#000] bg-white relative flex overflow-x-hidden">
      <div className="py-4 animate-marquee whitespace-nowrap">
        <TextBlock />
        <TextBlock />
        <TextBlock />
        <TextBlock />
        <TextBlock />
        <TextBlock />
      </div>
      <div className="absolute top-0 py-4 animate-marquee2 whitespace-nowrap">
        <TextBlock />
        <TextBlock />
        <TextBlock />
        <TextBlock />
        <TextBlock />
        <TextBlock />
      </div>
    </div>
  );
};

export default FreeOnChainBanner;
