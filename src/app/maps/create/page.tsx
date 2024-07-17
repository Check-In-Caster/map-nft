import { getMapsToken } from "@/components/home/actions";
import MapForm from "./MapForm";

const Page = async () => {
  const mapToken = await getMapsToken();
  return <MapForm mapToken={mapToken} />;
};

export default Page;
