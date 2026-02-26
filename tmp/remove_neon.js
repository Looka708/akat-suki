const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../components');
const filesToUpdate = ['PlayerRoster.tsx', 'Tournaments.tsx', 'Newsletter.tsx', 'Mission.tsx', 'JoinTeam.tsx', 'Contact.tsx', 'Hero.tsx'];

filesToUpdate.forEach(file => {
    const filePath = path.join(componentsDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove the glowing effects (text glows, border glows, drop shadows matching that format, and shadow glows)
        content = content.replace(/text-glow-crimson/g, '');
        content = content.replace(/text-glow-cyan/g, '');
        content = content.replace(/text-glow-purple/g, '');
        content = content.replace(/border-glow-cyan/g, '');

        // Remove ALL regex shadow matches corresponding to the circular box shadows and drop-shadows added for glow.
        // E.g., shadow-[0_0_15px_rgba(220,20,60,0.3)], drop-shadow-[0_0_5px_rgba(220,20,60,0.5)]
        content = content.replace(/shadow-\[0_0_[^\]]+\]/g, '');
        content = content.replace(/hover:shadow-\[0_0_[^\]]+\]/g, '');
        content = content.replace(/drop-shadow-\[0_0_[^\]]+\]/g, '');
        content = content.replace(/shadow-\[inset_0_0_[^\]]+\]/g, '');

        // Check for specific colors like #dc143c that were added as shadow glows (e.g. shadow-[0_0_15px_#dc143c])
        content = content.replace(/shadow-\[0_0_[^\]]+_#[^\]]+\]/g, '');

        // Also remove animate-pulse, animate-ping if added for neon glow
        // Note: some pings might be used for normal stuff, but neon ping is common. Let's just remove ping for neon.
        content = content.replace(/animate-pulse/g, '');
        content = content.replace(/animate-ping/g, '');

        // Remove font-orbitron and revert back to standard sans formatting by simply deleting it.
        content = content.replace(/font-orbitron/g, '');

        // Clean up redundant spaces left by removals
        content = content.replace(/  +/g, ' ');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
