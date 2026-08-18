import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Upload as UploadIcon, X } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LoadingState from "../components/ui/LoadingState";
import { createArticle, updateArticle, getArticle, togglePublishArticle } from "../services/article";

export default function WriteArticle() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(isEditing);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [article, setArticle] = useState(null);
  
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (!isEditing) return;

    const fetchArticle = async () => {
      try {
        const response = await getArticle(id);
        const fetchedArticle = response.data;
        setArticle(fetchedArticle);
        reset({
          title: fetchedArticle.title,
          excerpt: fetchedArticle.excerpt,
          content: fetchedArticle.content,
        });
        setTags(fetchedArticle.tags || []);
      } catch (error) {
        toast.error("Failed to load article draft");
        navigate("/studio");
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id, reset, navigate, isEditing]);

  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    if (!newTag.trim()) return;
    if (tags.length >= 5) {
      toast.error("Maximum 5 tags allowed");
      return;
    }
    if (tags.includes(newTag.trim())) return;
    
    setTags([...tags, newTag.trim()]);
    setNewTag("");
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const onSubmit = async (data) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      if (data.excerpt) formData.append("excerpt", data.excerpt);
      
      formData.append("tags", tags.join(","));

      if (data.coverImage && data.coverImage.length > 0) {
        formData.append("coverImage", data.coverImage[0]);
      }

      if (isEditing) {
        await updateArticle(id, formData);
        toast.success("Draft updated!");
      } else {
        const response = await createArticle(formData);
        toast.success("Draft saved!");
        navigate(`/article/write/${response.data._id}`, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save draft");
    } finally {
      setUploading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!article) return;
    setPublishing(true);
    try {
      const response = await togglePublishArticle(id);
      setArticle(response.data);
      toast.success(response.data.isPublished ? "Article published!" : "Article unpublished.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change publish status");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <LoadingState message="Loading editor..." />;

  return (
    <div className="odyssey-enter w-full max-w-4xl mx-auto py-6 sm:py-10 pb-20">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-[var(--odyssey-border)] pb-6">
        <div>
          <p className="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-[var(--odyssey-accent)] mb-2">
            {isEditing ? "Edit Draft" : "New Chronicle"}
          </p>
          <h1 className="font-serif text-3xl font-normal text-[var(--odyssey-text)] sm:text-4xl">
            {isEditing ? "Edit Article" : "Write Article"}
          </h1>
        </div>
        {isEditing && (
          <div className="flex items-center gap-3">
            <Button
              variant={article?.isPublished ? "secondary" : "primary"}
              size="sm"
              isLoading={publishing}
              onClick={handlePublishToggle}
            >
              {article?.isPublished ? "Unpublish" : "Publish"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/article/${id}`)}>
              Preview
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <label className="mb-2 block font-sans text-xs font-medium uppercase tracking-wider text-[var(--odyssey-text-secondary)]">Title</label>
          <Input placeholder="Give your article a title..." {...register("title", { required: true })} />
        </div>

        <div>
          <label className="mb-2 block font-sans text-xs font-medium uppercase tracking-wider text-[var(--odyssey-text-secondary)]">Excerpt</label>
          <textarea
            placeholder="A short summary or subtitle (optional)..."
            {...register("excerpt")}
            rows={2}
            className="odyssey-field font-serif text-base"
          />
        </div>

        <div>
           <label className="mb-2 block font-sans text-xs font-medium uppercase tracking-wider text-[var(--odyssey-text-secondary)]">Content</label>
           <textarea
             placeholder="Write your article content here... (Use double line breaks between paragraphs for optimal formatting)"
             {...register("content", { required: true })}
             rows={14}
             className="odyssey-field font-serif text-base leading-relaxed p-4"
           />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 pt-2">
          <div>
            <label className="mb-2 block font-sans text-xs font-medium uppercase tracking-wider text-[var(--odyssey-text-secondary)]">
              Cover Image
            </label>
            <div className="rounded-sm border border-dashed border-[#D6CCBA] bg-[#FAF8F2] p-5 text-center transition-colors hover:border-[#B08D57]">
              <UploadIcon size={20} className="mx-auto mb-2 text-[var(--odyssey-accent)]" strokeWidth={1.5} />
              <input type="file" accept="image/*" {...register("coverImage")} className="odyssey-file-input border-0 bg-transparent p-0 text-center" />
              {isEditing && article?.coverImage && (
                <p className="mt-2 text-xs text-[var(--odyssey-text-muted)] truncate">Current: {article.coverImage.split('/').pop()}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block font-sans text-xs font-medium uppercase tracking-wider text-[var(--odyssey-text-secondary)]">Tags</label>
            <div className="flex gap-2 mb-3">
              <Input 
                placeholder="Add a tag..." 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') handleAddTag(e); }}
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 rounded-sm bg-[#E9E3D5] px-2.5 py-1 text-[11px] font-sans font-medium uppercase tracking-wider text-[#24211D] border border-[#D6CCBA]">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-[#6F6A61] hover:text-[#7A2635] transition-colors"><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--odyssey-border)] flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" size="md" onClick={() => navigate("/studio")}>Cancel</Button>
          <Button type="submit" size="md" isLoading={uploading}>Save Draft</Button>
        </div>
      </form>
    </div>
  );
}
