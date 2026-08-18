import { useState, useRef } from "react";
import { X, Camera, Image as ImageIcon, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Avatar from "../ui/Avatar";
import { updateUser } from "../../store/authSlice";
import {
  updateAccountDetails,
  updateUserAvatar,
  updateCoverImage,
  changeCurrentPassword,
} from "../../services/user";

export default function EditProfileModal({ isOpen, onClose, user, onProfileUpdated }) {
  const dispatch = useDispatch();
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState("info"); // "info" | "media" | "security"

  // Form states
  const [fullname, setFullname] = useState(user?.fullname || "");
  const [email, setEmail] = useState(user?.email || "");

  // Media states
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  const [coverPreview, setCoverPreview] = useState(user?.coverimage || "");
  const [coverFile, setCoverFile] = useState(null);
  const [updatingCover, setUpdatingCover] = useState(false);

  // Security states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [savingInfo, setSavingInfo] = useState(false);

  if (!isOpen) return null;

  // Handle Info Submit
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!fullname.trim() && !email.trim()) {
      toast.error("Full name or email is required");
      return;
    }

    setSavingInfo(true);
    try {
      const res = await updateAccountDetails({
        fullname: fullname.trim(),
        email: email.trim(),
      });
      const updatedUser = res.data.user;
      dispatch(updateUser(updatedUser));
      if (onProfileUpdated) onProfileUpdated(updatedUser);
      toast.success("Profile details updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile details");
    } finally {
      setSavingInfo(false);
    }
  };

  // Handle Avatar Selection & Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    setUpdatingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const res = await updateUserAvatar(formData);
      const updatedUser = res.data.user;
      dispatch(updateUser(updatedUser));
      if (onProfileUpdated) onProfileUpdated(updatedUser);
      toast.success("Avatar image updated!");
      setAvatarFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update avatar");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  // Handle Cover Selection & Upload
  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadCover = async () => {
    if (!coverFile) return;
    setUpdatingCover(true);
    try {
      const formData = new FormData();
      formData.append("coverimage", coverFile);
      const res = await updateCoverImage(formData);
      const updatedUser = res.data.user;
      dispatch(updateUser(updatedUser));
      if (onProfileUpdated) onProfileUpdated(updatedUser);
      toast.success("Cover image updated!");
      setCoverFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update cover image");
    } finally {
      setUpdatingCover(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error("Current password is required");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      await changeCurrentPassword({ oldPassword, newPassword });
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#24211D]/65 backdrop-blur-xs odyssey-enter">
      <div className="relative w-full max-w-2xl bg-[#FAF8F2] border border-[#D6CCBA] rounded-xs shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#D6CCBA] bg-[#E9E3D5]/40">
          <div>
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#7A2635] mb-0.5">Account Settings</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#24211D] font-medium tracking-tight">Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6F6A61] hover:text-[#7A2635] hover:bg-[#E9E3D5] rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-[#D6CCBA] px-6 sm:px-8 bg-[#FAF8F2] gap-4 sm:gap-8">
          <button
            onClick={() => setActiveSection("info")}
            className={`py-4 px-2 text-xs font-sans font-semibold uppercase tracking-[0.15em] border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === "info"
                ? "border-[#7A2635] text-[#7A2635]"
                : "border-transparent text-[#6F6A61] hover:text-[#24211D]"
            }`}
          >
            <User size={15} /> Personal Details
          </button>
          <button
            onClick={() => setActiveSection("media")}
            className={`py-4 px-2 text-xs font-sans font-semibold uppercase tracking-[0.15em] border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === "media"
                ? "border-[#7A2635] text-[#7A2635]"
                : "border-transparent text-[#6F6A61] hover:text-[#24211D]"
            }`}
          >
            <Camera size={15} /> Avatar & Cover
          </button>
          <button
            onClick={() => setActiveSection("security")}
            className={`py-4 px-2 text-xs font-sans font-semibold uppercase tracking-[0.15em] border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === "security"
                ? "border-[#7A2635] text-[#7A2635]"
                : "border-transparent text-[#6F6A61] hover:text-[#24211D]"
            }`}
          >
            <Lock size={15} /> Security
          </button>
        </div>

        {/* Body Content with Spaced Subsections */}
        <div className="p-8 sm:p-10 overflow-y-auto flex-1 bg-[#FAF8F2]">
          {/* Section 1: Personal Details */}
          {activeSection === "info" && (
            <form onSubmit={handleSaveInfo} className="py-2">
              <div className="mb-7">
                <label className="block text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-[#7A2635] mb-2.5">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-white border-[#D6CCBA]"
                />
              </div>

              <div className="mb-7">
                <label className="block text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-[#7A2635] mb-2.5">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-white border-[#D6CCBA]"
                />
              </div>

              <div className="mb-9">
                <label className="block text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-[#6F6A61] mb-2.5">
                  Username (Read-Only)
                </label>
                <Input type="text" value={`@${user?.username}`} disabled className="opacity-60 cursor-not-allowed bg-[#E9E3D5]/50 border-[#D6CCBA]" />
              </div>

              <div className="pt-6 flex justify-end gap-4 border-t border-[#D6CCBA]">
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={savingInfo}>
                  Save Details
                </Button>
              </div>
            </form>
          )}

          {/* Section 2: Avatar & Cover Media */}
          {activeSection === "media" && (
            <div className="py-2 space-y-8">
              {/* Avatar Subsection */}
              <div className="border border-[#D6CCBA] rounded-xs p-6 bg-white shadow-xs mb-8">
                <h3 className="font-serif text-xl text-[#24211D] mb-4 flex items-center gap-2">
                  <Camera size={18} className="text-[#7A2635]" /> Profile Avatar
                </h3>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="relative group shrink-0">
                    <Avatar src={avatarPreview} name={fullname || user?.username} size="2xl" className="ring-4 ring-[#E9E3D5]" />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera size={22} />
                    </button>
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <p className="text-xs text-[#6F6A61] font-sans leading-relaxed">
                      Select a square image file (PNG or JPG format). Recommended minimum size 400x400.
                    </p>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        Choose Avatar
                      </Button>
                      {avatarFile && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          isLoading={updatingAvatar}
                          onClick={handleUploadAvatar}
                        >
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Image Subsection */}
              <div className="border border-[#D6CCBA] rounded-xs p-6 bg-white shadow-xs">
                <h3 className="font-serif text-xl text-[#24211D] mb-4 flex items-center gap-2">
                  <ImageIcon size={18} className="text-[#7A2635]" /> Banner Cover Image
                </h3>
                <div className="space-y-4">
                  <div className="relative aspect-[3/1] w-full bg-[#E9E3D5] rounded-xs overflow-hidden border border-[#D6CCBA]">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#6F6A61] font-serif italic">
                        [ No Cover Image Set ]
                      </div>
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-[#6F6A61] font-sans">High resolution horizontal image (1200x400 suggested).</p>
                    <div className="flex items-center gap-3 shrink-0">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        Choose Banner
                      </Button>
                      {coverFile && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          isLoading={updatingCover}
                          onClick={handleUploadCover}
                        >
                          Upload Banner
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* Section 3: Security */}
          {activeSection === "security" && (
            <form onSubmit={handleChangePassword} className="py-2">
              <div className="mb-7">
                <label className="block text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-[#7A2635] mb-2.5">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white border-[#D6CCBA]"
                />
              </div>

              <div className="mb-7">
                <label className="block text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-[#7A2635] mb-2.5">
                  New Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="bg-white border-[#D6CCBA]"
                />
              </div>

              <div className="mb-9">
                <label className="block text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-[#7A2635] mb-2.5">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="bg-white border-[#D6CCBA]"
                />
              </div>

              <div className="pt-6 flex justify-end gap-4 border-t border-[#D6CCBA]">
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={updatingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
