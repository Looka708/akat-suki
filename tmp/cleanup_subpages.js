const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../app');
const filesToUpdate = [
    'organization/page.tsx',
    'tournaments/page.tsx',
    'roster/page.tsx',
    'join-us/page.tsx'
];

filesToUpdate.forEach(file => {
    const filePath = path.join(baseDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove font-orbitron entirely
        content = content.replace(/font-orbitron/g, '');

        // Remove neon glow classes
        content = content.replace(/text-glow-crimson/g, '');
        content = content.replace(/text-glow-cyan/g, '');
        content = content.replace(/text-glow-purple/g, '');
        content = content.replace(/border-glow-cyan/g, '');

        // Remove intense shadow classes
        content = content.replace(/shadow-\[0_0_[^\]]+\]/g, '');
        content = content.replace(/hover:shadow-\[0_0_[^\]]+\]/g, '');
        content = content.replace(/drop-shadow-\[0_0_[^\]]+\]/g, '');
        content = content.replace(/shadow-\[inset_0_0_[^\]]+\]/g, '');
        content = content.replace(/shadow-\[0_0_[^\]]+_#[^\]]+\]/g, '');

        // Remove explicit hardcoded backgrounds that block layers if they aren't meant to
        // Be careful not to replace bg-black over the whole document indiscriminately 
        content = content.replace(/className="([^"]*)bg-black([^"]*)"/g, (match, p1, p2) => {
            if (match.includes('bg-black/')) return match;
            return `className="${p1}bg-transparent${p2}"`;
        });

        // Clean up redundant spaces left by removals
        content = content.replace(/  +/g, ' ');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`File not found: ${filePath}`);
    }
});
