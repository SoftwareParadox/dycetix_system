// Pricing configuration for all service sections
const PRICING_CONFIG = {
    'custom-software': {
        basePrices: {
            startup: 50000,
            enterprise: 175000
        },
        multipliers: {
            USD: 0.054,
            GBP: 0.042,
            EUR: 0.048,
            ZAR: 1.0
        },
        adjustments: {
            startup: { USD: 0, GBP: 0, EUR: 0, ZAR: 0 },
            enterprise: { USD: 0, GBP: 0, EUR: 0, ZAR: 0 }
        },
        symbols: {
            USD: '$',
            GBP: '£',
            EUR: '€',
            ZAR: 'R'
        },
        structure: 'standard'
    },
    'web-development': {
        basePrices: {
            basic: 25000,
            ecommerce: 75000
        },
        multipliers: {
            USD: 0.054,
            GBP: 0.042,
            EUR: 0.048,
            ZAR: 1.0
        },
        adjustments: {
            basic: { USD: 0, GBP: 0, EUR: 0, ZAR: 0 },
            ecommerce: { USD: 0, GBP: 0, EUR: 0, ZAR: 0 }
        },
        symbols: {
            USD: '$',
            GBP: '£',
            EUR: '€',
            ZAR: 'R'
        },
        structure: 'standard'
    },
    'mobile-development': {
        basePrices: {
            foundation: 100000,
            growth: 250000
        },
        multipliers: {
            USD: 0.054,
            GBP: 0.042,
            EUR: 0.048,
            ZAR: 1.0
        },
        adjustments: {
            foundation: { USD: 0, GBP: 0, EUR: 0, ZAR: 0 },
            growth: { USD: 0, GBP: 0, EUR: 0, ZAR: 0 }
        },
        symbols: {
            USD: '$',
            GBP: '£',
            EUR: '€',
            ZAR: 'R'
        },
        structure: 'standard'
    },
    'desktop-development': {
        basePrices: {
            starter: 75000,
            professional: 200000
        },
        multipliers: {
            USD: 0.054,
            GBP: 0.042,
            EUR: 0.048,
            ZAR: 1.0
        },
        adjustments: {
            starter: { USD: 0, GBP: 0, EUR: 0, ZAR: 0 },
            professional: { USD: 0, GBP: 0, EUR: 0, ZAR: 0 }
        },
        symbols: {
            USD: '$',
            GBP: '£',
            EUR: '€',
            ZAR: 'R'
        },
        structure: 'standard'
    },
    'database-development': {
        basePrices: {
            starter: 80000,
            professional: 150000
        },
        multipliers: {
            USD: 0.054,
            GBP: 0.042,
            EUR: 0.048,
            ZAR: 1.0
        },
        adjustments: {
            starter: { USD: 0, GBP: 0, EUR: 0, ZAR: 0 },
            professional: { USD: 0, GBP: 0, EUR: 0, ZAR: 0 }
        },
        symbols: {
            USD: '$',
            GBP: '£',
            EUR: '€',
            ZAR: 'R'
        },
        structure: 'standard'
    },
    'graphic-design': {
        basePrices: {
            businesscards: 1500,
            logo: 2000,
            flyer: 1000,
            socials: 1200,
            web: 2000,
            email: 1200,
            posters: 3000,
            packaging: 1200
        },
        multipliers: {
            USD: 0.054,
            GBP: 0.042,
            EUR: 0.048,
            ZAR: 1.0
        },
        adjustments: {
            businesscards: { USD: 30, GBP: 20, EUR: 25, ZAR: 0 },
            logo: { USD: 30, GBP: 20, EUR: 25, ZAR: 0 },
            flyer: { USD: 30, GBP: 20, EUR: 25, ZAR: 0 },
            socials: { USD: 30, GBP: 20, EUR: 25, ZAR: 0 },
            web: { USD: 30, GBP: 20, EUR: 25, ZAR: 0 },
            email: { USD: 30, GBP: 20, EUR: 25, ZAR: 0 },
            posters: { USD: 30, GBP: 20, EUR: 25, ZAR: 0 },
            packaging: { USD: 30, GBP: 20, EUR: 25, ZAR: 0 }
        },
        symbols: {
            USD: '$',
            GBP: '£',
            EUR: '€',
            ZAR: 'R'
        },
        structure: 'graphic-design'
    },
    'photography-videography': {
        basePrices: {
            halfday: 2500,
            fullday: 8000
        },
        multipliers: {
            USD: 0.054,
            GBP: 0.042,
            EUR: 0.048,
            ZAR: 1.0
        },
        adjustments: {
            halfday: { USD: 0, GBP: 0, EUR: 0, ZAR: 0 },
            fullday: { USD: 0, GBP: 0, EUR: 0, ZAR: 0 }
        },
        symbols: {
            USD: '$',
            GBP: '£',
            EUR: '€',
            ZAR: 'R'
        },
        structure: 'standard'
    },
};

// Multi-Section Currency Converter
class EnhancedMultiSectionCurrencyConverter {
    constructor() {
        this.currentCurrency = 'ZAR';
        console.log('💰 Enhanced Multi-Section Currency Converter Initialized');
        this.init();
    }
    
    async init() {
        try {
            // Check for URL parameter override first (for testing)
            const urlCurrency = this.getUrlCurrency();
            if (urlCurrency) {
                this.currentCurrency = urlCurrency;
                console.log(`🎯 Currency forced via URL: ${this.currentCurrency}`);
            } 
            // Use ZAR for local development
            else if (this.isLocalEnvironment()) {
                this.currentCurrency = 'ZAR';
                console.log('🏠 Local environment - using ZAR');
            }
            // Detect currency for production
            else {
                this.currentCurrency = await this.detectCurrencyByIP();
                console.log(`🌍 Detected currency: ${this.currentCurrency}`);
            }
            
            this.updateAllSections();
            
        } catch (error) {
            console.error('❌ Currency detection failed:', error);
            this.currentCurrency = 'USD';
            this.updateAllSections();
        }
    }
    
    isLocalEnvironment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('.local');
    }
    
    getUrlCurrency() {
        const urlParams = new URLSearchParams(window.location.search);
        const currency = urlParams.get('currency');
        return ['ZAR', 'USD', 'GBP', 'EUR'].includes(currency) ? currency : null;
    }
    
    async detectCurrencyByIP() {
        try {
            // Use a simple, reliable IP geolocation API
            const response = await fetch('https://api.country.is/');
            const data = await response.json();
            const country = data.country;
            
            console.log(`🗺️ IP Detection - Country: ${country}`);
            
            // Simple mapping
            if (country === 'ZA') return 'ZAR';
            if (country === 'GB') return 'GBP';
            if (['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'PT', 'IE'].includes(country)) return 'EUR';
            return 'USD';
            
        } catch (error) {
            console.log('❌ IP detection failed, using USD as fallback');
            return 'USD';
        }
    }
    
    updateAllSections() {
        console.log(`🔄 Updating all sections to ${this.currentCurrency}`);
        
        // Find all pricing sections
        const pricingSections = document.querySelectorAll('[data-pricing-section]');
        console.log(`📊 Found ${pricingSections.length} pricing sections`);
        
        pricingSections.forEach(section => {
            const sectionName = section.getAttribute('data-pricing-section');
            const config = PRICING_CONFIG[sectionName];
            
            if (!config) {
                console.log(`❌ No config found for section: ${sectionName}`);
                return;
            }
            
            console.log(`🔄 Updating section: ${sectionName}`);
            
            // Use different update methods based on section structure
            if (config.structure === 'graphic-design') {
                this.updateGraphicDesignSection(section, config);
            } else {
                this.updateStandardSection(section, config);
            }
        });
        
        console.log('✅ All sections updated successfully');
    }
    
    updateStandardSection(section, config) {
        const priceCards = section.querySelectorAll('.price-card[data-tier]');
        
        priceCards.forEach(card => {
            const tier = card.dataset.tier;
            
            // Skip if no base price (like custom tier)
            if (!card.hasAttribute('data-base-price')) {
                console.log(`⏭️ Skipping ${tier} tier (no base price)`);
                return;
            }
            
            if (this.updateStandardCardPrice(card, tier, config)) {
                console.log(`✅ ${section.dataset.pricingSection} - ${tier}: ${config.symbols[this.currentCurrency]}${this.calculatePrice(tier, config, this.currentCurrency).toLocaleString()}`);
            }
        });
    }
    
    updateGraphicDesignSection(section, config) {
        console.log('🎨 Processing graphic design section...');
        
        // Update dy-prices elements (visual section)
        const dyPriceElements = section.querySelectorAll('.dy-prices[data-tier]');
        dyPriceElements.forEach(element => {
            const tier = element.dataset.tier;
            this.updateGraphicDesignPrice(element, tier, config);
        });
        
        // Update service list prices
        const servicePriceElements = section.querySelectorAll('.dy-service-list [data-tier]');
        servicePriceElements.forEach(element => {
            const tier = element.dataset.tier;
            this.updateGraphicDesignPrice(element, tier, config);
        });
    }
    
    updateStandardCardPrice(card, tier, config) {
        try {
            const finalPrice = this.calculatePrice(tier, config, this.currentCurrency);
            const priceElement = card.querySelector('.price-value');
            const currencyElement = card.querySelector('.currency');
            
            if (!priceElement) {
                console.log(`❌ No .price-value element found in ${tier} card`);
                return false;
            }
            
            if (!currencyElement) {
                console.log(`❌ No .currency element found in ${tier} card`);
                return false;
            }
            
            // Update display
            priceElement.textContent = finalPrice.toLocaleString();
            currencyElement.textContent = config.symbols[this.currentCurrency];
            
            // Update schema data
            this.updateCardSchemaData(card, finalPrice, this.currentCurrency);
            
            return true;
            
        } catch (error) {
            console.log(`❌ Error updating ${tier} card:`, error);
            return false;
        }
    }
    
    updateGraphicDesignPrice(element, tier, config) {
        try {
            const finalPrice = this.calculatePrice(tier, config, this.currentCurrency);
            
            // Find the price span inside the element
            const priceSpan = element.querySelector('span[itemprop="price"]');
            
            if (!priceSpan) {
                console.log(`❌ No price span found in ${tier} element`);
                return false;
            }
            
            // Update the price span with new currency and price
            priceSpan.textContent = config.symbols[this.currentCurrency] + finalPrice.toLocaleString();
            
            // Update schema data
            priceSpan.setAttribute('content', finalPrice.toString());
            
            // Update currency in meta tag if it exists
            const currencyMeta = element.querySelector('meta[itemprop="priceCurrency"]');
            if (currencyMeta) {
                currencyMeta.setAttribute('content', this.currentCurrency);
            }
            
            console.log(`✅ Graphic Design - ${tier}: ${config.symbols[this.currentCurrency]}${finalPrice.toLocaleString()}`);
            return true;
            
        } catch (error) {
            console.log(`❌ Error updating graphic design ${tier}:`, error);
            return false;
        }
    }
    
    calculatePrice(tier, config, currency) {
        const basePrice = config.basePrices[tier];
        const multiplier = config.multipliers[currency];
        const adjustment = config.adjustments[tier][currency];
        
        console.log(`🧮 Calculating ${tier}: ${basePrice} × ${multiplier} + ${adjustment}`);
        
        let price = basePrice * multiplier;
        price = this.roundToAppealing(price, currency);
        price += adjustment;
        
        console.log(`📈 Final ${tier} price: ${price}`);
        return price;
    }
    
    roundToAppealing(price, currency) {
        const roundingRules = {
            USD: 50,
            EUR: 50,
            GBP: 25,
            ZAR: 100
        };
        
        const roundTo = roundingRules[currency] || 50;
        return Math.round(price / roundTo) * roundTo;
    }
    
    updateCardSchemaData(card, price, currency) {
        const priceElement = card.querySelector('[itemprop="price"]');
        const currencyElement = card.querySelector('[itemprop="priceCurrency"]');
        
        if (priceElement) {
            priceElement.setAttribute('content', price.toString());
        }
        
        if (currencyElement) {
            currencyElement.setAttribute('content', currency);
        }
    }
}

// Initialize with error handling
function initializeEnhancedConverter() {
    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => new EnhancedMultiSectionCurrencyConverter(), 100);
            });
        } else {
            setTimeout(() => new EnhancedMultiSectionCurrencyConverter(), 100);
        }
    } catch (error) {
        console.error('💥 Failed to initialize enhanced converter:', error);
    }
}

// Start the converter
initializeEnhancedConverter();

// Export for debugging
window.CurrencyConverter = EnhancedMultiSectionCurrencyConverter;
window.PricingConfig = PRICING_CONFIG;