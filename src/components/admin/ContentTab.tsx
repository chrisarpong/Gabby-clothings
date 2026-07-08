import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Save, Image as ImageIcon, Plus, Trash2, Globe, FileText, CheckCircle2, ArrowUp, ArrowDown, LayoutTemplate, PenTool } from 'lucide-react';
import { toast } from 'sonner';
import { CMSImagePreview } from './CMSImagePreview';
import ReactMarkdown from 'react-markdown';

type PageKey = 'home_hero' | 'story_page' | 'faq_items' | 'custom_tailoring' | 'legal_page';
type EditorTab = 'content' | 'seo';

export default function ContentTab() {
  const [activePage, setActivePage] = useState<PageKey>('home_hero');
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTab>('content');
  const [isSaving, setIsSaving] = useState(false);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const allBlocks = useQuery(api.content.getAll) || [];
  
  const currentBlock = allBlocks.find((b: any) => b.key === activePage);

  const [formData, setFormData] = useState<any>({});
  const [seoData, setSeoData] = useState<any>({ metaTitle: '', metaDescription: '' });
  const [status, setStatus] = useState<string>('draft');

  useEffect(() => {
    if (currentBlock) {
      setFormData(currentBlock.data || {});
      setSeoData(currentBlock.seo || { metaTitle: '', metaDescription: '' });
      setStatus(currentBlock.status || 'published');
    } else {
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
    <div className="space-y-8">
      <div>
         <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant mb-2">Heading</label>
         <input 
           type="text" 
           value={formData.heading || ''} 
           onChange={e => setFormData({...formData, heading: e.target.value})}
           className="w-full bg-surface-variant/30 border border-outline-variant/30 text-on-surface p-4 focus:ring-1 focus:ring-primary focus:outline-none transition-shadow rounded-none"
         />
      </div>
      <div>
         <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant mb-2">Sub-Heading</label>
         <textarea 
           value={formData.subHeading || ''} 
           onChange={e => setFormData({...formData, subHeading: e.target.value})}
           className="w-full bg-surface-variant/30 border border-outline-variant/30 text-on-surface p-4 focus:ring-1 focus:ring-primary focus:outline-none transition-shadow rounded-none h-24"
         />
      </div>
      <div>
         <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant mb-2">Carousel Images</label>
         <div className="flex items-center gap-4 mb-4">
           <label className="cursor-pointer bg-primary text-on-primary px-6 py-3 text-[10px] uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2">
             <Plus className="w-4 h-4"/> Upload Image
             <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (id) => {
                setFormData({...formData, images: [...(formData.images || []), id]});
             })} />
           </label>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
           {(formData.images || []).map((img: string, idx: number) => (
             <div key={idx} className="relative aspect-[3/4] bg-surface-variant/30 group overflow-hidden border border-outline-variant/30">
               <CMSImagePreview imageId={img} />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                 <button 
                   className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
                   onClick={() => setFormData({...formData, images: formData.images.filter((_: any, i: number) => i !== idx)})}
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  );

  const renderFaqForm = () => {
    const faqs = Array.isArray(formData) ? formData : [];
    
    const moveFaq = (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === faqs.length - 1) return;
      const newFaqs = [...faqs];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = newFaqs[index];
      newFaqs[index] = newFaqs[targetIndex];
      newFaqs[targetIndex] = temp;
      setFormData(newFaqs);
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
           <p className="text-on-surface-variant text-sm">Manage frequently asked questions. Drag or use arrows to reorder.</p>
           <button 
             onClick={() => setFormData([...faqs, { id: Date.now().toString(), question: '', answer: '' }])}
             className="px-6 py-3 bg-primary text-on-primary flex items-center gap-2 text-[10px] uppercase tracking-widest hover:bg-black transition-colors"
           ><Plus className="w-4 h-4" /> Add Question</button>
        </div>
        <div className="space-y-4">
          {faqs.map((faq: any, index: number) => (
            <div key={faq.id || index} className="p-5 border border-outline-variant/30 bg-surface-container flex gap-5 group transition-colors hover:border-primary/30">
              <div className="flex flex-col gap-2 items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveFaq(index, 'up')} disabled={index === 0} className="hover:text-primary disabled:opacity-20"><ArrowUp className="w-4 h-4"/></button>
                <button onClick={() => moveFaq(index, 'down')} disabled={index === faqs.length - 1} className="hover:text-primary disabled:opacity-20"><ArrowDown className="w-4 h-4"/></button>
              </div>
              <div className="flex-1 space-y-4">
                <input 
                  placeholder="Question" 
                  value={faq.question} 
                  onChange={e => {
                    const newFaqs = [...faqs];
                    newFaqs[index].question = e.target.value;
                    setFormData(newFaqs);
                  }}
                  className="w-full bg-surface-variant/20 border border-outline-variant/30 text-on-surface p-3 focus:ring-1 focus:ring-primary focus:outline-none transition-shadow text-sm font-semibold"
                />
                <textarea 
                  placeholder="Answer" 
                  value={faq.answer} 
                  onChange={e => {
                    const newFaqs = [...faqs];
                    newFaqs[index].answer = e.target.value;
                    setFormData(newFaqs);
                  }}
                  className="w-full bg-surface-variant/20 border border-outline-variant/30 text-on-surface p-3 focus:ring-1 focus:ring-primary focus:outline-none transition-shadow text-sm h-24"
                />
              </div>
              <button onClick={() => setFormData(faqs.filter((_: any, i: number) => i !== index))} className="text-red-500/50 hover:text-red-500 self-start p-2 transition-colors"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMarkdownForm = (includeImage = false, includePrice = false) => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formData.heading !== undefined && (
          <div>
            <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant mb-2">Page Heading</label>
            <input 
              type="text" 
              value={formData.heading || ''} 
              onChange={e => setFormData({...formData, heading: e.target.value})}
              className="w-full bg-surface-variant/30 border border-outline-variant/30 text-on-surface p-4 focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
            />
          </div>
        )}
        
        {includePrice && (
          <div>
            <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant mb-2">Consultation Price (GH₵)</label>
            <input 
              type="number" 
              value={formData.consultationPrice || 0} 
              onChange={e => setFormData({...formData, consultationPrice: Number(e.target.value)})}
              className="w-full bg-surface-variant/30 border border-outline-variant/30 text-on-surface p-4 focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
            />
          </div>
        )}
      </div>

      {includeImage && (
        <div>
           <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant mb-2">Banner / Cover Image</label>
           
           <div className="flex items-start gap-6">
             {formData.imageId && (
               <div className="w-48 aspect-video relative border border-outline-variant/30 bg-surface-variant/30 overflow-hidden group">
                 <CMSImagePreview imageId={formData.imageId} />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setFormData({...formData, imageId: ''})} className="bg-red-500 text-white p-2 rounded-full"><Trash2 className="w-4 h-4"/></button>
                 </div>
               </div>
             )}
             {!formData.imageId && (
               <label className="w-48 aspect-video border border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:bg-surface-variant/20 transition-colors text-on-surface-variant">
                 <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                 <span className="text-[10px] uppercase tracking-widest">Upload Cover</span>
                 <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (id) => {
                    setFormData({...formData, imageId: id});
                 })} />
               </label>
             )}
           </div>
        </div>
      )}

      {/* Split Pane Markdown Editor */}
      <div>
         <div className="flex items-center justify-between mb-2">
           <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant flex items-center gap-2"><PenTool className="w-3 h-3"/> Markdown Content</label>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-2 border border-outline-variant/30 h-[600px] overflow-hidden">
            {/* Editor */}
            <div className="border-r border-outline-variant/30 bg-surface-container">
              <textarea 
                value={formData.markdownBody || ''} 
                onChange={e => setFormData({...formData, markdownBody: e.target.value})}
                className="w-full h-full p-6 font-mono text-sm bg-transparent outline-none resize-none"
                placeholder="# Heading 1&#10;Write your beautiful markdown here..."
                spellCheck={false}
              />
            </div>
            {/* Live Preview */}
            <div className="bg-surface-container-lowest overflow-y-auto p-8 relative">
              <div className="absolute top-4 right-4 text-[10px] uppercase tracking-widest text-outline bg-surface-variant/30 px-2 py-1">Preview</div>
              <article className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{formData.markdownBody || '*Empty preview...*'}</ReactMarkdown>
              </article>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-surface-container relative">
      {/* CMS Sidebar Navigation */}
      <div className="w-64 border-r border-outline-variant/30 bg-surface-container flex flex-col">
         <div className="p-6 border-b border-outline-variant/30">
           <h2 className="font-serif text-xl text-primary tracking-tight">Content CMS</h2>
         </div>
         <div className="flex-1 overflow-y-auto py-4">
           {(['home_hero', 'story_page', 'custom_tailoring', 'faq_items', 'legal_page'] as PageKey[]).map(key => (
             <button 
               key={key} 
               onClick={() => { setActivePage(key); setActiveEditorTab('content'); }}
               className={`w-full text-left text-sm px-6 py-3 transition-colors flex items-center justify-between group ${activePage === key ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-variant/50'}`}
             >
               <span className="font-medium tracking-wide">{key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
               <div className={`w-1.5 h-1.5 rounded-full ${activePage === key ? 'bg-on-primary' : 'bg-transparent group-hover:bg-outline-variant'}`} />
             </button>
           ))}
         </div>
      </div>

      {/* Main CMS Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-lowest">
        {/* Top Header */}
        <div className="px-8 py-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/50">
           <div className="flex items-center gap-6">
             <h1 className="font-serif text-2xl capitalize text-primary tracking-tight">{activePage.replace('_', ' ')}</h1>
             <div className="h-6 w-px bg-outline-variant/30" />
             <select 
               value={status} 
               onChange={e => setStatus(e.target.value as 'draft' | 'published')}
               className={`text-[10px] uppercase tracking-widest px-3 py-1.5 outline-none border-0 ring-1 ring-inset ${status === 'published' ? 'bg-green-500/10 text-green-600 ring-green-500/20' : 'bg-yellow-500/10 text-yellow-600 ring-yellow-500/20'}`}
             >
               <option value="draft">DRAFT</option>
               <option value="published">PUBLISHED</option>
             </select>
           </div>
           
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="flex items-center gap-3 bg-primary text-on-primary px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
           >
             {isSaving ? 'Saving...' : <><Save className="w-4 h-4"/> Save Changes</>}
           </button>
        </div>

        {/* Editor Tabs */}
        <div className="px-8 flex items-center gap-8 border-b border-outline-variant/30 bg-surface-container-lowest pt-4">
           <button 
             onClick={() => setActiveEditorTab('content')}
             className={`pb-4 text-sm font-semibold tracking-wide transition-colors relative ${activeEditorTab === 'content' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
           >
             <div className="flex items-center gap-2"><LayoutTemplate className="w-4 h-4"/> Content</div>
             {activeEditorTab === 'content' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
           </button>
           <button 
             onClick={() => setActiveEditorTab('seo')}
             className={`pb-4 text-sm font-semibold tracking-wide transition-colors relative ${activeEditorTab === 'seo' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
           >
             <div className="flex items-center gap-2"><Globe className="w-4 h-4"/> SEO Settings</div>
             {activeEditorTab === 'seo' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
           </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           
           {activeEditorTab === 'content' && (
             <div className="max-w-6xl">
               {activePage === 'home_hero' && renderHomeHeroForm()}
               {activePage === 'faq_items' && renderFaqForm()}
               {activePage === 'story_page' && renderMarkdownForm(true, false)}
               {activePage === 'custom_tailoring' && renderMarkdownForm(true, true)}
               {activePage === 'legal_page' && renderMarkdownForm(false, false)}
             </div>
           )}

           {activeEditorTab === 'seo' && (
             <div className="max-w-2xl bg-surface-container p-8 border border-outline-variant/30">
               <h2 className="text-lg font-serif mb-8 text-primary">Search Engine Optimization</h2>
               <div className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-2">Meta Title</label>
                    <input 
                      className="w-full bg-surface-variant/30 border border-outline-variant/30 p-3 text-on-surface focus:ring-1 focus:ring-primary focus:outline-none" 
                      value={seoData.metaTitle || ''} 
                      onChange={e => setSeoData({...seoData, metaTitle: e.target.value})} 
                      placeholder="e.g. Gabby Newluk | Premium Suiting"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-2">Meta Description</label>
                    <textarea 
                      className="w-full bg-surface-variant/30 border border-outline-variant/30 p-3 text-on-surface focus:ring-1 focus:ring-primary focus:outline-none h-24" 
                      value={seoData.metaDescription || ''} 
                      onChange={e => setSeoData({...seoData, metaDescription: e.target.value})}
                      placeholder="Keep it under 160 characters..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-2">Open Graph Image</label>
                    <div className="flex items-start gap-6">
                       {seoData.ogImageId && (
                         <div className="w-48 aspect-[1.91/1] relative border border-outline-variant/30 bg-surface-variant/30 overflow-hidden group">
                           <CMSImagePreview imageId={seoData.ogImageId} />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => setSeoData({...seoData, ogImageId: ''})} className="bg-red-500 text-white p-2 rounded-full"><Trash2 className="w-4 h-4"/></button>
                           </div>
                         </div>
                       )}
                       {!seoData.ogImageId && (
                         <label className="w-48 aspect-[1.91/1] border border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:bg-surface-variant/20 transition-colors text-on-surface-variant">
                           <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                           <span className="text-[10px] uppercase tracking-widest text-center px-4">Upload Social Image</span>
                           <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (id) => {
                              setSeoData({...seoData, ogImageId: id});
                           })} />
                         </label>
                       )}
                    </div>
                  </div>
               </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}
