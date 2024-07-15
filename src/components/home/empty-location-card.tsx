import Link from "next/link";

const placeholderText = [
  "Your quiet walk spot?",
  "Your first date spot?",
  "Your favorite cafe?",
  "Your sunset spot?",
  "Your favorite bookstore?",
  "Your picnic spot?",
  "Your weekend getaway?",
  "Your friends meetup spot?",
  "Your favorite museum/gallery?",
  "Your unwind spot?",
  "Your favorite meal spot?",
  "Your reading spot?",
  "Your dream vacation spot?",
  "Your holiday visit spot?",
  "Your out-of-town guest spot?",
  "Your live music spot?",
  "Your people-watching spot?",
  "Your inspiration spot?",
  "Your childhood favorite spot?",
  "Your school attended?",
  "Your nature spot?",
  "Your breakfast spot?",
  "Your least favorite guest spot?",
];

const EmptyLocationCard = ({ count }: { count: number }) => {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Link
          passHref
          href="/"
          className="bg-white max-h border-2 hover:border-gray-900 cursor-pointer border-dashed h-[290x] grid place-items-center"
          key={i}
          style={{
            minHeight: "416px",
          }}
        >
          {placeholderText[i % placeholderText.length]}
        </Link>
      ))}
    </>
  );
};

export default EmptyLocationCard;
