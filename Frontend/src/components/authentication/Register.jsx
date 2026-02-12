import React, { useEffect } from "react";
import Navbar from "../components_lite/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup } from "../ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";
import { Formik } from "formik";
import * as Yup from "yup";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const validationSchema = Yup.object({
    fullname: Yup.string().min(3).required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6).required("Password is required"),
    pancard: Yup.string()
      .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN number")
      .required("PAN is required"),
    adharcard: Yup.string()
      .matches(/^\d{12}$/, "Aadhar must be 12 digits")
      .required("Aadhar is required"),
    phoneNumber: Yup.string()
      .matches(/^\d{10}$/, "Phone must be 10 digits")
      .required("Phone number is required"),
    role: Yup.string().required("Role is required"),
  });

  const submitHandler = async (values) => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      dispatch(setLoading(true));

      const res = await axios.post(
        "http://localhost:5011/api/user/register",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data.success) {

       toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div>
      <Navbar />

      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <Formik
          initialValues={{
            fullname: "",
            email: "",
            password: "",
            pancard: "",
            adharcard: "",
            phoneNumber: "",
            role: "",
            file: null,
          }}
          validationSchema={validationSchema}
          onSubmit={submitHandler}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            setFieldValue,
          }) => (
            <form
              onSubmit={handleSubmit}
              className="w-1/2 border border-gray-500 rounded-md p-4 my-10"
            >
              <fieldset disabled={loading}>
                <h1 className="font-bold text-xl mb-5 text-center text-blue-600">
                  Register
                </h1>

                {[
                  ["fullname", "Fullname", "John Doe"],
                  ["email", "Email", "johndoe@gmail.com"],
                  ["password", "Password", "********", "password"],
                  ["pancard", "PAN Card Number", "ABCDE1234F"],
                  ["adharcard", "Adhar Card Number", "123456789012"],
                  ["phoneNumber", "Phone Number", "9876543210"],
                ].map(([name, label, placeholder, type = "text"]) => (
                  <div className="my-2" key={name}>
                    <Label>{label}</Label>
                    <Input
                      type={type}
                      name={name}
                      value={values[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                    />
                    {touched[name] && errors[name] && (
                      <p className="text-red-500 text-sm">{errors[name]}</p>
                    )}
                  </div>
                ))}

                <RadioGroup className="flex items-center gap-4 my-5">
                  {["Student", "Recruiter"].map((role) => (
                    <label key={role} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={values.role === role}
                        onChange={handleChange}
                      />
                      {role}
                    </label>
                  ))}
                </RadioGroup>

                {touched.role && errors.role && (
                  <p className="text-red-500 text-sm">{errors.role}</p>
                )}

                <div className="flex items-center gap-2 my-3">
                  <Label>Profile Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFieldValue("file", e.currentTarget.files[0])
                    }
                  />
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={loading}
                className={`block w-full py-3 my-3 text-white rounded-md ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary"
                }`}
              >
                {loading ? "Registering..." : "Register"}
              </button>

              <p className="text-gray-500 text-md my-2">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-700 font-semibold">
                  Login
                </Link>
              </p>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;
