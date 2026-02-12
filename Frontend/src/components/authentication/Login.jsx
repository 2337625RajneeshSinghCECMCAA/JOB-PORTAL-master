import React, { useEffect } from "react";
import Navbar from "../components_lite/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useNavigate, Link } from "react-router-dom";
import { RadioGroup } from "../ui/radio-group";
import axios from "axios";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/data.js";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import { Formik } from "formik";
import * as Yup from "yup";
import { useSearchParams } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "invalid") {
      toast.error("Invalid or expired verification token");
    } else if (status === "already_verified") {
      toast.info("Email already verified");
    } else if (status === "verified") {
      toast.success("Email verified successfully");
    } else if (status === "error") {
      toast.error("Error verifying email");
    }
  }, [searchParams]);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
    role: Yup.string().required("Role is required"),
  });

  const submitHandler = async (values) => {
    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_ENDPOINT}/login`, values, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error("Login failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <Formik
          initialValues={{ email: "", password: "", role: "" }}
          validationSchema={validationSchema}
          onSubmit={submitHandler}
        >
          {({ values, errors, touched, handleChange, handleSubmit }) => (
            <form
              onSubmit={handleSubmit}
              className="w-1/2 border border-gray-500 rounded-md p-4 my-10"
            >
              <h1 className="font-bold text-xl mb-5 text-center text-blue-600">
                Login
              </h1>

              <div className="my-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="johndoe@gmail.com"
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="my-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  placeholder="********"
                />
                {touched.password && errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <RadioGroup className="flex items-center gap-4 my-5">
                {["Student", "Recruiter"].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Input
                      type="radio"
                      name="role"
                      value={role}
                      checked={values.role === role}
                      onChange={handleChange}
                      className="cursor-pointer"
                    />
                    <Label>{role}</Label>
                  </div>
                ))}
              </RadioGroup>
              {touched.role && errors.role && (
                <p className="text-red-500 text-sm">{errors.role}</p>
              )}

              {loading ? (
                <div className="flex items-center justify-center my-10">
                  Loading...
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-3/4 py-3 my-3 text-white flex items-center justify-center max-w-7xl mx-auto bg-blue-600 hover:bg-blue-800/90 rounded-md"
                >
                  Login
                </button>
              )}

              <p className="text-gray-700 text-center my-2">
                Create new Account
              </p>

              <Link to="/register">
                <button
                  type="button"
                  className="w-1/2 py-3 my-3 text-white flex items-center justify-center max-w-7xl mx-auto bg-green-600 hover:bg-green-800/90 rounded-md"
                >
                  Register
                </button>
              </Link>

              <Link
                to="/forgot-password"
                style={{
                  fontWeight: "bold",
                  color: "#083b8c",
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </Link>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
