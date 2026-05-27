const fs = require('fs');

const replacements = [
  { old: 'https://images.unsplash.com/photo-1549298240-0d8e60513026?q=80&w=2670&auto=format&fit=crop', new: '/assets/1.jpg' },
  { old: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2520&auto=format&fit=crop', new: '/assets/2.webp' },
  { old: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2574&auto=format&fit=crop', new: '/assets/3.jpg' },
  { old: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALDr1LUdLuFMcJZXKEO_DVy5mCu6gv5KDMgJtnMYk6MTqRsQxZL_8L72m5YzlhvljuB63ht38C1iEmLh88B0AsOgdAzPiKQ2lWB_5In15FafIbw3WHNUJDruU1s6oUFGg4fdkDxuhuykmr4gZNEnhQGIyFRhOjhKpaHPv9SHACFp0mrQuzJ8Z3u9gDa8lWafXHPB9pek3c_GIvmj_Tyh_m9Vg7lKUjuFR91UHpIEeComP1nw4YNoA7U4DY9qp2b8PECQRL-dVe_30', new: '/assets/agbada 2.jpeg' },
  { old: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?q=80&w=2565&auto=format&fit=crop', new: '/assets/kaftan.jpeg' },
  { old: 'https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?q=80&w=2572&auto=format&fit=crop', new: '/assets/8.jpg' },
  { old: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=2671&auto=format&fit=crop', new: '/assets/9.jpeg' },
  { old: 'https://images.unsplash.com/photo-1550246140-5119ae4790b8?q=80&w=2670&auto=format&fit=crop', new: '/assets/10.jpeg' },
  { old: 'https://images.unsplash.com/photo-1616231940984-ec40b3c2e646?q=80&w=2574&auto=format&fit=crop', new: '/assets/11.jpeg' },
  { old: 'https://images.unsplash.com/photo-1590396005706-9ab50ea67def?q=80&w=2574&auto=format&fit=crop', new: '/assets/12.jpeg' },
  { old: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=2525&auto=format&fit=crop', new: '/assets/13.jpeg' },
  { old: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=2670&auto=format&fit=crop', new: '/assets/14.jpeg' },
  { old: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2680&auto=format&fit=crop', new: '/assets/15.jpeg' },
  { old: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=2574&auto=format&fit=crop', new: '/assets/16.jpeg' },
  { old: 'https://images.unsplash.com/photo-1599643477874-5c86650ae40e?q=80&w=2670&auto=format&fit=crop', new: '/assets/17.jpeg' },
  { old: 'https://images.unsplash.com/photo-1603400521630-9f2de124b4f5?q=80&w=2574&auto=format&fit=crop', new: '/assets/18.jpeg' },
  { old: 'https://images.unsplash.com/photo-1604136172384-b2e9c43271ae?q=80&w=2574&auto=format&fit=crop', new: '/assets/19.jpeg' },
  { old: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2680&auto=format&fit=crop', new: '/assets/20.jpeg' },
  { old: 'https://images.unsplash.com/photo-1603222378342-999335bb9c14?q=80&w=2574&auto=format&fit=crop', new: '/assets/21.jpeg' },
  { old: 'https://images.unsplash.com/photo-1608405021200-a54eb49f48ac?q=80&w=2574&auto=format&fit=crop', new: '/assets/26.jpeg' }
];

function processFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  for (let r of replacements) {
    content = content.split(r.old).join(r.new);
  }
  if (path.includes('convex/products.ts')) {
    content = content.replace(
      'if (!match.images || match.images.length === 0) patchData.images = p.images;',
      'patchData.images = p.images;'
    );
  }
  fs.writeFileSync(path, content);
}

processFile('src/data/products.ts');
processFile('convex/products.ts');

console.log('Files updated successfully.');
