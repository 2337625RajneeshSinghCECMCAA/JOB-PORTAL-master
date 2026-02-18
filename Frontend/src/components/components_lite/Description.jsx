import React, { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Navbar from "./Navbar";
import { useParams } from "react-router-dom";
import { JOB_API_ENDPOINT, APPLICATION_API_ENDPOINT } from "@/utils/data";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setSingleJob } from "@/redux/jobSlice";
import { toast } from "sonner";

const Description = () => {
  const { id: jobId } = useParams();
  const dispatch = useDispatch();
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);

  const [isApplied, setIsApplied] = useState(false);

  // ✅ Apply Job
  const applyJobHandler = async () => {
    if (!singleJob?.isOpen) {
      toast.error("This job is closed");
      return;
    }

    try {
      const res = await axios.get(
        `${APPLICATION_API_ENDPOINT}/apply/${jobId}`,
        { withCredentials: true },
      );

      if (res.data.success) {
        setIsApplied(true);

        const updatedJob = {
          ...singleJob,
          applications: [...singleJob.applications, { applicant: user?._id }],
        };

        dispatch(setSingleJob(updatedJob));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  // ✅ Fetch Job
  useEffect(() => {
    const fetchSingleJobs = async () => {
      try {
        const res = await axios.get(`${JOB_API_ENDPOINT}/get/${jobId}`, {
          withCredentials: true,
        });

        if (res.data.status) {
          dispatch(setSingleJob(res.data.job));

          const alreadyApplied = res.data.job.applications?.some(
            (application) => application.applicant === user?._id,
          );

          setIsApplied(alreadyApplied);
        }
      } catch (error) {
        toast.error("Failed to fetch job");
      }
    };

    fetchSingleJobs();
  }, [jobId, dispatch, user?._id]);

  if (!singleJob) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    
    <div>
      <Navbar />  
      <div className="max-w-7xl mx-auto my-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl">{singleJob?.title}</h1>

            {/* 🔴 Closed Badge */}
            {!singleJob?.isOpen && (
              <Badge className="bg-red-500 text-white mt-2">Job Closed</Badge>
            )}

            <div className="flex gap-2 items-center mt-4">
              <Badge variant="ghost" className="text-blue-600 font-bold">
                {singleJob?.position} Open Positions
              </Badge>

              <Badge variant="ghost" className="text-[#FA4F09] font-bold">
                {singleJob?.salary} LPA
              </Badge>

              <Badge variant="ghost" className="text-[#6B3AC2] font-bold">
                {singleJob?.location}
              </Badge>

              <Badge variant="ghost" className="text-black font-bold">
                {singleJob?.jobType}
              </Badge>
            </div>
          </div>

          {/* ✅ Apply Button */}
          <div>
            <Button
              onClick={isApplied || !singleJob?.isOpen ? null : applyJobHandler}
              disabled={isApplied || !singleJob?.isOpen}
              className={`rounded-lg ${
                isApplied || !singleJob?.isOpen
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-[#6B3AC2] hover:bg-[#552d9b]"
              }`}
            >
              {isApplied
                ? "Already Applied"
                : !singleJob?.isOpen
                  ? "Job Closed"
                  : "Apply"}
            </Button>
          </div>
        </div>

        <h1 className="border-b-2 border-b-gray-400 font-medium py-4 mt-4">
          {singleJob?.description}
        </h1>

        <div className="my-4">
          <h1 className="font-bold my-1">
            Role:
            <span className="pl-4 font-normal text-gray-800">
              {singleJob?.position}
            </span>
          </h1>

          <h1 className="font-bold my-1">
            Location:
            <span className="pl-4 font-normal text-gray-800">
              {singleJob?.location}
            </span>
          </h1>

          <h1 className="font-bold my-1">
            Salary:
            <span className="pl-4 font-normal text-gray-800">
              {singleJob?.salary} LPA
            </span>
          </h1>

          <h1 className="font-bold my-1">
            Experience:
            <span className="pl-4 font-normal text-gray-800">
              {singleJob?.experienceLevel} Year
            </span>
          </h1>

          <h1 className="font-bold my-1">
            Total Applicants:
            <span className="pl-4 font-normal text-gray-800">
              {singleJob?.applications?.length}
            </span>
          </h1>

          <h1 className="font-bold my-1">
            Post Date:
            <span className="pl-4 font-normal text-gray-800">
              {singleJob?.createdAt?.split("T")[0]}
            </span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Description;
