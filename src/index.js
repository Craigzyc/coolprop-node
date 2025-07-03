const coolprop = require('./cp.js');
const customRefs = require('./refData.js');

class CoolPropWrapper {
    constructor() {
        this.initialized = false;
        this.defaultRefrigerant = null;
        this.defaultTempUnit = 'K';    // K, C, F
        this.defaultPressureUnit = 'Pa' // Pa, kPa, bar, psi
        this.customRef = false;
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
            case 'F': return (value * 1.8);
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
        if (config.refrigerant && Object.keys(customRefs).includes(config.refrigerant)) {
            this.customRef = true;
            this.defaultRefrigerant = config.refrigerant;
            //console.log(`Using custom refrigerant flag for ${this.defaultRefrigerant}`);
        }else if(this.customRef && config.refrigerant){
            this.customRef = false;
            //console.log(`Cleared custom refrigerant flag`);
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

    // Helper method for linear interpolation/extrapolation
    _interpolateSaturationTemperature(pressurePa, saturationData, pressureType = 'liquid') {
        const data = saturationData.sort((a, b) => a[pressureType] - b[pressureType]); // Sort by specified pressure type
        
        // If pressure is below the lowest data point, extrapolate using first two points
        if (pressurePa <= data[0][pressureType]) {
            if (data.length < 2) return data[0].K;
            const p1 = data[0], p2 = data[1];
            const slope = (p2.K - p1.K) / (p2[pressureType] - p1[pressureType]);
            return p1.K + slope * (pressurePa - p1[pressureType]);
        }
        
        // If pressure is above the highest data point, extrapolate using last two points
        if (pressurePa >= data[data.length - 1][pressureType]) {
            if (data.length < 2) return data[data.length - 1].K;
            const p1 = data[data.length - 2], p2 = data[data.length - 1];
            const slope = (p2.K - p1.K) / (p2[pressureType] - p1[pressureType]);
            return p1.K + slope * (pressurePa - p1[pressureType]);
        }
        
        // Find the two adjacent points for interpolation
        for (let i = 0; i < data.length - 1; i++) {
            if (pressurePa >= data[i][pressureType] && pressurePa <= data[i + 1][pressureType]) {
                const p1 = data[i], p2 = data[i + 1];
                
                // Linear interpolation
                const slope = (p2.K - p1.K) / (p2[pressureType] - p1[pressureType]);
                return p1.K + slope * (pressurePa - p1[pressureType]);
            }
        }
        
        // Fallback (shouldn't reach here)
        return data[0].K;
    }

    // Helper method for linear interpolation/extrapolation of saturation pressure
    _interpolateSaturationPressure(tempK, saturationData, pressureType = 'liquid') {
        const data = saturationData.sort((a, b) => a.K - b.K); // Sort by temperature
        
        // If temperature is below the lowest data point, extrapolate using first two points
        if (tempK <= data[0].K) {
            if (data.length < 2) return data[0][pressureType];
            const p1 = data[0], p2 = data[1];
            const slope = (p2[pressureType] - p1[pressureType]) / (p2.K - p1.K);
            return p1[pressureType] + slope * (tempK - p1.K);
        }
        
        // If temperature is above the highest data point, extrapolate using last two points
        if (tempK >= data[data.length - 1].K) {
            if (data.length < 2) return data[data.length - 1][pressureType];
            const p1 = data[data.length - 2], p2 = data[data.length - 1];
            const slope = (p2[pressureType] - p1[pressureType]) / (p2.K - p1.K);
            return p1[pressureType] + slope * (tempK - p1.K);
        }
        
        // Find the two adjacent points for interpolation
        for (let i = 0; i < data.length - 1; i++) {
            if (tempK >= data[i].K && tempK <= data[i + 1].K) {
                const p1 = data[i], p2 = data[i + 1];
                
                // Linear interpolation
                const slope = (p2[pressureType] - p1[pressureType]) / (p2.K - p1.K);
                return p1[pressureType] + slope * (tempK - p1.K);
            }
        }
        
        // Fallback (shouldn't reach here)
        return data[0][pressureType];
    }

    async getSaturationTemperature({ pressure, refrigerant = this.defaultRefrigerant, pressureUnit = this.defaultPressureUnit, tempUnit = this.defaultTempUnit }) {
        try {
            await this._ensureInit({ refrigerant, pressureUnit, tempUnit });
            const pressurePa = this._convertPressureToPa(pressure, pressureUnit);
            let tempK;
            if(this.customRef){
                tempK = this._interpolateSaturationTemperature(pressurePa, customRefs[refrigerant].saturation);
            }else{
                tempK = coolprop.PropsSI('T', 'P', pressurePa, 'Q', 0, this.customRefString || refrigerant);
            }
                        
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
            let pressurePa;
            
            if(this.customRef){
                pressurePa = this._interpolateSaturationPressure(tempK, customRefs[refrigerant].saturation);
            }else{
                pressurePa = coolprop.PropsSI('P', 'T', tempK, 'Q', 0, this.customRefString || refrigerant);
            }
            
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
            let satTempK;
            if(this.customRef){
                // Use liquid pressure for subcooling
                satTempK = this._interpolateSaturationTemperature(pressurePa, customRefs[refrigerant].saturation, 'liquid');
            }else{
                satTempK = coolprop.PropsSI('T', 'P', pressurePa, 'Q', 0, this.customRefString || refrigerant);
            }
            const subcooling = satTempK - tempK;
            const result = {
                type: 'success',
                subcooling: Math.max(0, this._convertDeltaTempFromK(subcooling, tempUnit)), // can't have less than 0 degrees subcooling
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
            //console.log(`In calculateSuperheat, pressurePa: ${pressurePa}, pressure: ${pressure}, pressureUnit: ${pressureUnit}, refrigerant: ${this.customRefString || refrigerant}`);
            let satTempK;
            if(this.customRef){
                // Use vapor pressure for superheat
                satTempK = this._interpolateSaturationTemperature(pressurePa, customRefs[refrigerant].saturation, 'vapor');
            }else{
                satTempK = coolprop.PropsSI('T', 'P', pressurePa, 'Q', 1, this.customRefString || refrigerant);
            }
            const superheat = tempK - satTempK;
            //console.log(`superheat: ${superheat}, calculatedSuperheat: ${this._convertDeltaTempFromK(superheat, tempUnit)}, calculatedSatTempK: ${this._convertTempFromK(satTempK, tempUnit)}, tempK: ${tempK}, tempUnit: ${tempUnit}, pressurePa: ${pressurePa}, pressureUnit: ${pressureUnit}`);
            const result = {
                type: 'success',
                superheat: Math.max(0, this._convertDeltaTempFromK(superheat, tempUnit)), // can't have less than 0 degrees superheat
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
            if(this.customRef){
                return { type: 'error', message: 'Custom refrigerants are not supported for getProperties' };
            }
            
            const props = {
                temperature: this._convertTempFromK(tempK, tempUnit),
                pressure: this._convertPressureFromPa(pressurePa, pressureUnit),
                density: coolprop.PropsSI('D', 'T', tempK, 'P', pressurePa, this.customRefString || refrigerant),
                enthalpy: coolprop.PropsSI('H', 'T', tempK, 'P', pressurePa, this.customRefString || refrigerant),
                entropy: coolprop.PropsSI('S', 'T', tempK, 'P', pressurePa, this.customRefString || refrigerant),
                quality: coolprop.PropsSI('Q', 'T', tempK, 'P', pressurePa, this.customRefString || refrigerant),
                conductivity: coolprop.PropsSI('L', 'T', tempK, 'P', pressurePa, this.customRefString || refrigerant),
                viscosity: coolprop.PropsSI('V', 'T', tempK, 'P', pressurePa, this.customRefString || refrigerant),
                specificHeat: coolprop.PropsSI('C', 'T', tempK, 'P', pressurePa, this.customRefString || refrigerant)
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
    async getPropsSI() {
        if(!this.initialized) {
            await coolprop.init();
        }
        return coolprop.PropsSI;
    }
}

module.exports = new CoolPropWrapper();
