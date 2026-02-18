import { setAllJobs } from "@/redux/jobSlice";
import { JOB_API_ENDPOINT } from "@/utils/data";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllJobs = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { searchedQuery } = useSelector((store) => store.job);

  useEffect(() => {
    const fetchAllJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Add default keyword empty if searchedQuery is undefined
        const keyword = searchedQuery ? searchedQuery : "";
        const res = await axios.get(
          `${JOB_API_ENDPOINT}/get?keyword=${keyword}`,
          {
            withCredentials: true,
          },
        );

        console.log("API Response:", res.data);

        if (res.data.status) {
          dispatch(setAllJobs(res.data.jobs));
        } else {
          setError("Failed to fetch jobs.");
          dispatch(setAllJobs([])); // optional: clear previous jobs
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message || "An error occurred.");
        dispatch(setAllJobs([])); // optional: clear previous jobs
      } finally {
        setLoading(false);
      }
    };

    fetchAllJobs();
  }, [dispatch, searchedQuery]); // ✅ Add searchedQuery to dependencies

  return { loading, error };
};

export default useGetAllJobs;
