const fs = require('fs');
let content = fs.readFileSync('components/Tournaments.tsx', 'utf8');
content = content.replace(
    /<section className="py-32 min-h-screen flex items-center justify-center">[\s\S]*?<\/section>/m,
    `<section className="relative py-32 bg-transparent min-h-[800px] flex flex-col pt-40">
 <div className="max-w-[1400px] mx-auto px-6 w-full relative z-10 flex flex-col">
 <div className="mb-20 text-center xl:text-left flex flex-col xl:items-start items-center">
 <div className="flex items-center justify-center xl:justify-start gap-3 mb-4 w-full">
 <span className="w-10 h-[1px] bg-white/20"></span>
 <div className="w-32 h-3 bg-white/10 rounded animate-pulse"></div>
 </div>
 <div className="w-64 md:w-96 h-12 md:h-20 bg-white/10 rounded animate-pulse flex-shrink-0"></div>
 </div>

 <div className="relative w-full rounded-xl border border-white/5 overflow-hidden glass-card opacity-100 flex flex-col xl:flex-row min-h-[600px]">
 <div className="relative w-full xl:w-1/2 min-h-[400px] xl:min-h-full bg-white/5 animate-pulse"></div>
 <div className="relative w-full xl:w-1/2 p-8 xl:p-12 bg-black/80 backdrop-blur-md flex flex-col justify-center border-l border-white/5">
 <div className="w-full h-8 bg-white/10 rounded animate-pulse mb-6"></div>
 <div className="w-3/4 h-4 bg-white/10 rounded animate-pulse mb-10"></div>
 <div className="space-y-4 w-full">
 <div className="w-full h-16 bg-white/5 rounded-lg animate-pulse"></div>
 <div className="w-full h-16 bg-white/5 rounded-lg animate-pulse delay-75"></div>
 <div className="w-full h-16 bg-white/5 rounded-lg animate-pulse delay-150"></div>
 </div>
 </div>
 </div>
 </div>
 </section>`
);
fs.writeFileSync('components/Tournaments.tsx', content);
