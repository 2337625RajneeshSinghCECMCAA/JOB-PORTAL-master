import React from "react";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";

const JobCards = ({ job }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/description/${job._id}`)}
      className="p-4 sm:p-5 rounded-xl shadow-md bg-white border border-gray-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
    >
      {/* Company Info */}
      <div>
        <h1 className="text-base sm:text-lg font-semibold truncate">
          {job?.company?.name || job?.name}
        </h1>

        <p className="text-xs sm:text-sm text-gray-500">
          {job?.location || "India"}
        </p>
      </div>

      {/* Job Info */}
      <div className="mt-3 flex-1">
        <h2 className="font-bold text-lg sm:text-xl line-clamp-1">
          {job?.title}
        </h2>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {job?.description}
        </p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Badge
          className="text-blue-600 font-semibold text-xs sm:text-sm"
          variant="ghost"
        >
          {job?.position} Positions
        </Badge>

        <Badge
          className="text-[#FA4F09] font-semibold text-xs sm:text-sm"
          variant="ghost"
        >
          {job?.salary} LPA
        </Badge>

        <Badge
          className="text-[#6B3AC2] font-semibold text-xs sm:text-sm"
          variant="ghost"
        >
          {job?.jobType}
        </Badge>
      </div>
    </div>
  );
};

export default JobCards;
