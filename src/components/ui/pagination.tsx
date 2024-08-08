"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const Pagination = ({ totalMaps }: { totalMaps: number }) => {
  const [page, setPage] = useState(1);
  const limit = 12;
  const router = useRouter();

  const totalPages = Math.ceil(totalMaps / limit);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      router.push(`/maps/?page=${page + 1}`);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      router.push(`/maps/?page=${page - 1}`);
    }
  };

  return (
    <div className="flex justify-between mt-8 mx-auto w-[400px] items-center">
      <button
        onClick={handlePreviousPage}
        disabled={page === 1}
        className="bg-gray-300 p-2 rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        onClick={handleNextPage}
        disabled={page === totalPages}
        className="bg-gray-300 p-2 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
