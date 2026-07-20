// Load and configure the CoolProp module
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const coolpropPath = path.join(__dirname, '..', 'coolprop', 'coolprop.js');

// CoolProp 8.x ships as an ES module (import.meta / export default), which can't
// be require()'d or run in a vm as a classic script. Convert the few ESM-only
// constructs to CommonJS equivalents so it can run here (and under Jest, which
// can't dynamically import ES modules without --experimental-vm-modules).
let source = fs.readFileSync(coolpropPath, 'utf8');
source = source
    .replace('await import("module")', '__cpRequire("module")')
    .replace(/import\.meta\.url/g, JSON.stringify(pathToFileURL(coolpropPath).href))
    .replace('export default Module;', '');

// Compile the transformed source; it declares the async factory `Module`.
const createModule = new Function('__cpRequire', `${source}\nreturn Module;`)(require);

let instance = null;
let loading = null;

function init() {
    if (!loading) {
        loading = createModule().then((mod) => {
            instance = mod;
            return mod;
        });
    }
    return loading;
}

module.exports = {
    init,
    PropsSI: (...args) => {
        if (!instance) {
            throw new Error('CoolProp not initialized. Call init() first');
        }
        return instance.PropsSI(...args);
    },
    // CoolProp signals failure by returning Infinity from PropsSI; the actual
    // reason is stored in a global error string.
    getLastError: () => {
        if (!instance) {
            return '';
        }
        return instance.get_global_param_string('errstring');
    }
};
