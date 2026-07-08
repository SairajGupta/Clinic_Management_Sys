import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Fix broken classes
    content = content.replace(/rounded-full-full/g, 'rounded-full');
    content = content.replace(/rounded-full-none/g, 'rounded-none');
    content = content.replace(/rounded-full-t-md/g, 'rounded-t-md');
    content = content.replace(/rounded-full-b-md/g, 'rounded-b-md');
    content = content.replace(/rounded-full-t-3xl/g, 'rounded-t-3xl');
    content = content.replace(/rounded-full-b-3xl/g, 'rounded-b-3xl');
    content = content.replace(/rounded-full-t-2xl/g, 'rounded-t-2xl');
    content = content.replace(/rounded-full-b-2xl/g, 'rounded-b-2xl');
    content = content.replace(/rounded-full-t-xl/g, 'rounded-t-xl');
    content = content.replace(/rounded-full-b-xl/g, 'rounded-b-xl');
    content = content.replace(/rounded-full-l-md/g, 'rounded-l-md');
    content = content.replace(/rounded-full-r-md/g, 'rounded-r-md');
    content = content.replace(/rounded-full-t-lg/g, 'rounded-t-lg');
    content = content.replace(/rounded-full-b-lg/g, 'rounded-b-lg');

    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
