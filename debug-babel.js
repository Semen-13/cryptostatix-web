const fs = require('fs');
const Babel = require('@babel/standalone');

const html = fs.readFileSync('d:\\CryptoStatix\\project\\public\\screener-terminal.html', 'utf8');

const scriptMatch = html.match(/<script type="text\/babel" data-presets="react">([\s\S]*?)<\/script>/);

if (scriptMatch) {
    const code = scriptMatch[1];
    try {
        const result = Babel.transform(code, {
            presets: ['react']
        });
        console.log("Success! Compiled code starts with:");
        console.log(result.code.substring(0, 200));
    } catch (err) {
        console.error("Babel Parsing Error:", err);
    }
} else {
    console.log("Could not find babel script tag");
}
