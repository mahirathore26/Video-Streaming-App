import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Library, Plus } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Input from "../components/ui/Input";
import LoadingState from "../components/ui/LoadingState";
import {
  createPlaylist,
  deletePlaylist,
  getPlaylists,
  updatePlaylist,
} from "../services/playlist";

function CollectionCard({ playlist, onEdit, onDelete, loadingDelete, editingId, editForm, setEditForm, loadingEdit, onSaveEdit, onCancelEdit, onClick }) {
  const itemCount = (playlist.videos?.length || 0) + (playlist.articles?.length || 0);

  /* Try to extract up to 4 thumbnails/covers from the combined array (if populated) */
  const thumbs = [
    ...(playlist.videos || []).filter(v => typeof v === "object" && v?.thumbnail).map(v => v.thumbnail),
    ...(playlist.articles || []).filter(a => typeof a === "object" && a?.coverImage).map(a => a.coverImage)
  ].slice(0, 4);

  const isEditing = editingId === playlist._id;

  return (
    <div
      className={`group cursor-pointer rounded-lg overflow-hidden transition-colors duration-150 ${isEditing ? "" : "hover:bg-[var(--odyssey-surface-soft)]"}`}
      onClick={() => !isEditing && onClick()}
    >
      {/* Visual mosaic */}
      <div className="aspect-[16/10] w-full overflow-hidden rounded-md bg-[var(--odyssey-surface-elevated)] relative">
        {thumbs.length >= 4 ? (
          <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
            {thumbs.map((src, i) => (
              <img key={i} src={src} alt="" className="h-full w-full object-cover" />
            ))}
          </div>
        ) : thumbs.length > 0 ? (
          <img src={thumbs[0]} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Library size={24} className="text-[var(--odyssey-text-muted)]" strokeWidth={1.25} />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {isEditing ? (
        <div className="p-3 space-y-2" onClick={(e) => e.stopPropagation()}>
          <Input
            value={editForm.name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Collection name"
          />
          <textarea
            rows={2}
            value={editForm.description}
            onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
            className="odyssey-field text-sm"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" isLoading={loadingEdit === playlist._id} onClick={(e) => onSaveEdit(e, playlist._id)}>Save</Button>
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onCancelEdit(); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="px-1 pt-4 pb-2">
          <h2 className="truncate font-serif text-[19px] leading-snug text-[var(--odyssey-text)] group-hover:text-[var(--odyssey-accent)]">{playlist.name}</h2>
          <p className="mt-1 font-sans text-[11px] uppercase tracking-wider font-medium text-[var(--odyssey-text-muted)]">{itemCount} {itemCount === 1 ? "item" : "items"}</p>

          {/* Actions */}
          <div className="mt-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(); }}>Edit</Button>
            <Button size="sm" variant="ghost" className="hover:!text-[var(--odyssey-danger)]" isLoading={loadingDelete === playlist._id} onClick={(e) => { e.stopPropagation(); onDelete(e); }}>Delete</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Collections() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [loadingEdit, setLoadingEdit] = useState(null);

  const [showCreate, setShowCreate] = useState(false);

  const fetchPlaylists = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(false);
    try {
      const response = await getPlaylists(user._id);
      setPlaylists(response.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Name required");
      return;
    }

    setLoadingCreate(true);
    try {
      const response = await createPlaylist({ name, description });
      setName("");
      setDescription("");
      setPlaylists((previous) => [response.data, ...previous]);
      setShowCreate(false);
      toast.success("Collection created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create collection");
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleEdit = async (event, playlistId) => {
    event.stopPropagation();
    if (!editForm.name.trim()) {
      toast.error("Name required");
      return;
    }

    setLoadingEdit(playlistId);
    try {
      const response = await updatePlaylist(playlistId, editForm);
      setPlaylists((previous) => previous.map((playlist) => (
        playlist._id === playlistId
          ? { ...playlist, name: response.data.name, description: response.data.description }
          : playlist
      )));
      setEditingId(null);
      toast.success("Collection updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to edit");
    } finally {
      setLoadingEdit(null);
    }
  };

  const handleDelete = async (event, playlistId) => {
    event.stopPropagation();
    if (!window.confirm("Delete this collection?")) return;

    setLoadingDelete(playlistId);
    try {
      await deletePlaylist(playlistId);
      setPlaylists((previous) => previous.filter((playlist) => playlist._id !== playlistId));
      toast.success("Collection deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    } finally {
      setLoadingDelete(null);
    }
  };

  return (
    <div className="odyssey-enter mx-auto max-w-6xl pb-16">
      {/* Header */}
      <div className="mb-12 flex flex-col sm:flex-row items-baseline justify-between gap-6 border-b border-[var(--odyssey-border)] pb-6">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl text-[var(--odyssey-text)] tracking-wide mb-2">
            Collections
          </h1>
          <p className="font-serif italic text-lg text-[var(--odyssey-text-muted)]">
            Curated archives
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={14} />
          New
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-10 max-w-md space-y-3">
          <Input placeholder="Collection name" value={name} onChange={(e) => setName(e.target.value)} />
          <textarea
            placeholder="Description (optional)"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="odyssey-field text-sm"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" isLoading={loadingCreate} onClick={handleCreate}>Create</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading collections..." />
      ) : error ? (
        <ErrorState onRetry={fetchPlaylists} message="Could not load collections." />
      ) : playlists.length === 0 ? (
        <EmptyState message="No collections yet. Create one to start curating stories." />
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlists.map((playlist) => (
            <CollectionCard
              key={playlist._id}
              playlist={playlist}
              editingId={editingId}
              editForm={editForm}
              setEditForm={setEditForm}
              loadingEdit={loadingEdit}
              loadingDelete={loadingDelete}
              onEdit={() => {
                setEditingId(playlist._id);
                setEditForm({ name: playlist.name, description: playlist.description || "" });
              }}
              onDelete={(e) => handleDelete(e, playlist._id)}
              onSaveEdit={handleEdit}
              onCancelEdit={() => setEditingId(null)}
              onClick={() => navigate(`/playlist/${playlist._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
