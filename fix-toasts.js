const fs = require('fs');

// Contact.tsx
let contact = fs.readFileSync('components/Contact.tsx', 'utf8');

if (!contact.includes("import toast from 'react-hot-toast'")) {
    contact = contact.replace("import anime from 'animejs'", "import anime from 'animejs'\nimport toast from 'react-hot-toast'");
}

contact = contact.replace(/setSubmitStatus\('success'\)/g, "toast.success('Message sent successfully! We\\'ll get back to you within 24 hours.')\n            setSubmitStatus('success')");
contact = contact.replace(/setSubmitStatus\('error'\)/g, "toast.error('Something went wrong. Please try again later.')\n            setSubmitStatus('error')");

contact = contact.replace(/\{\/\* Status Messages \*\/\}[\s\S]*?\{\w* \/\*\s*\}$/m, ''); // Will just do simpler regex or manual removal

// Let's remove the status rendering block explicitly:
contact = contact.replace(/\{\/\* Status Messages \*\/\}[\s\S]*?\{\/\* Status Messages \*\/\}[\s\S]*?(?=\s*<\/form>)/m, ''); // This regex is bad. Let's do concrete replace.
contact = contact.replace(
    /\{\/\* Status Messages \*\/\}[\s\S]*?\{\s*submitStatus === 'error'[\s\S]*?\}\)/g,
    ''
);

fs.writeFileSync('components/Contact.tsx', contact);

// Newsletter.tsx
let newsletter = fs.readFileSync('components/Newsletter.tsx', 'utf8');

if (!newsletter.includes("import toast from 'react-hot-toast'")) {
    newsletter = newsletter.replace("import anime from 'animejs'", "import anime from 'animejs'\nimport toast from 'react-hot-toast'");
}

newsletter = newsletter.replace(/setStatus\('success'\)/g, "toast.success('Successfully subscribed! Check your inbox for confirmation.')\n            setStatus('success')");
newsletter = newsletter.replace(/setStatus\('error'\)/g, "toast.error(error.message || 'Failed to subscribe. Please try again.')\n            setStatus('error')");

newsletter = newsletter.replace(
    /\{\/\* Status Messages \*\/\}[\s\S]*?\{\s*status === 'error'[\s\S]*?\}\)/g,
    ''
);

fs.writeFileSync('components/Newsletter.tsx', newsletter);
