import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Save, Image as ImageIcon, Plus, Trash2, Globe, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type PageKey = 'home_hero' | 'story_page' | 'faq_items' | 'custom_tailoring' | 'legal_page';

export default function ContentTab() {
  const [activePage, setActivePage] = useState<PageKey>('home_hero');
  const [isSaving, setIsSaving] = useState(false);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const allBlocks = useQuery(api.content.getAll) || [];
  
  // Find current block
  const currentBlock = allBlocks.find((b: any) => b.key === activePage);

  // Local state for editing
  const [formData, setFormData] = useState<any>({});
  const [seoData, setSeoData] = useState<any>({ metaTitle: '', metaDescription: '' });
  const [status, setStatus] = useState<string>('draft');

  useEffect(() => {
    if (currentBlock) {
      setFormData(currentBlock.data || {});
      setSeoData(currentBlock.seo || { metaTitle: '', metaDescription: '' });
      setStatus(currentBlock.status || 'published');
    } else {
      // Defaults based on activePage
      setSeoData({ metaTitle: '', metaDescription: '' });
      setStatus('draft');
      if (activePage === 'home_hero') setFormData({ heading: '', subHeading: '', images: [] });
      if (activePage === 'faq_items') setFormData([]);
      if (activePage === 'story_page') setFormData({ heading: '', markdownBody: '', imageId: '' });
      if (activePage === 'custom_tailoring') setFormData({ heading: '', consultationPrice: 0, markdownBody: '', bannerImage: '' });
      if (activePage === 'legal_page') setFormData({ markdownBody: '' });
    }
  }, [activePage, currentBlock]);

  const setContent = useMutation(api.content.set);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setContent({
        key: activePage,
        data: formData,
        status,
        seo: seoData
      });
      toast.success(`${activePage.replace('_', ' ')} saved successfully.`);
    } catch (e: any) {
      toast.error(`Failed to save: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (storageId: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      callback(storageId);
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload image");
    }
  };

  const renderHomeHeroForm = () => (
    <div className="space-y-6">
      <div>
         <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal/70 mb-2">Heading</label>
         <input 
           type="text" 
           value={formData.heading || ''} 
           onChange={e => setFormData({...formData, heading: e.target.value})}
           className="w-full border p-3"
         />
      </div>
      <div>
         <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal/70 mb-2">Sub-Heading</label>
         <textarea 
           value={formData.subHeading || ''} 
           onChange={e => setFormData({...formData, subHeading: e.target.value})}
           className="w-full border p-3 h-24"
         />
      </div>
      <div>
         <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal/70 mb-2">Carousel Images (Upload multiple)</label>
         <input type="file" onChange={(e) => handleImageUpload(e, (id) => {
            setFormData({...formData, images: [...(formData.images || []), id]});
         })} />
         <div className="flex gap-2 mt-4 flex-wrap">
           {(formData.images || []).map((img: string, idx: number) => (
             <div key={idx} className="relative w-24 h-24 bg-gray-200 border">
               <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 break-all p-1">{img}</span>
               <button 
                 className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                 onClick={() => setFormData({...formData, images: formData.images.filter((_: any, i: number) => i !== idx)})}
               ><Trash2 className="w-3 h-3" /></button>
             </div>
           ))}
         </div>
      </div>
    </div>
  );

  const renderFaqForm = () => {
    const faqs = Array.isArray(formData) ? formData : [];
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
           <h3 className="text-lg font-serif">FAQ Items</h3>
           <button 
             onClick={() => setFormData([...faqs, { id: Date.now().toString(), question: '', answer: '' }])}
             className="px-4 py-2 bg-brand-charcoal text-white flex items-center gap-2 text-sm"
           ><Plus className="w-4 h-4" /> Add Question</button>
        </div>
        {faqs.map((faq: any, index: number) => (
          <div key={faq.id || index} className="p-4 border bg-gray-50 flex gap-4">
            <div className="flex-1 space-y-4">
              <input 
                placeholder="Question" 
                value={faq.question} 
                onChange={e => {
                  const newFaqs = [...faqs];
                  newFaqs[index].question = e.target.value;
                  setFormData(newFaqs);
                }}
                className="w-full border p-2"
              />
              <textarea 
                placeholder="Answer" 
                value={faq.answer} 
                onChange={e => {
                  const newFaqs = [...faqs];
                  newFaqs[index].answer = e.target.value;
                  setFormData(newFaqs);
                }}
                className="w-full border p-2 h-20"
              />
            </div>
            <button onClick={() => setFormData(faqs.filter((_, i) => i !== index))} className="text-red-500 self-start p-2"><Trash2 className="w-5 h-5"/></button>
          </div>
        ))}
      </div>
    );
  };

  const renderMarkdownForm = (includeImage = false, includePrice = false) => (
    <div className="space-y-6">
      {formData.heading !== undefined && (
        <div>
           <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal/70 mb-2">Page Heading</label>
           <input 
             type="text" 
             value={formData.heading || ''} 
             onChange={e => setFormData({...formData, heading: e.target.value})}
             className="w-full border p-3"
           />
        </div>
      )}
      
      {includePrice && (
        <div>
           <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal/70 mb-2">Consultation Price (GH₵)</label>
           <input 
             type="number" 
             value={formData.consultationPrice || 0} 
             onChange={e => setFormData({...formData, consultationPrice: Number(e.target.value)})}
             className="w-full border p-3"
           />
        </div>
      )}

      {includeImage && (
        <div>
           <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal/70 mb-2">Banner/Cover Image</label>
           <input type="file" onChange={(e) => handleImageUpload(e, (id) => {
              setFormData({...formData, imageId: id});
           })} />
           {formData.imageId && (
             <div className="mt-4 p-2 border bg-gray-100 inline-block text-xs">{formData.imageId}</div>
           )}
        </div>
      )}

      <div>
         <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal/70 mb-2">Content (Markdown)</label>
         <textarea 
           value={formData.markdownBody || ''} 
           onChange={e => setFormData({...formData, markdownBody: e.target.value})}
           className="w-full border p-4 h-64 font-mono text-sm"
           placeholder="# Heading 1&#10;Write your markdown here..."
         />
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-white relative">
      {/* Sidebar for CMS Pages */}
      <div className="w-64 border-r border-gray-200 p-6 flex flex-col gap-4">
         <h2 className="font-serif text-xl mb-4">Pages</h2>
         {(['home_hero', 'story_page', 'custom_tailoring', 'faq_items', 'legal_page'] as PageKey[]).map(key => (
           <button 
             key={key} 
             onClick={() => setActivePage(key)}
             className={`text-left text-sm p-3 rounded-none transition-colors ${activePage === key ? 'bg-brand-charcoal text-white' : 'hover:bg-gray-100'}`}
           >
             {key.replace('_', ' ').toUpperCase()}
           </button>
         ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
           <div className="flex items-center gap-4">
             <h1 className="font-serif text-2xl capitalize">{activePage.replace('_', ' ')}</h1>
             <select 
               value={status} 
               onChange={e => setStatus(e.target.value as 'draft' | 'published')}
               className={`text-xs px-3 py-1 rounded-full font-bold ${status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
             >
               <option value="draft">DRAFT</option>
               <option value="published">PUBLISHED</option>
             </select>
           </div>
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="flex items-center gap-2 bg-brand-charcoal text-white px-6 py-2 text-sm uppercase tracking-wider hover:bg-black transition-colors"
           >
             {isSaving ? 'Saving...' : <><Save className="w-4 h-4"/> Save Changes</>}
           </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-8">
             <div className="bg-white p-6 border shadow-sm">
                <h2 className="text-lg font-serif mb-6 flex items-center gap-2"><FileText className="w-5 h-5"/> Content Blocks</h2>
                {activePage === 'home_hero' && renderHomeHeroForm()}
                {activePage === 'faq_items' && renderFaqForm()}
                {activePage === 'story_page' && renderMarkdownForm(true, false)}
                {activePage === 'custom_tailoring' && renderMarkdownForm(true, true)}
                {activePage === 'legal_page' && renderMarkdownForm(false, false)}
             </div>
           </div>

           {/* SEO Sidebar Panel */}
           <div className="space-y-6">
              <div className="bg-gray-50 p-6 border">
                 <h2 className="text-lg font-serif mb-6 flex items-center gap-2"><Globe className="w-5 h-5"/> SEO Metadata</h2>
                 <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Meta Title</label>
                      <input 
                        className="w-full border p-2 text-sm" 
                        value={seoData.metaTitle || ''} 
                        onChange={e => setSeoData({...seoData, metaTitle: e.target.value})} 
                        placeholder="Google Search Title"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Meta Description</label>
                      <textarea 
                        className="w-full border p-2 text-sm h-24" 
                        value={seoData.metaDescription || ''} 
                        onChange={e => setSeoData({...seoData, metaDescription: e.target.value})}
                        placeholder="Keep it under 160 characters..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Open Graph Image</label>
                      <input type="file" onChange={(e) => handleImageUpload(e, (id) => {
                          setSeoData({...seoData, ogImageId: id});
                      })} />
                      {seoData.ogImageId && <div className="text-xs mt-2 truncate bg-white p-1 border">{seoData.ogImageId}</div>}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
