import React from "react";
import JobCards from "./JobCards";
import { useSelector } from "react-redux";

const LatestJobs = () => {
  const allJobs = useSelector((state) => state.jobs?.allJobs || []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center sm:text-left">
        <span className="text-[#6A38C2]">Latest & Top </span>
        Job Openings
      </h2>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {allJobs.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            No Job Available
          </div>
        ) : (
          allJobs
            .slice(0, 6)
            .map((job) =>
              job?._id ? <JobCards key={job._id} job={job} /> : null,
            )
        )}
      </div>
    </div>
  );
};

export default LatestJobs;
