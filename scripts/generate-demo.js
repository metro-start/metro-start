import path from 'node:path';
import {mkdir, readdir, rm} from 'node:fs/promises';

const repoRoot = path.resolve(import.meta.dir, '..');
const htmlPath = path.join(repoRoot, 'html', 'start.html');
const distDir = path.join(repoRoot, 'dist', 'chrome');
const distPath = path.join(distDir, 'metro-start.js');
const demoDir = path.join(repoRoot, 'demo');
const demoDist = path.join(demoDir, 'dist');

const requireFile = async (filePath, description) => {
    const file = Bun.file(filePath);
    if (!await file.exists()) {
        throw new Error(`${description} not found at ${filePath}`);
    }
    return file;
};

const htmlFile = await requireFile(htmlPath, 'Start page');
await requireFile(distPath, 'Built bundle');

const sampleData = {
    todos: [
        {name: 'Try the demo mode', done: false},
        {name: 'Add a todo', done: false},
        {name: 'Mark one done', done: true},
    ],
    currentTheme: {
        themeContent: {
            'font-chooser': 'system',
            baseColor: '#88aaff',
            mainColor: '#ffffff',
            titleColor: '#333333',
            optionsColor: '#ff5500',
            backgroundColor: '#0f1723',
            'background-chooser': 'none',
        },
        title: 'Demo Theme',
        author: 'Demo',
    },
    themesLocal: [],
    weather: {
        city: 'Vancouver, CA',
        currentTemp: 16,
        highTemp: 20,
        lowTemp: 12,
        condition: 'partly cloudy',
        units: 'celsius',
        visible: true,
    },
    page: 'todos',
};

await rm(demoDist, {recursive: true, force: true});
await mkdir(demoDist, {recursive: true});

const sampleJs = Object.entries(sampleData)
    .map(([key, value]) =>
        `localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(JSON.stringify(value))});`
    )
    .join('\n');
await Bun.write(path.join(demoDir, 'sample-data.js'), sampleJs);
for (const filename of await readdir(distDir)) {
    if (filename.endsWith('.js') || filename.endsWith('.css')) {
        await Bun.write(
            path.join(demoDist, filename),
            Bun.file(path.join(distDir, filename))
        );
    }
}

const html = (await htmlFile.text())
    .replace("href='metro-start.css'", "href='dist/metro-start.css'")
    .replace(
        /<script src=['"]metro-start.js['"]><\/script>/,
        '<script src="sample-data.js"></script>\n    <script src="dist/metro-start.js"></script>'
    );
await Bun.write(path.join(demoDir, 'index.html'), html);

console.log('Demo build complete. Open demo/index.html to try the app.');
