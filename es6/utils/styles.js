const rules = new Map();
let sheet;

const getSheet = () => {
    if (!sheet) {
        const element = document.createElement('style');
        element.dataset.metroStart = 'theme';
        document.head.appendChild(element);
        sheet = element.sheet;
    }
    return sheet;
};

const getRule = (selector) => {
    if (!rules.has(selector)) {
        const stylesheet = getSheet();
        const index = stylesheet.insertRule(`${selector} {}`);
        rules.set(selector, stylesheet.cssRules[index]);
    }
    return rules.get(selector);
};

export default {
    set(selector, declarations) {
        const rule = getRule(selector);
        for (const [property, value] of Object.entries(declarations)) {
            rule.style.setProperty(property, value ?? '');
        }
    },

    remove(selector) {
        const rule = rules.get(selector);
        if (!rule) {
            return;
        }
        const stylesheet = getSheet();
        const index = [...stylesheet.cssRules].indexOf(rule);
        if (index >= 0) {
            stylesheet.deleteRule(index);
        }
        rules.delete(selector);
    },
};
