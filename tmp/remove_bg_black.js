const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../components');
const filesToUpdate = ['Hero.tsx', 'Tournaments.tsx', 'Mission.tsx', 'JoinTeam.tsx', 'Footer.tsx', 'OperationalExcellence.tsx'];

filesToUpdate.forEach(file => {
    const filePath = path.join(componentsDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace bg-black only on main container class lines
        content = content.replace(/className="([^"]*)bg-black([^"]*)"/g, (match, p1, p2) => {
            // We only want to remove bg-black if it's the main container (usually has things like py-32, min-h-screen, overflow-hidden)
            // But actually just replacing top-level bg-black is fine if it's mixed with layout classes.
            if (match.includes('bg-black/')) {
                return match; // Don't replace bg-black/40 etc.
            }
            return `className="${p1}bg-transparent${p2}"`;
        });

        // specific replacements to be super safe
        content = content.replace(/bg-black bg-transparent/g, 'bg-transparent');
        content = content.replace(/bg-transparent min-h-screen/g, 'min-h-screen'); // cleanup if needed
        content = content.replace(/bg-transparent border-y/g, 'border-y');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
