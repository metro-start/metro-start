import path from 'node:path';
import {mkdir, readdir, rm} from 'node:fs/promises';
import * as sass from 'sass';
import {zipSync} from 'fflate';
import manifestTools from './manifest.cjs';

const root = path.join(import.meta.dir, '..');
const distRoot = path.join(root, 'dist');
const packageJson = await Bun.file(path.join(root, 'package.json')).json();
const manifestTemplate = await Bun.file(
    path.join(root, 'manifest.template.json')
).json();
const requestedTarget = Bun.argv[2] || 'chrome';
const targets = requestedTarget === 'all'
    ? ['chrome', 'firefox', 'xcode']
    : [requestedTarget];
const supportedTargets = new Set(['chrome', 'firefox', 'xcode']);

const sassPlugin = {
    name: 'sass',
    setup(build) {
        build.onLoad({filter: /\.s[ac]ss$/}, ({path: filename}) => ({
            contents: sass.compile(filename, {
                loadPaths: [root],
                style: 'compressed',
            }).css,
            loader: 'css',
        }));
    },
};

const copyFile = (source, destination) => Bun.write(
    destination,
    Bun.file(source)
);

async function createZip(target, directory) {
    const files = {};
    const glob = new Bun.Glob('**/*');
    for await (const filename of glob.scan({cwd: directory, onlyFiles: true})) {
        files[filename] = new Uint8Array(
            await Bun.file(path.join(directory, filename)).arrayBuffer()
        );
    }
    await Bun.write(
        path.join(distRoot, `metro-start-${target}.zip`),
        zipSync(files, {level: 9})
    );
}

async function buildTarget(target) {
    if (!supportedTargets.has(target)) {
        throw new Error(`Unsupported build target: ${target}`);
    }

    const outdir = path.join(distRoot, target);
    await rm(outdir, {recursive: true, force: true});
    await mkdir(path.join(outdir, 'icons'), {recursive: true});

    const result = await Bun.build({
        entrypoints: [path.join(root, 'es6', 'app.js')],
        outdir,
        target: 'browser',
        format: 'iife',
        splitting: false,
        minify: true,
        sourcemap: 'none',
        naming: {
            entry: 'metro-start.[ext]',
            asset: '[name].[hash].[ext]',
        },
        plugins: [sassPlugin],
    });

    if (!result.success) {
        throw new AggregateError(result.logs, `${target} bundle failed`);
    }

    await copyFile(
        path.join(root, 'html', 'start.html'),
        path.join(outdir, 'start.html')
    );
    for (const icon of await readdir(path.join(root, 'icons'))) {
        await copyFile(
            path.join(root, 'icons', icon),
            path.join(outdir, 'icons', icon)
        );
    }
    await Bun.write(
        path.join(outdir, 'manifest.json'),
        JSON.stringify(
            manifestTools.createManifest(
                manifestTemplate,
                packageJson.version,
                target
            )
        )
    );
    await createZip(target, outdir);
    console.log(`Built ${target}.`);
}

if (requestedTarget === 'all') {
    await rm(distRoot, {recursive: true, force: true});
}
await mkdir(distRoot, {recursive: true});
for (const target of targets) {
    await buildTarget(target);
}
