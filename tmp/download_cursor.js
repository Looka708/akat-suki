const https = require('http');
const fs = require('fs');

const file = fs.createWriteStream("public/sharingan.cur");

https.get("http://www.rw-designer.com/cursor-download.php?id=165364", {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "http://www.rw-designer.com/cursor-detail/165364",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
    }
}, function (response) {
    if (response.statusCode === 301 || response.statusCode === 302) {
        const redirection = response.headers.location;
        https.get(redirection, function (res) {
            res.pipe(file);
            file.on("finish", () => { file.close(); console.log("Done"); });
        });
    } else {
        response.pipe(file);
        file.on("finish", () => {
            file.close();
            console.log("Download Completed");
        });
    }
});
