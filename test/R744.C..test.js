const coolprop = require('../src/index.js');

describe('R744 (CO2) Real Values', () => {
    it('should calculate superheat correctly at -40°C saturation', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: -35,  // 5K above saturation temp of -40°C
            pressure: 9.03,    // saturation pressure at -40°C (from chart)
            refrigerant: 'R744',
            tempUnit: 'C',
            pressureUnit: 'bar'
        });

        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat - 5)).toBeLessThan(0.1); // Should be ~5K superheat
    });

    it('should calculate subcooling correctly at 0°C saturation', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: -5,    // 5K below saturation temp of 0°C
            pressure: 33.84,    // saturation pressure at 0°C (from chart)
            refrigerant: 'R744',
            tempUnit: 'C',
            pressureUnit: 'bar'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling - 5)).toBeLessThan(0.1); // Should be ~5K subcooling
    });

    it('should calculate zero superheat at saturation point', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: -20,   // Exact saturation temperature
            pressure: 18.68,    // Matching saturation pressure from chart
            refrigerant: 'R744',
            tempUnit: 'C',
            pressureUnit: 'bar'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat)).toBeLessThan(0.1); // Should be ~0K superheat
    });

    it('should calculate zero subcooling at saturation point', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 10,    // Exact saturation temperature
            pressure: 44.01,    // Matching saturation pressure from chart
            refrigerant: 'R744',
            tempUnit: 'C',
            pressureUnit: 'bar'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling)).toBeLessThan(0.1); // Should be ~0K subcooling
    });
});