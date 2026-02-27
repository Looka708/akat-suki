const https = require('https');
const fs = require('fs');

const file = fs.createWriteStream("public/sharingan.png");

https.get("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sharingan_triple.svg/32px-Sharingan_triple.svg.png", {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36"
    }
}, function (response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
        response.pipe(file);
        file.on("finish", () => {
            file.close();
            console.log("PNG Download Complete");
        });
    } else {
        console.log("Failed to download. Status:", response.statusCode);
    }
});
