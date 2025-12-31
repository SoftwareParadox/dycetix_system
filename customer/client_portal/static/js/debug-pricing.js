// debug-pricing.js - Add this BEFORE currency-converter.js
console.log('🔧 DEBUG: Starting pricing debug...');

// Track all changes to price elements
const priceElements = new Set();
const originalTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
const originalSetAttribute = Element.prototype.setAttribute;

// Monitor textContent changes
Object.defineProperty(Node.prototype, 'textContent', {
    get: function() {
        return originalTextContent.get.call(this);
    },
    set: function(value) {
        if (this.classList && this.classList.contains('price-value')) {
            console.log('🚨 PRICE VALUE CHANGED:', {
                element: this,
                oldValue: this.textContent,
                newValue: value,
                stack: new Error().stack
            });
            priceElements.add(this);
        }
        return originalTextContent.set.call(this, value);
    }
});

// Monitor attribute changes
Element.prototype.setAttribute = function(name, value) {
    if (this.classList && this.classList.contains('price-value')) {
        console.log('🚨 PRICE ATTRIBUTE CHANGED:', {
            element: this,
            attribute: name,
            value: value,
            stack: new Error().stack
        });
    }
    return originalSetAttribute.call(this, name, value);
};

// Monitor DOM mutations
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.classList && node.classList.contains('price-value')) {
                    console.log('🚨 NEW PRICE ELEMENT ADDED TO DOM:', node);
                }
            });
        }
    });
});

// Start observing when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log('👀 DEBUG: DOM Observer started');
    });
} else {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    console.log('👀 DEBUG: DOM Observer started (DOM already ready)');
}

// Log initial state
console.log('📊 DEBUG: Initial state - Price elements found:', document.querySelectorAll('.price-value').length);
document.querySelectorAll('.price-value').forEach((el, i) => {
    console.log(`📊 Price element ${i}:`, {
        text: el.textContent,
        parent: el.parentElement?.className,
        element: el
    });
});

// Monitor every second what's happening
setInterval(() => {
    const currentPrices = Array.from(document.querySelectorAll('.price-value')).map(el => el.textContent);
    console.log('⏰ Current prices:', currentPrices);
}, 1000);

console.log('🔧 DEBUG: Pricing monitor active - check browser console for changes');