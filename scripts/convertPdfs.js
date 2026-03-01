const fs = require('fs-extra');
const path = require('path');
const pdf = require('pdf-parse');

const PDF_DIR = path.join(__dirname, '../backend/downloads');
const MD_DIR = path.join(__dirname, '../backend/markdowns');

async function convertAll() {
    await fs.ensureDir(MD_DIR);
    if (!fs.existsSync(PDF_DIR)) {
        console.error("Source PDF directory not found:", PDF_DIR);
        return;
    }

    const files = await fs.readdir(PDF_DIR);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

    for (const file of pdfFiles) {
        const pdfPath = path.join(PDF_DIR, file);
        const mdFileName = file.replace(/\.pdf$/i, '.md');
        const mdPath = path.join(MD_DIR, mdFileName);

        if (fs.existsSync(mdPath)) continue;

        try {
            const dataBuffer = await fs.readFile(pdfPath);
            const data = await pdf(dataBuffer);
            const content = `# Document: ${file}\n\n${data.text}`;
            await fs.writeFile(mdPath, content);
            console.log(`Created: ${mdFileName}`);
        } catch (err) {
            console.error(`Failed ${file}:`, err.message);
        }
    }
}

convertAll();