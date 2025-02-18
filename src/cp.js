// Load and configure the CoolProp module
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock XMLHttpRequest
class XMLHttpRequest {
    open(method, url) {
        this.method = method;
        this.url = url;
    }

    send() {
        try {
            // Convert the URL to a local file path
            const localPath = path.join(__dirname, '..', 'coolprop', path.basename(this.url));
            const data = fs.readFileSync(localPath);
            
            this.status = 200;
            this.response = data;
            this.responseType = 'arraybuffer';
            
            if (this.onload) {
                this.onload();
            }
        } catch (error) {
            if (this.onerror) {
                this.onerror(error);
            }
        }
    }
}

// Read the coolprop.js file
const coolpropJs = fs.readFileSync(path.join(__dirname, '../coolprop/coolprop.js'), 'utf8');

// Create a context for the module
const context = {
    window: {},
    self: {},
    Module: {
        onRuntimeInitialized: function() {
            context.Module.initialized = true;
        }
    },
    importScripts: () => {},
    console: console,
    location: {
        href: 'file://' + __dirname,
        pathname: __dirname,
    },
    document: {
        currentScript: { src: '' }
    },
    XMLHttpRequest: XMLHttpRequest
};

// Make self reference the context itself
context.self = context;
// Make window reference the context itself
context.window = context;

// Execute coolprop.js in our custom context
vm.createContext(context);
vm.runInContext(coolpropJs, context);

// Wait for initialization
function waitForInit(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            if (context.Module.initialized) {
                resolve(context.Module);
            } else if (Date.now() - start > timeout) {
                reject(new Error('CoolProp initialization timed out'));
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

module.exports = {
    init: () => waitForInit(),
    PropsSI: (...args) => {
        if (!context.Module.initialized) {
            throw new Error('CoolProp not initialized. Call init() first');
        }
        return context.Module.PropsSI(...args);
    }
};
