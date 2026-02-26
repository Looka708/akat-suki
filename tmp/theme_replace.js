const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../components');
const filesToUpdate = ['PlayerRoster.tsx', 'Tournaments.tsx', 'Newsletter.tsx', 'Mission.tsx', 'JoinTeam.tsx', 'Contact.tsx', 'Hero.tsx'];

filesToUpdate.forEach(file => {
    const filePath = path.join(componentsDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Cyan to Crimson
        content = content.replace(/#00d4ff/gi, '#dc143c');
        content = content.replace(/0,212,255/g, '220,20,60');
        content = content.replace(/0, 212, 255/g, '220, 20, 60');
        content = content.replace(/text-glow-cyan/g, 'text-glow-crimson');
        content = content.replace(/border-glow-cyan/g, 'hover:border-[#dc143c] hover:shadow-[0_0_15px_rgba(220,20,60,0.3)] shadow-[inset_0_0_10px_rgba(220,20,60,0.1)]');

        // Purple to Crimson
        content = content.replace(/#9d4edd/gi, '#dc143c');
        content = content.replace(/157,78,221/g, '220,20,60');
        content = content.replace(/157, 78, 221/g, '220, 20, 60');
        content = content.replace(/text-glow-purple/g, 'text-glow-crimson');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
