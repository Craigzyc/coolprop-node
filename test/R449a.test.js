const coolprop = require('../src/index.js');

describe('R449a Real Values', () => {
    it('should calculate superheat correctly at -40°C saturation', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: -35,  // 5K above saturation temp of -40°C
            pressure: 0,    // saturation pressure at -40°C (from chart)
            refrigerant: 'R449a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat - 5)).toBeLessThan(0.2); // Should be ~5K superheat
    });

    it('should calculate superheat correctly at -20°C saturation', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: -15,  // 5K above saturation temp of -20°C
            pressure: 20.96,    // saturation pressure at -20°C (from chart)
            refrigerant: 'R449a',
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
            pressure: 195,    // saturation pressure at 30°C (from chart)
            refrigerant: 'R449a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });

        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling - 5)).toBeLessThan(0.2); // Should be ~5K subcooling
    });

    it('should calculate subcooling correctly at 40°C saturation', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 35,    // 5K below saturation temp of 40°C
            pressure: 254.2,    // saturation pressure at 40°C (from chart)
            refrigerant: 'R449a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling - 5)).toBeLessThan(0.2); // Should be ~5K subcooling
    });

    it('should calculate zero superheat at saturation point', async () => {
        const result = await coolprop.calculateSuperheat({
            temperature: 0,     // Exact saturation temperature
            pressure: 74.05,    // Matching saturation pressure from chart
            refrigerant: 'R449a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.superheat)).toBeLessThan(0.2); // Should be ~0K superheat
    });

    it('should calculate zero subcooling at saturation point', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 20,    // Exact saturation temperature
            pressure: 146.0,    // Matching saturation pressure from chart
            refrigerant: 'R449a',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling)).toBeLessThan(0.2); // Should be ~0K subcooling
    });

    
    it('It should also work with R449A (capital A)', async () => {
        const result = await coolprop.calculateSubcooling({
            temperature: 20,    // Exact saturation temperature
            pressure: 146.0,    // Matching saturation pressure from chart
            refrigerant: 'R449A',
            tempUnit: 'C',
            pressureUnit: 'psig'
        });
        
        expect(result.type).toBe('success');
        expect(Math.abs(result.subcooling)).toBeLessThan(0.2); // Should be ~0K subcooling
    });
}); 