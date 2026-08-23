const FIREFOX_ID = 'metro-start@metro-start.com';

function createManifest(template, version, target) {
    const manifest = structuredClone(template);
    manifest.version = version;

    if (target === 'firefox') {
        manifest.manifest_version = 2;
        manifest.permissions = manifest.permissions.concat(
            manifest.host_permissions || []
        );
        delete manifest.host_permissions;
        manifest.browser_specific_settings = {
            gecko: {
                id: FIREFOX_ID,
                strict_min_version: '77.0',
            },
        };
    }

    return manifest;
}

function transformManifest(content, version, target) {
    return JSON.stringify(
        createManifest(JSON.parse(content.toString()), version, target)
    );
}

module.exports = {createManifest, transformManifest};
