import { useState } from "react";
import { useForm } from "react-hook-form";
import { Upload as UploadIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { uploadVideo } from "../services/video";

export default function Upload() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const onSubmit = async (data) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("videoFile", data.videoFile[0]);
      formData.append("thumbnail", data.thumbnail[0]);

      await uploadVideo(formData);
      toast.success("Story uploaded!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="odyssey-enter w-full max-w-2xl mx-auto py-6 sm:py-10 pb-16">
      <div className="mb-10 text-center border-b border-[var(--odyssey-border)] pb-8">
        <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-[var(--odyssey-warm)] mb-4">
          New chapter
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl tracking-wide text-[var(--odyssey-text)] mb-3">
          Upload Story
        </h1>
        <p className="font-serif italic text-lg text-[var(--odyssey-text-muted)]">
          Add a new entry to your archive.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Title */}
        <div>
          <label className="mb-2 block text-[11px] font-sans font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)]">Title</label>
          <Input placeholder="Give your story a title" {...register("title")} />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-[11px] font-sans font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)]">Description</label>
          <textarea
            placeholder="What is this story about?"
            {...register("description")}
            rows={4}
            className="odyssey-field"
          />
        </div>

        {/* Files */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-[11px] font-sans font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)]">
              Video file
            </label>
            <div className="rounded border border-dashed border-[var(--odyssey-border-strong)] bg-[var(--odyssey-surface)] p-6 text-center">
              <UploadIcon size={20} className="mx-auto mb-2 text-[var(--odyssey-text-muted)]" strokeWidth={1.25} />
              <input type="file" accept="video/*" {...register("videoFile")} className="odyssey-file-input border-0 bg-transparent p-0 text-center" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-sans font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)]">
              Thumbnail
            </label>
            <div className="rounded border border-dashed border-[var(--odyssey-border-strong)] bg-[var(--odyssey-surface)] p-6 text-center">
              <UploadIcon size={20} className="mx-auto mb-2 text-[var(--odyssey-text-muted)]" strokeWidth={1.25} />
              <input type="file" accept="image/*" {...register("thumbnail")} className="odyssey-file-input border-0 bg-transparent p-0 text-center" />
            </div>
          </div>
        </div>

        {/* Upload progress indicator */}
        {uploading && (
          <div className="rounded-md bg-[var(--odyssey-accent-subtle)] px-4 py-3">
            <p className="text-xs font-medium text-[var(--odyssey-accent)]">Uploading your story... This may take a moment.</p>
          </div>
        )}

        <div className="pt-6 border-t border-[var(--odyssey-border)] flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" size="md" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" size="md" isLoading={uploading}>Upload Story</Button>
        </div>
      </form>
    </div>
  );
}
