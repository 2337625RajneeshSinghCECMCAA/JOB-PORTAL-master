import React, { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
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
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch Job
  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${JOB_API_ENDPOINT}/get/${jobId}`, {
          withCredentials: true,
        });

        if (res.data.status) {
          dispatch(setSingleJob(res.data.job));

          const alreadyApplied = res.data.job?.applications?.some(
            (application) => application.applicant === user?._id,
          );

          setIsApplied(alreadyApplied);
        }
      } catch (error) {
        toast.error("Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    fetchSingleJob();
  }, [jobId, dispatch, user?._id]);

  // 🔥 Apply Handler
  const applyJobHandler = async () => {
    if (singleJob?.status === "closed") {
      toast.error("This job is closed");
      return;
    }

    try {
      const res = await axios.get(
        `${APPLICATION_API_ENDPOINT}/apply/${jobId}`,
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setIsApplied(true);

        dispatch(
          setSingleJob({
            ...singleJob,
            applications: [...singleJob.applications, { applicant: user?._id }],
          }),
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  if (loading || !singleJob) return <div>Loading...</div>;

  const isClosed = singleJob?.status === "closed";

  return (
    <div className="max-w-7xl mx-auto my-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl">{singleJob?.title}</h1>

          <div className="flex gap-2 items-center mt-4 flex-wrap">
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

            {/* 🔴 Closed Badge */}
            {isClosed && (
              <Badge className="bg-red-500 text-white font-bold">
                Job Closed
              </Badge>
            )}
          </div>
        </div>

        {/* 🔥 Apply Button */}
        <Button
          onClick={!isClosed && !isApplied ? applyJobHandler : null}
          disabled={isClosed || isApplied}
          className={`rounded-lg ${
            isClosed
              ? "bg-gray-500 cursor-not-allowed"
              : isApplied
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-[#6B3AC2] hover:bg-[#552d9b]"
          }`}
        >
          {isClosed ? "Job Closed" : isApplied ? "Already Applied" : "Apply"}
        </Button>
      </div>

      {/* Description */}
      <h1 className="border-b-2 border-b-gray-400 font-medium py-4">
        {singleJob?.description}
      </h1>

      {/* Job Details */}
      <div className="my-4 space-y-2">
        <p>
          <b>Role:</b> {singleJob?.position}
        </p>
        <p>
          <b>Location:</b> {singleJob?.location}
        </p>
        <p>
          <b>Salary:</b> {singleJob?.salary} LPA
        </p>
        <p>
          <b>Experience:</b> {singleJob?.experienceLevel} Year
        </p>
        <p>
          <b>Total Applicants:</b> {singleJob?.applications?.length}
        </p>
        <p>
          <b>Job Type:</b> {singleJob?.jobType}
        </p>
        <p>
          <b>Post Date:</b>{" "}
          {new Date(singleJob?.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* 🔴 Closed Warning Message */}
      {isClosed && (
        <div className="mt-4 p-4 bg-red-100 text-red-600 rounded">
          This job is no longer accepting applications.
        </div>
      )}
    </div>
  );
};

export default Description;
