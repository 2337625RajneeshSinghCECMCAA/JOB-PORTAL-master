import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, Eye, MoreHorizontal } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { JOB_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import { setAllAdminJobs } from "@/redux/jobSlice";

const AdminJobsTable = () => {
  const { allAdminJobs, searchJobByText } = useSelector((store) => store.job);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [filterJobs, setFilterJobs] = useState([]);

  // 🔹 Filter jobs based on search text
  useEffect(() => {
    const filteredJobs = allAdminJobs.filter((job) => {
      if (!searchJobByText) return true;

      return (
        job.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
        job?.company?.name
          ?.toLowerCase()
          .includes(searchJobByText.toLowerCase())
      );
    });

    setFilterJobs(filteredJobs);
  }, [allAdminJobs, searchJobByText]);

  // 🔹 Toggle Job Status (Open/Closed)
  const handleToggle = async (id) => {
    try {
      const res = await axios.patch(
        `${JOB_API_ENDPOINT}/status/${id}`,
        {},
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success(res.data.message);

        // Merge previous company object to avoid losing it
        const updatedJobs = allAdminJobs.map((job) => {
          if (job._id === id) {
            return {
              ...res.data.job,
              company: job.company, // keep previous company object
            };
          }
          return job;
        });

        dispatch(setAllAdminJobs(updatedJobs));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <Table>
        <TableCaption>Your Recent Posted Jobs</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filterJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No Jobs Found
              </TableCell>
            </TableRow>
          ) : (
            filterJobs.map((job) => (
              <TableRow key={job._id}>
                <TableCell>{job?.company?.name || "N/A"}</TableCell>
                <TableCell>{job.title}</TableCell>

                {/* Status */}
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      job.isOpen ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {job.isOpen ? "Open" : "Closed"}
                  </span>
                </TableCell>

                <TableCell>{job.createdAt.split("T")[0]}</TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <Popover>
                    <PopoverTrigger>
                      <MoreHorizontal className="cursor-pointer" />
                    </PopoverTrigger>

                    <PopoverContent className="w-40">
                      <div
                        onClick={() => navigate(`/admin/companies/${job._id}`)}
                        className="flex items-center gap-2 cursor-pointer mb-2"
                      >
                        <Edit2 className="w-4" />
                        <span>Edit</span>
                      </div>

                      <div
                        onClick={() =>
                          navigate(`/admin/jobs/${job._id}/applicants`)
                        }
                        className="flex items-center gap-2 cursor-pointer mb-2"
                      >
                        <Eye className="w-4" />
                        <span>Applicants</span>
                      </div>

                      <div
                        onClick={() => handleToggle(job._id)}
                        className="cursor-pointer text-red-600"
                      >
                        {job.isOpen ? "Close Job" : "Open Job"}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminJobsTable;
