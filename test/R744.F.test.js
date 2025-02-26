const coolprop = require('../src/index.js');

describe('R744 (CO2) Real Values', () => {
    it('should calculate superheat correctly at -40°F saturation', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: -35,   // 5°F above saturation temp of -40°F
            pressure: 131,     // saturation pressure at -40°F (from chart)
            refrigerant: 'R744',
            tempUnit: 'F',      // Changed to F
            pressureUnit: 'psig'
        });

        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat - 5)).toBeLessThan(0.1); // Should be ~5°F superheat
    });

    it('should calculate subcooling correctly at 32°F saturation', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 27,    // 5°F below saturation temp of 32°F
            pressure: 490.8,    // saturation pressure at 32°F (from chart)
            refrigerant: 'R744',
            tempUnit: 'F',      // Changed to F
            pressureUnit: 'psig'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling - 5)).toBeLessThan(0.1); // Should be ~5°F subcooling
    });

    it('should calculate zero superheat at saturation point', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: 32,    // Exact saturation temperature
            pressure: 490.8,    // Matching saturation pressure from chart
            refrigerant: 'R744',
            tempUnit: 'F',      // Changed to F
            pressureUnit: 'psig'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat)).toBeLessThan(0.1); // Should be ~0°F superheat
    });

    it('should calculate zero subcooling at saturation point', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 32,    // Exact saturation temperature
            pressure: 490.8,    // Matching saturation pressure from chart
            refrigerant: 'R744',
            tempUnit: 'F',      // Changed to F
            pressureUnit: 'psig'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling)).toBeLessThan(0.1); // Should be ~0°F subcooling
    });
});