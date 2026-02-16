import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Bookmark } from "lucide-react";

const Job1 = ({ job }) => {
  const navigate = useNavigate();

  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const diff = currentTime - createdAt;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const isClosed = job?.status === "closed";

  return (
    <div
      className={`p-5 rounded-md shadow-xl border transition-all
        ${
          isClosed
            ? "bg-gray-100 opacity-70 cursor-not-allowed"
            : "bg-white hover:shadow-2xl cursor-pointer"
        }
      `}
    >
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {daysAgoFunction(job?.createdAt) === 0
            ? "Today"
            : `${daysAgoFunction(job?.createdAt)} days ago`}
        </p>

        <Button
          variant="outline"
          className="rounded-full"
          size="icon"
          disabled={isClosed}
        >
          <Bookmark />
        </Button>
      </div>

      {/* Company Info */}
      <div className="flex items-center gap-2 my-2">
        <Avatar>
          <AvatarImage src={job?.company?.logo} />
        </Avatar>

        <div>
          <h1
            onClick={() =>
              !isClosed && navigate(`/company/${job?.company?._id}`)
            }
            className={`font-medium text-lg 
              ${
                isClosed
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:underline cursor-pointer"
              }
            `}
          >
            {job?.company?.name}
          </h1>

          <p className="text-sm text-gray-500">India</p>
        </div>
      </div>

      {/* Job Info */}
      <div>
        <h1 className="font-bold text-lg my-2">{job?.title}</h1>
        <p className="text-sm text-gray-600">{job?.description}</p>
      </div>

      {/* Badges */}
      <div className="flex gap-2 mt-4 flex-wrap">
        <Badge variant="ghost" className="text-blue-700 font-bold">
          {job?.position} Positions
        </Badge>

        <Badge variant="ghost" className="text-[#F83002] font-bold">
          {job?.jobType}
        </Badge>

        <Badge variant="ghost" className="text-[#7209b7] font-bold">
          {job?.salary} LPA
        </Badge>

        {/* 🔴 Closed Badge */}
        {isClosed && (
          <Badge className="bg-red-500 text-white font-bold">Job Closed</Badge>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-4">
        <Button
          variant="outline"
          disabled={isClosed}
          onClick={() => !isClosed && navigate(`/description/${job?._id}`)}
        >
          {isClosed ? "Closed" : "Details"}
        </Button>

        <Button
          className={`${
            isClosed ? "bg-gray-400 cursor-not-allowed" : "bg-[#7209b7]"
          }`}
          disabled={isClosed}
        >
          Save For Later
        </Button>
      </div>
    </div>
  );
};

export default Job1;
