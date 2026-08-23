import {describe, expect, test} from 'bun:test';
import manifestTools from '../scripts/manifest.cjs';

const template = {
    manifest_version: 3,
    permissions: ['storage'],
    host_permissions: ['*://api.metro-start.com/*'],
};

describe('browser manifests', () => {
    test('keeps Manifest V3 for Chromium and Safari', () => {
        for (const target of ['chrome', 'xcode']) {
            const manifest = manifestTools.createManifest(template, '1.2.3', target);
            expect(manifest.manifest_version).toBe(3);
            expect(manifest.host_permissions).toEqual(template.host_permissions);
            expect(manifest.version).toBe('1.2.3');
        }
    });

    test('converts Firefox host permissions to Manifest V2', () => {
        const manifest = manifestTools.createManifest(template, '1.2.3', 'firefox');
        expect(manifest.manifest_version).toBe(2);
        expect(manifest.host_permissions).toBeUndefined();
        expect(manifest.permissions).toContain('*://api.metro-start.com/*');
        expect(manifest.browser_specific_settings.gecko.id)
            .toBe('metro-start@metro-start.com');
    });

    test('does not mutate the shared template', () => {
        manifestTools.createManifest(template, '1.2.3', 'firefox');
        expect(template.manifest_version).toBe(3);
        expect(template.host_permissions).toHaveLength(1);
    });
});
