const coolprop = require('../src/index.js');

describe('R448a Real Values', () => {
    it('should calculate superheat correctly at -40°C saturation', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: -35,  // 5K above saturation temp of -40°C
            pressure: 0,    // saturation pressure at -40°C (from chart)
            refrigerant: 'R448a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat - 5)).toBeLessThan(0.2); // Should be ~5K superheat
    });

    it('should calculate superheat correctly at -20°C saturation', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: -15,  // 5K above saturation temp of -20°C
            pressure: 21.0,    // saturation pressure at -20°C (from chart)
            refrigerant: 'R448a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        //console.log(result);
        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat - 5)).toBeLessThan(0.2); // Should be ~5K superheat
    });

    it('should calculate subcooling correctly at 30°C saturation', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 25,    // 5K below saturation temp of 30°C
            pressure: 198.1,    // saturation pressure at 30°C (from chart)
            refrigerant: 'R448a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });

        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling - 5)).toBeLessThan(0.2); // Should be ~5K subcooling
    });

    it('should calculate subcooling correctly at 40°C saturation', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 35,    // 5K below saturation temp of 40°C
            pressure: 258.0,    // saturation pressure at 40°C (from chart)
            refrigerant: 'R448a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling - 5)).toBeLessThan(0.2); // Should be ~5K subcooling
    });

    it('should calculate zero superheat at saturation point', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: 0,     // Exact saturation temperature
            pressure: 60.1,    // Matching saturation pressure from chart
            refrigerant: 'R448a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat)).toBeLessThan(0.2); // Should be ~0K superheat
    });

    it('should calculate zero subcooling at saturation point', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 20,    // Exact saturation temperature
            pressure: 148.5,    // Matching saturation pressure from chart
            refrigerant: 'R448a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling)).toBeLessThan(0.2); // Should be ~0K subcooling
    });

    
    it('It should also work with R448A (capital A)', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 20,    // Exact saturation temperature
            pressure: 148.5,    // Matching saturation pressure from chart
            refrigerant: 'R448A',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling)).toBeLessThan(0.2); // Should be ~0K subcooling
    });
}); 