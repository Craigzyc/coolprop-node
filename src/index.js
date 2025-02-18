const coolprop = require('./cp.js');

class CoolPropWrapper {
    constructor() {
        this.initialized = false;
        this.defaultRefrigerant = null;
        this.defaultTempUnit = 'K';    // K, C, F
        this.defaultPressureUnit = 'Pa' // Pa, kPa, bar, psi
    }

    // Temperature conversion helpers
    _convertTempToK(value, unit = this.defaultTempUnit) {
        switch(unit.toUpperCase()) {
            case 'K': return value;
            case 'C': return value + 273.15;
            case 'F': return (value + 459.67) * 5/9;
            default: throw new Error('Unsupported temperature unit');
        }
    }

    _convertTempFromK(value, unit = this.defaultTempUnit) {
        switch(unit.toUpperCase()) {
            case 'K': return value;
            case 'C': return value - 273.15;
            case 'F': return value * 9/5 - 459.67;
            default: throw new Error('Unsupported temperature unit');
        }
    }

    _convertDeltaTempFromK(value, unit = this.defaultTempUnit) {
        switch(unit.toUpperCase()) {
            case 'K': return value;
            case 'C': return value;
            case 'F': return (value * 1.8) + 32;
            default: throw new Error('Unsupported temperature unit');
        }
    }

    // Pressure conversion helpers
    _convertPressureToPa(value, unit = this.defaultPressureUnit) {
        switch(unit.toUpperCase()) {
            case 'PAA': return value;                    // Absolute Pascal
            case 'PAG':
            case 'PA': return value + 101325;           // Gauge Pascal
            case 'KPAA': return value * 1000;           // Absolute kiloPascal
            case 'KPAG':
            case 'KPA': return value * 1000 + 101325;   // Gauge kiloPascal
            case 'BARA': return value * 100000;         // Absolute bar
            case 'BARG':
            case 'BAR': return value * 100000 + 101325; // Gauge bar
            case 'PSIA': return value * 6894.76;        // Absolute PSI
            case 'PSIG':
            case 'PSI': return value * 6894.76 + 101325;// Gauge PSI
            default: throw new Error('Unsupported pressure unit');
        }
    }

    _convertPressureFromPa(value, unit = this.defaultPressureUnit) {
        switch(unit.toUpperCase()) {
            case 'PAA': return value;                    // Absolute Pascal
            case 'PAG':
            case 'PA': return value - 101325;           // Gauge Pascal
            case 'KPAA': return value / 1000;           // Absolute kiloPascal
            case 'KPAG':
            case 'KPA': return (value - 101325) / 1000; // Gauge kiloPascal
            case 'BARA': return value / 100000;         // Absolute bar
            case 'BARG':
            case 'BAR': return (value - 101325) / 100000;// Gauge bar
            case 'PSIA': return value / 6894.76;        // Absolute PSI
            case 'PSIG':
            case 'PSI': return (value - 101325) / 6894.76;// Gauge PSI
            default: throw new Error('Unsupported pressure unit');
        }
    }

    async init(config = {}) {
        try {
            // If already initialized, only update defaults if provided
            if (this.initialized) {
                if (config.refrigerant) this.defaultRefrigerant = config.refrigerant;
                if (config.tempUnit) {
                    if (!['K', 'C', 'F'].includes(config.tempUnit.toUpperCase())) {
                        return { type: 'error', message: 'Invalid temperature unit. Must be K, C, or F' };
                    }
                    this.defaultTempUnit = config.tempUnit;
                }
                if (config.pressureUnit) {
                    if (!['PA', 'PAA', 'KPA', 'KPAA', 'BAR', 'BARA', 'PSI', 'PSIA'].includes(config.pressureUnit.toUpperCase())) {
                        return { type: 'error', message: 'Invalid pressure unit. Must be Pa, Paa, kPa, kPaa, bar, bara, psi, or psia' };
                    }
                    this.defaultPressureUnit = config.pressureUnit;
                }
                return { type: 'success', message: 'Default settings updated' };
            }

            // First time initialization
            if (!config.refrigerant) {
                throw new Error('Refrigerant must be specified during initialization');
            }

            // Validate temperature unit if provided
            if (config.tempUnit && !['K', 'C', 'F'].includes(config.tempUnit.toUpperCase())) {
                throw new Error('Invalid temperature unit. Must be K, C, or F');
            }

            // Validate pressure unit if provided
            if (config.pressureUnit && !['PA', 'PAA', 'KPA', 'KPAA', 'BAR', 'BARA', 'PSI', 'PSIA'].includes(config.pressureUnit.toUpperCase())) {
                throw new Error('Invalid pressure unit. Must be Pa, Paa, kPa, kPaa, bar, bara, psi, or psia');
            }

            await coolprop.init();
            this.initialized = true;
            this.defaultRefrigerant = config.refrigerant;
            this.defaultTempUnit = config.tempUnit || this.defaultTempUnit;
            this.defaultPressureUnit = config.pressureUnit || this.defaultPressureUnit;
            return { type: 'success', message: 'Initialized successfully' };
        } catch (error) {
            return { type: 'error', message: error.message };
        }
    }

    async _ensureInit(config = {}) {
        // Initialize CoolProp if not already done
        if (!this.initialized) {
            if (!config.refrigerant && !this.defaultRefrigerant) {
                throw new Error('Refrigerant must be specified either during initialization or in the method call');
            }
            await coolprop.init();
            this.initialized = true;
        }

        // Validate temperature unit if provided
        if (config.tempUnit && !['K', 'C', 'F'].includes(config.tempUnit.toUpperCase())) {
            throw new Error('Invalid temperature unit. Must be K, C, or F');
        }

        // Validate pressure unit if provided
        if (config.pressureUnit && !['PA', 'PAA', 'PAG', 'KPA', 'KPAA', 'KPAG', 'BAR', 'BARA', 'BARG', 'PSI', 'PSIA', 'PSIG'].includes(config.pressureUnit.toUpperCase())) {
            throw new Error('Invalid pressure unit. Must be Pa, Paa, Pag, kPa, kPaa, kPag, bar, bara, barg, psi, psia, or psig');
        }

        // Validate refrigerant if provided
        if (config.refrigerant && typeof config.refrigerant !== 'string') {
            throw new Error('Invalid refrigerant type');
        }

        // Update instance variables with new config values if provided
        if (config.refrigerant) this.defaultRefrigerant = config.refrigerant;
        if (config.tempUnit) this.defaultTempUnit = config.tempUnit.toUpperCase();
        if (config.pressureUnit) this.defaultPressureUnit = config.pressureUnit.toUpperCase();
    }

    async getConfig() {
        return {
            refrigerant: this.defaultRefrigerant,
            tempUnit: this.defaultTempUnit,
            pressureUnit: this.defaultPressureUnit
        };
    }

    async setConfig(config) {
        await this.init(config);
        return {
            type: 'success',
            message: 'Config updated successfully',
            config: await this.getConfig()
        };
    }

    async getSaturationTemperature({ pressure, refrigerant = this.defaultRefrigerant, pressureUnit = this.defaultPressureUnit, tempUnit = this.defaultTempUnit }) {
        try {
            await this._ensureInit({ refrigerant, pressureUnit, tempUnit });
            const pressurePa = this._convertPressureToPa(pressure, pressureUnit);
            const tempK = coolprop.PropsSI('T', 'P', pressurePa, 'Q', 0, refrigerant);
            return {
                type: 'success',
                temperature: this._convertTempFromK(tempK, tempUnit),
                refrigerant,
                units: {
                    temperature: tempUnit,
                    pressure: pressureUnit
                }
            };
        } catch (error) {
            return { type: 'error', message: error.message };
        }
    }

    async getSaturationPressure({ temperature, refrigerant = this.defaultRefrigerant, tempUnit = this.defaultTempUnit, pressureUnit = this.defaultPressureUnit }) {
        try {
            await this._ensureInit({ refrigerant, tempUnit, pressureUnit });
            const tempK = this._convertTempToK(temperature, tempUnit);
            const pressurePa = coolprop.PropsSI('P', 'T', tempK, 'Q', 0, refrigerant);
            return {
                type: 'success',
                pressure: this._convertPressureFromPa(pressurePa, pressureUnit),
                refrigerant,
                units: {
                    temperature: tempUnit,
                    pressure: pressureUnit
                }
            };
        } catch (error) {
            return { type: 'error', message: error.message };
        }
    }

    async calculateSubcooling({ temperature, pressure, refrigerant = this.defaultRefrigerant, tempUnit = this.defaultTempUnit, pressureUnit = this.defaultPressureUnit }) {
        try {
            await this._ensureInit({ refrigerant, tempUnit, pressureUnit });
            const tempK = this._convertTempToK(temperature, tempUnit);
            const pressurePa = this._convertPressureToPa(pressure, pressureUnit);
            const satTempK = coolprop.PropsSI('T', 'P', pressurePa, 'Q', 0, refrigerant);
            const subcooling = satTempK - tempK;
            const result = {
                type: 'success',
                subcooling: this._convertDeltaTempFromK(subcooling, tempUnit),
                saturationTemperature: this._convertTempFromK(satTempK, tempUnit),
                refrigerant,
                units: {
                    temperature: tempUnit,
                    pressure: pressureUnit
                }
            };
            if(result.subcooling == Infinity && result.saturationTemperature == Infinity) {
                return { type: 'error', message: 'Subcooling is infinity', note: 'If the pressures are in an expected range that this should work, please check your refrigerant type works in coolprop. "R507" for example is not supported, as it needs to be "R507a"'};
            }
            return result;
        } catch (error) {
            return { type: 'error', message: error.message };
        }
    }

    async calculateSuperheat({ temperature, pressure, refrigerant = this.defaultRefrigerant, tempUnit = this.defaultTempUnit, pressureUnit = this.defaultPressureUnit }) {
        try {
            await this._ensureInit({ refrigerant, tempUnit, pressureUnit });
            const tempK = this._convertTempToK(temperature, tempUnit);
            const pressurePa = this._convertPressureToPa(pressure, pressureUnit);
            const satTempK = coolprop.PropsSI('T', 'P', pressurePa, 'Q', 1, refrigerant);
            const superheat = tempK - satTempK;
            const result = {
                type: 'success',
                superheat: this._convertDeltaTempFromK(superheat, tempUnit),
                saturationTemperature: this._convertTempFromK(satTempK, tempUnit),
                refrigerant,
                units: {
                    temperature: tempUnit,
                    pressure: pressureUnit
                }
            };
            if(result.superheat == Infinity && result.saturationTemperature == Infinity) {
                return { type: 'error', message: 'Superheat is infinity', note: 'If the pressures are in an expected range that this should work, please check your refrigerant type works in coolprop. "R507" for example is not supported, as it needs to be "R507a"'};
            }
            return result;
        } catch (error) {
            return { type: 'error', message: error.message };
        }
    }

    async getProperties({ temperature, pressure, refrigerant = this.defaultRefrigerant, tempUnit = this.defaultTempUnit, pressureUnit = this.defaultPressureUnit }) {
        try {
            await this._ensureInit({ refrigerant, tempUnit, pressureUnit });
            const tempK = this._convertTempToK(temperature, tempUnit);
            const pressurePa = this._convertPressureToPa(pressure, pressureUnit);
            
            const props = {
                temperature: this._convertTempFromK(tempK, tempUnit),
                pressure: this._convertPressureFromPa(pressurePa, pressureUnit),
                density: coolprop.PropsSI('D', 'T', tempK, 'P', pressurePa, refrigerant),
                enthalpy: coolprop.PropsSI('H', 'T', tempK, 'P', pressurePa, refrigerant),
                entropy: coolprop.PropsSI('S', 'T', tempK, 'P', pressurePa, refrigerant),
                quality: coolprop.PropsSI('Q', 'T', tempK, 'P', pressurePa, refrigerant),
                conductivity: coolprop.PropsSI('L', 'T', tempK, 'P', pressurePa, refrigerant),
                viscosity: coolprop.PropsSI('V', 'T', tempK, 'P', pressurePa, refrigerant),
                specificHeat: coolprop.PropsSI('C', 'T', tempK, 'P', pressurePa, refrigerant)
            };

            return {
                type: 'success',
                properties: props,
                refrigerant,
                units: {
                    temperature: tempUnit,
                    pressure: pressureUnit,
                    density: 'kg/m³',
                    enthalpy: 'J/kg',
                    entropy: 'J/kg/K',
                    quality: 'dimensionless',
                    conductivity: 'W/m/K',
                    viscosity: 'Pa·s',
                    specificHeat: 'J/kg/K'
                }
            };
        } catch (error) {
            return { type: 'error', message: error.message };
        }
    }

    // Direct access to CoolProp functions
    get PropsSI() {
        this._ensureInit();
        return coolprop.PropsSI;
    }
}

module.exports = new CoolPropWrapper();
