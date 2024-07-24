"use client";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { markFavorite } from "../actions";

const LikeMap = ({ map_id, liked }: { map_id: string; liked?: boolean }) => {
  const likeMap = async () => {
    const response = await markFavorite({
      map_id: map_id,
    });

    if (response.status === "success") {
      toast.success(response.message);
    }

    if (response.status === "error") {
      toast.error(response.message);
    }
  };

  return (
    <button
      onClick={likeMap}
      className={`rounded-full p-2  hover:shadow-md hover:bg-white outline-none focus:outline-none focus-within:outline-none`}
    >
      <Heart className={` ${liked ? "text-red-400" : ""}`} />
    </button>
  );
};

export default LikeMap;
