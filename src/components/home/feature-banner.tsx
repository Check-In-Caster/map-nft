const TextBlock = ({ text }: { text: string }) => {
  return (
    <span className="text-[14px] font-medium mx-4 inline-block">
      <div className="flex items-center space-x-5">
        <img src="/assets/icons/plus.svg" />
        <span>{text}</span>
      </div>
    </span>
  );
};

const text = [
  "CheckIn",
  "Property Owner",
  "Zora Free Mint",
  "Base Onchain Summer",
  "Treasure Hunt",
  "Food PvP",
  "Lotalty Program",
  "Geo Caching",
];

const FeatureBanner = () => {
  return (
    <div className="text-[#000] bg-[#BAE1EB] relative flex overflow-x-hidden">
      <div className="py-4 animate-marquee whitespace-nowrap">
        {text.map((item) => (
          <TextBlock text={item} key={item} />
        ))}
      </div>
      <div className="absolute top-0 py-4 animate-marquee2 whitespace-nowrap">
        {text.map((item) => (
          <TextBlock text={item} key={item} />
        ))}
      </div>
    </div>
  );
};

export default FeatureBanner;
