const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

function wrapText(context, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = context.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function drawTextWithOutline(ctx, text, x, y, fillStyle = 'white', strokeStyle = 'black', lineWidth = 4) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
    
    ctx.fillStyle = fillStyle;
    ctx.fillText(text, x, y);
}

async function createMeme(buffer, topText, bottomText) {
    try {
        GlobalFonts.registerFromPath(path.join(__dirname, 'impact.ttf'), 'Impact');
        const image = await loadImage(buffer);
        
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(image, 0, 0, image.width, image.height);
        
        const baseFontSize = Math.max(image.width * 0.17, 32);
        ctx.font = `${baseFontSize}px Impact, Noto Color Emoji`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        const margin = image.width * 0.05;
        const maxWidth = image.width - (margin * 2);
        
        if (topText && topText.trim()) {
            const topLines = wrapText(ctx, topText.toUpperCase(), maxWidth);
            const lineHeight = baseFontSize * 1.1;
            let startY = margin;
            
            topLines.forEach((line, index) => {
                const y = startY + (index * lineHeight);
                drawTextWithOutline(
                    ctx, 
                    line, 
                    image.width / 2, 
                    y,
                    'white',
                    'black',
                    baseFontSize * 0.10
                );
            });
        }
        
        if (bottomText && bottomText.trim()) {
            const bottomLines = wrapText(ctx, bottomText.toUpperCase(), maxWidth);
            const lineHeight = baseFontSize * 1.1;
            const visualAdjustment = baseFontSize * 0.1;
            const totalTextHeight = (bottomLines.length - 1) * lineHeight + baseFontSize;
            let startY = image.height - margin - totalTextHeight + visualAdjustment;
            
            bottomLines.forEach((line, index) => {
                const y = startY + (index * lineHeight);
                drawTextWithOutline(
                    ctx, 
                    line, 
                    image.width / 2, 
                    y,
                    'white',
                    'black',
                    baseFontSize * 0.10
                );
            });
        }
        
        return canvas.toBuffer('image/png');
    } catch (error) {
        throw new Error(error.message || 'No result found.');
    }
}

module.exports = { createMeme }