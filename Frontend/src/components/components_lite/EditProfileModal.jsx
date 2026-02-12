import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/data";
import { setUser } from "@/redux/authSlice";
import { Loader2, FileText } from "lucide-react";

const EditProfileModal = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    bio: "",
    skills: "",
    file: null,
  });

  /* ---------------- LOAD USER DATA ---------------- */

  useEffect(() => {
    if (user && open) {
      setInput({
        fullname: user.fullname || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        bio: user.profile?.bio || "",
        skills: user.profile?.skills?.join(", ") || "",
        file: null,
      });
      setIsDirty(false);
    }
  }, [user, open]);

  /* ---------------- CHANGE HANDLER ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleFile = (e) => {
    setInput((prev) => ({ ...prev, file: e.target.files[0] }));
    setIsDirty(true);
  };

  /* ---------------- SUBMIT ---------------- */

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!isDirty) {
      toast.info("No changes made");
      return;
    }

    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("bio", input.bio);
    formData.append("skills", input.skills);

    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${USER_API_ENDPOINT}/profile/update`,
        formData,
        { withCredentials: true },
      );

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success("Profile updated");
        setOpen(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const resumeUrl = user?.profile?.resume;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={submitHandler} className="space-y-4">
          <Field
            label="Name"
            name="fullname"
            value={input.fullname}
            onChange={handleChange}
            disabled={loading}
          />
          <Field label="Email" value={input.email} disabled />
          <Field
            label="Phone"
            name="phoneNumber"
            value={input.phoneNumber}
            onChange={handleChange}
            disabled={loading}
          />
          <Field
            label="Bio"
            name="bio"
            value={input.bio}
            onChange={handleChange}
            disabled={loading}
          />
          <Field
            label="Skills"
            name="skills"
            value={input.skills}
            onChange={handleChange}
            placeholder="React, Node, MongoDB"
            disabled={loading}
          />

          {/* ---------------- EXISTING RESUME DISPLAY ---------------- */}
          {resumeUrl && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Current</Label>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-3 flex items-center gap-2 text-blue-600 hover:underline"
              >
                <FileText size={18} />
                View uploaded resume
              </a>
            </div>
          )}

          {/* ---------------- UPLOAD NEW ---------------- */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Replace</Label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFile}
              disabled={loading}
              className="col-span-3 border rounded-md p-2"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isDirty}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/* ---------------- INPUT FIELD ---------------- */

const Field = ({ label, name, value, onChange, placeholder, disabled }) => (
  <div className="grid grid-cols-4 items-center gap-4">
    <Label className="text-right">{label}</Label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="col-span-3 border rounded-md p-2 disabled:bg-gray-100"
    />
  </div>
);

export default EditProfileModal;
