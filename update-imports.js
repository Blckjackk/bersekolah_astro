const fs = require('fs');
const path = require('path');

// Array of files that need to be updated
const filesToUpdate = [
  'src/pages/dashboard/pengumuman.astro',
  'src/pages/dashboard/testimoni.astro',
  'src/pages/dashboard/seleksi.astro',
  'src/pages/dashboard/periode-beasiswa.astro',
  'src/pages/dashboard/pengaturan.astro',
  'src/pages/dashboard/konten/create.astro',
  'src/pages/dashboard/manage-admin.astro',
  'src/pages/dashboard/dokumen/wajib.astro',
  'src/pages/dashboard/dokumen/sosmed.astro',
  'src/pages/dashboard/kelola-artikel.astro',
  'src/pages/dashboard/index.astro',
  'src/pages/dashboard/faq.astro',
  'src/pages/dashboard/export-data.astro',
  'src/pages/dashboard/donasi.astro',
  'src/pages/dashboard/faq/create.astro',
  'src/pages/dashboard/data-testimoni.astro',
  'src/pages/dashboard/data-mentor.astro'
];

const basePath = 'c:/Users/mp2k5/Documents/GitHub/Project_Prokon/bersekolah_website/';

for (const filePath of filesToUpdate) {
  const fullPath = path.join(basePath, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace the import statement
    content = content.replace(
      /import DashboardAdmin from ["']([^"']+)admin-layout\.astro["'];/g,
      'import AdminLayout from "$1AdminLayout.astro";'
    );
    
    // Replace the component usage
    content = content.replace(/<DashboardAdmin/g, '<AdminLayout');
    content = content.replace(/<\/DashboardAdmin>/g, '</AdminLayout>');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
}

console.log('All files updated successfully!');
