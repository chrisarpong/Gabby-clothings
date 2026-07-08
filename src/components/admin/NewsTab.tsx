import React, { useState } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, CheckCircle2, Globe, FileText } from 'lucide-react';

export default function NewsTab() {
  const posts = useQuery(api.posts.getAll);
  const createPost = useMutation(api.posts.createPost);
  const updatePost = useMutation(api.posts.updatePost);
  const deletePost = useMutation(api.posts.deletePost);

  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'news_flash',
    excerpt: '',
    content: '',
    status: 'draft',
  });

  const handleEdit = (post: any) => {
    setCurrentPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt || '',
      content: post.content,
      status: post.status || 'draft',
    });
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentPost(null);
    setFormData({
      title: '',
      slug: '',
      category: 'news_flash',
      excerpt: '',
      content: '',
      status: 'draft',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (currentPost) {
        await updatePost({ id: currentPost._id, ...formData });
        toast.success("Post updated successfully");
      } else {
        await createPost(formData);
        toast.success("Post created successfully");
      }
      setIsEditing(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save post");
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost({ id });
        toast.success("Post deleted successfully");
      } catch (e: any) {
        toast.error("Failed to delete post");
      }
    }
  };

  if (posts === undefined) return <div className="p-8">Loading posts...</div>;

  return (
    <div className="p-8 font-sans text-on-surface h-full flex flex-col">
      {!isEditing ? (
        <>
          <div className="flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-4">
            <div>
              <h2 className="font-serif text-3xl text-primary mb-1">News & Announcements</h2>
              <p className="text-sm text-on-surface/70">Manage blog posts and active news flashes.</p>
            </div>
            <button 
              onClick={handleCreateNew}
              className="px-4 py-2 flex items-center gap-2 text-xs uppercase tracking-widest bg-primary text-white hover:bg-primary transition-colors"
            >
              <Plus className="w-4 h-4" /> New Post
            </button>
          </div>

          <div className="bg-surface-container border border-outline-variant/30 overflow-hidden flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bone border-b border-outline-variant/30">
                  <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-on-surface/70">Title</th>
                  <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-on-surface/70">Category</th>
                  <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-on-surface/70">Status</th>
                  <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-on-surface/70">Date</th>
                  <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-on-surface/70 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant italic text-sm">No posts found.</td>
                  </tr>
                )}
                {posts.map((post: any) => (
                  <tr key={post._id} className="border-b border-primary/5 hover:bg-brand-bone/50 transition-colors">
                    <td className="p-4 font-serif text-primary text-lg">{post.title}</td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-brand-bone border border-outline-variant/30">
                        {post.category?.replace('_', ' ') || "Uncategorized"}
                      </span>
                    </td>
                    <td className="p-4">
                      {post.status === 'published' ? (
                        <span className="text-[10px] uppercase tracking-widest text-green-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-mono text-on-surface/70">
                      {new Date(post._creationTime).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => handleEdit(post)} className="p-2 text-primary hover:bg-brand-bone rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(post._id)} className="p-2 text-red-500 hover:bg-red-950/20 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-surface-container border border-outline-variant/30 p-8 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-serif text-2xl text-primary">
              {currentPost ? 'Edit Post' : 'Create New Post'}
            </h3>
            <div className="flex gap-4">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs uppercase tracking-widest border border-outline-variant/30 hover:bg-brand-bone transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 text-xs uppercase tracking-widest bg-primary text-white hover:bg-primary transition-colors flex items-center gap-2">
                <FileText className="w-4 h-4" /> Save Post
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-on-surface/70 mb-2">Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-outline-variant/30 p-3 focus:outline-none focus:border-primary font-serif text-xl"
                  placeholder="e.g. Summer Collection Announcement"
                />
              </div>
              
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-on-surface/70 mb-2">Excerpt / Summary</label>
                <textarea 
                  value={formData.excerpt} 
                  onChange={e => setFormData({...formData, excerpt: e.target.value})}
                  className="w-full border border-outline-variant/30 p-3 focus:outline-none focus:border-primary h-24"
                  placeholder="A brief summary for the modal or card..."
                />
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-on-surface/70 mb-2">Content (Markdown supported)</label>
                <textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full border border-outline-variant/30 p-3 focus:outline-none focus:border-primary h-96 font-mono text-sm"
                  placeholder="Write your full post content here..."
                />
              </div>
            </div>

            <div className="space-y-6 bg-brand-bone/30 p-6 border border-outline-variant/30 h-max">
              <h4 className="font-serif text-lg border-b border-outline-variant/30 pb-2 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Publishing
              </h4>
              
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-on-surface/70 mb-2">Status</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full border border-outline-variant/30 p-2 focus:outline-none focus:border-primary bg-surface-container"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-on-surface/70 mb-2">Category</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-outline-variant/30 p-2 focus:outline-none focus:border-primary bg-surface-container"
                >
                  <option value="news_flash">News Flash (Modal Popup)</option>
                  <option value="blog">Blog Post</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-on-surface/70 mb-2">URL Slug</label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  className="w-full border border-outline-variant/30 p-2 focus:outline-none focus:border-primary bg-surface-container text-sm font-mono"
                  placeholder="e.g. summer-collection-2026"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
