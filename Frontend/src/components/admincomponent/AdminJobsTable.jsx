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
import { Edit2, Eye, MoreHorizontal, Ban } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { setAllAdminJobs } from "@/redux/jobSlice";

const AdminJobsTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { companies } = useSelector((store) => store.company);
  const { allAdminJobs, searchJobByText } = useSelector((store) => store.job);

  const [filterJobs, setFilterJobs] = useState([]);

  // 🔥 Filter Logic
  useEffect(() => {
    if (!allAdminJobs) return;

    const filtered = allAdminJobs.filter((job) => {
      if (!searchJobByText) return true;

      return (
        job.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
        job?.company?.name
          ?.toLowerCase()
          .includes(searchJobByText.toLowerCase())
      );
    });

    setFilterJobs(filtered);
  }, [allAdminJobs, searchJobByText]);

  // 🔥 Toggle Job Status (Open ↔ Closed)
  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5011/api/job/toggle/${id}`,
        {},
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success(res.data.message);

        // Update Redux without reload
        const updatedJobs = allAdminJobs.map((job) =>
          job._id === id ? res.data.job : job,
        );

        dispatch(setAllAdminJobs(updatedJobs));
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (!companies) return <div>Loading...</div>;

  return (
    <div>
      <Table>
        <TableCaption>Your Recent Posted Jobs</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
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
                No Job Added
              </TableCell>
            </TableRow>
          ) : (
            filterJobs.map((job) => (
              <TableRow key={job._id}>
                <TableCell>{job?.company?.name}</TableCell>

                <TableCell>{job.title}</TableCell>

                {/* ✅ Status Column */}
                <TableCell>
                  {job.status === "closed" ? (
                    <span className="text-red-500 font-medium">Closed</span>
                  ) : (
                    <span className="text-green-600 font-medium">Open</span>
                  )}
                </TableCell>

                <TableCell>
                  {new Date(job.createdAt).toLocaleDateString()}
                </TableCell>

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

                      {/* ✅ Toggle Button */}
                      <div
                        onClick={() => handleToggleStatus(job._id)}
                        className="flex items-center gap-2 cursor-pointer text-red-500"
                      >
                        <Ban className="w-4" />
                        <span>
                          {job.status === "closed" ? "Reopen Job" : "Close Job"}
                        </span>
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
