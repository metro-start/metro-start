import {describe, expect, test} from 'bun:test';
import {Window} from 'happy-dom';
import util from '../es6/utils/util';
import styles from '../es6/utils/styles';

const window = new Window();
globalThis.window = window;
globalThis.document = window.document;

describe('DOM utilities', () => {
    test('adds, detects, and removes classes', () => {
        const element = document.createElement('div');

        util.addClass(element, 'active');
        expect(util.hasClass(element, 'active')).toBeTrue();

        util.removeClass(element, 'active');
        expect(util.hasClass(element, 'active')).toBeFalse();
    });

    test('creates a reusable document fragment from markup', () => {
        const fragment = util.createElement('<span class="item">Metro</span>');

        expect(fragment.firstElementChild?.className).toBe('item');
        expect(fragment.firstElementChild?.textContent).toBe('Metro');
    });
});

describe('dynamic styles', () => {
    test('creates, updates, and removes a rule', () => {
        styles.set('.example', {color: 'red'});
        styles.set('.example', {'background-color': 'black'});

        const stylesheet = document.querySelector(
            'style[data-metro-start="theme"]'
        ).sheet;
        expect(stylesheet.cssRules).toHaveLength(1);
        expect(stylesheet.cssRules[0].style.color).toBe('red');

        styles.remove('.example');
        expect(stylesheet.cssRules).toHaveLength(0);
    });
});
