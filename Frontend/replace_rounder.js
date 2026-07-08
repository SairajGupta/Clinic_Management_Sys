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
    
    // Cards and Containers
    content = content.replace(/rounded-lg/g, 'rounded-3xl');
    content = content.replace(/rounded-md/g, 'rounded-2xl');
    content = content.replace(/rounded-sm/g, 'rounded-xl');
    content = content.replace(/rounded-xl/g, 'rounded-3xl');
    
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        // Buttons and inputs
        if (lines[i].includes('<button') || lines[i].includes('<input') || lines[i].includes('type="submit"')) {
            lines[i] = lines[i].replace(/rounded-3xl/g, 'rounded-full');
            lines[i] = lines[i].replace(/rounded-2xl/g, 'rounded-full');
            lines[i] = lines[i].replace(/rounded-xl/g, 'rounded-full');
        }
        
        // Square containers (avatars, icons)
        if (lines[i].match(/w-\d+\s+h-\d+/) || lines[i].match(/h-\d+\s+w-\d+/)) {
            lines[i] = lines[i].replace(/rounded-3xl/g, 'rounded-full');
            lines[i] = lines[i].replace(/rounded-2xl/g, 'rounded-full');
            lines[i] = lines[i].replace(/rounded-xl/g, 'rounded-full');
        }
    }
    content = lines.join('\n');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
