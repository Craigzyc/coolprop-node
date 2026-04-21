const coolprop = require('../src/index.js');

describe('R402A Real Values', () => {
    it('should calculate superheat correctly at -40°F saturation', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: -30,   // 10°F above saturation at -40°F
            pressure: 6.3,      // saturation pressure at -40°F (from chart)
            refrigerant: 'R402A',
            tempUnit: 'F',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat - 10)).toBeLessThan(0.3); // ~10°F superheat
    });

    it('should calculate superheat correctly at 0°F saturation', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: 10,    // 10°F above saturation at 0°F
            pressure: 36.7,     // saturation pressure at 0°F (from chart)
            refrigerant: 'R402A',
            tempUnit: 'F',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat - 10)).toBeLessThan(0.3);
    });

    it('should calculate subcooling correctly at 90°F saturation', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 80,    // 10°F below saturation at 90°F
            pressure: 215.0,    // saturation pressure at 90°F (from chart)
            refrigerant: 'R402A',
            tempUnit: 'F',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling - 10)).toBeLessThan(0.3);
    });

    it('should calculate subcooling correctly at 120°F saturation', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 110,   // 10°F below saturation at 120°F
            pressure: 326.0,    // saturation pressure at 120°F (from chart)
            refrigerant: 'R402A',
            tempUnit: 'F',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling - 10)).toBeLessThan(0.3);
    });

    it('should calculate zero superheat at saturation point', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: 50,    // exact saturation temp
            pressure: 112.0,    // saturation pressure at 50°F (from chart)
            refrigerant: 'R402A',
            tempUnit: 'F',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat)).toBeLessThan(0.3);
    });

    it('should calculate zero subcooling at saturation point', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 70,    // exact saturation temp
            pressure: 158.0,    // saturation pressure at 70°F (from chart)
            refrigerant: 'R402A',
            tempUnit: 'F',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling)).toBeLessThan(0.3);
    });

    it('should return saturation temperature matching chart at 100°F / 249 psig', async () => {
        const result = await coolprop.getSaturationTemperature({
            pressure: 249.0,
            refrigerant: 'R402A',
            tempUnit: 'F',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.temperature - 100)).toBeLessThan(0.3);
    });

    it('should return saturation pressure matching chart at 50°F', async () => {
        const result = await coolprop.getSaturationPressure({
            temperature: 50,
            refrigerant: 'R402A',
            tempUnit: 'F',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.pressure - 112.0)).toBeLessThan(0.5);
    });

    it('should also work with R402a (lowercase a)', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 90,    // exact saturation temp
            pressure: 215.0,    // saturation pressure at 90°F (from chart)
            refrigerant: 'R402a',
            tempUnit: 'F',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling)).toBeLessThan(0.3);
    });
});
