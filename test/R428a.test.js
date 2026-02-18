const coolprop = require('../src/index.js');

describe('R428a Real Values', () => {
    it('should calculate superheat correctly at -40°C saturation', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: -35,   // 5K above saturation temp of -40°C
            pressure: 6.19,     // vapor saturation pressure at -40°C (from chart)
            refrigerant: 'R428a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat - 5)).toBeLessThan(0.2); // Should be ~5K superheat
    });

    it('should calculate superheat correctly at -20°C saturation', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: -15,   // 5K above saturation temp of -20°C
            pressure: 32.67,    // vapor saturation pressure at -20°C (from chart)
            refrigerant: 'R428a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat - 5)).toBeLessThan(0.2); // Should be ~5K superheat
    });

    it('should calculate subcooling correctly at 30°C saturation', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 25,    // 5K below saturation temp of 30°C
            pressure: 206.99,   // liquid saturation pressure at 30°C (from chart)
            refrigerant: 'R428a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling - 5)).toBeLessThan(0.2); // Should be ~5K subcooling
    });

    it('should calculate subcooling correctly at 40°C saturation', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 35,    // 5K below saturation temp of 40°C
            pressure: 268.60,   // liquid saturation pressure at 40°C (from chart)
            refrigerant: 'R428a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling - 5)).toBeLessThan(0.2); // Should be ~5K subcooling
    });

    it('should calculate zero superheat at saturation point', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: 0,     // Exact saturation temperature
            pressure: 79.27,    // Matching vapor saturation pressure at 0°C (from chart)
            refrigerant: 'R428a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat)).toBeLessThan(0.2); // Should be ~0K superheat
    });

    it('should calculate zero subcooling at saturation point', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 20,    // Exact saturation temperature
            pressure: 156.03,   // Matching liquid saturation pressure at 20°C (from chart)
            refrigerant: 'R428a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling)).toBeLessThan(0.2); // Should be ~0K subcooling
    });

    it('should also work with R428A (capital A)', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 20,    // Exact saturation temperature
            pressure: 156.03,   // Matching liquid saturation pressure at 20°C (from chart)
            refrigerant: 'R428A',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling)).toBeLessThan(0.2); // Should be ~0K subcooling
    });
});
