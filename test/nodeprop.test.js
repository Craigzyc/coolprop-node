const coolprop = require('../src/index.js');

describe('CoolProp Wrapper', () => {
    describe('Initialization', () => {
        it('should fail without refrigerant', async () => {
            const result = await coolprop.init({});
            expect(result.type).toBe('error');
            expect(result.message).toContain('Refrigerant must be specified');
        });

        it('should fail with invalid temperature unit', async () => {
            const result = await coolprop.init({ refrigerant: 'R404A', tempUnit: 'X' });
            expect(result.type).toBe('error');
            expect(result.message).toContain('Invalid temperature unit');
        });

        it('should fail with invalid pressure unit', async () => {
            const result = await coolprop.init({ refrigerant: 'R404A', pressureUnit: 'X' });
            expect(result.type).toBe('error');
            expect(result.message).toContain('Invalid pressure unit');
        });

        it('should succeed with valid config', async () => {
            const result = await coolprop.init({ 
                refrigerant: 'R404A', 
                tempUnit: 'C', 
                pressureUnit: 'bar' 
            });
            console.log(result);
            expect(result.type).toBe('success');
        });
    });

    describe('Auto-initialization', () => {
        it('should work without explicit init', async () => {
            const result = await coolprop.calculateSuperheat({
                temperature: 25,
                pressure: 10,
                refrigerant: 'R404A',
                tempUnit: 'C',
                pressureUnit: 'bar'
            });
            expect(result.type).toBe('success');
            expect(result.superheat).toBeDefined();
        });
    });

    describe('Unit Conversions', () => {
        it('should correctly convert temperature units', async () => {
            const resultC = await coolprop.getSaturationTemperature({
                pressure: 10,
                refrigerant: 'R404A',
                pressureUnit: 'bar',
                tempUnit: 'C'
            });

            const resultF = await coolprop.getSaturationTemperature({
                pressure: 10,
                refrigerant: 'R404A',
                pressureUnit: 'bar',
                tempUnit: 'F'
            });

            const resultK = await coolprop.getSaturationTemperature({
                pressure: 10,
                refrigerant: 'R404A',
                pressureUnit: 'bar',
                tempUnit: 'K'
            });

            expect(Math.abs((resultC.temperature * 9/5 + 32) - resultF.temperature)).toBeLessThan(0.01);
            expect(Math.abs((resultC.temperature + 273.15) - resultK.temperature)).toBeLessThan(0.01);
        });

        it('should correctly convert pressure units', async () => {
            const resultBar = await coolprop.getSaturationPressure({
                temperature: 25,
                refrigerant: 'R404A',
                tempUnit: 'C',
                pressureUnit: 'bar'
            });

            const resultPsi = await coolprop.getSaturationPressure({
                temperature: 25,
                refrigerant: 'R404A',
                tempUnit: 'C',
                pressureUnit: 'psi'
            });

            expect(Math.abs((resultBar.pressure * 14.5038) - resultPsi.pressure)).toBeLessThan(0.1);
        });
    });

    describe('Refrigerant Calculations', () => {
        const refrigerants = ['R404A', 'R134a', 'R507A', 'R744'];

        refrigerants.forEach(refrigerant => {
            describe(refrigerant, () => {
                it('should calculate superheat', async () => {
                    const result = await coolprop.calculateSuperheat({
                        temperature: 25,
                        pressure: 10,
                        refrigerant,
                        tempUnit: 'C',
                        pressureUnit: 'bar'
                    });
                    expect(result.type).toBe('success');
                    expect(result.superheat).toBeDefined();
                    expect(result.refrigerant).toBe(refrigerant);
                    expect(result.units).toEqual(expect.objectContaining({
                        temperature: 'C',
                        pressure: 'bar'
                    }));
                });

                it('should calculate subcooling', async () => {
                    const result = await coolprop.calculateSubcooling({
                        temperature: 20,
                        pressure: 20,
                        refrigerant,
                        tempUnit: 'C',
                        pressureUnit: 'bar'
                    });
                    expect(result.type).toBe('success');
                    expect(result.subcooling).toBeDefined();
                    expect(result.refrigerant).toBe(refrigerant);
                });

                it('should get all properties', async () => {
                    const result = await coolprop.getProperties({
                        temperature: 25,
                        pressure: 10,
                        refrigerant,
                        tempUnit: 'C',
                        pressureUnit: 'bar'
                    });
                    expect(result.type).toBe('success');
                    expect(result.properties).toBeDefined();
                    expect(result.refrigerant).toBe(refrigerant);
                    
                    // Check all required properties exist
                    const requiredProps = [
                        'temperature', 'pressure', 'density', 'enthalpy',
                        'entropy', 'quality', 'conductivity', 'viscosity', 'specificHeat'
                    ];
                    requiredProps.forEach(prop => {
                        expect(result.properties[prop]).toBeDefined();
                        expect(typeof result.properties[prop]).toBe('number');
                    });
                });
            });
        });
    });

    describe('Default Override Behavior', () => {
        beforeAll(async () => {
            await coolprop.init({
                refrigerant: 'R404A',
                tempUnit: 'C',
                pressureUnit: 'bar'
            });
        });

        it('should use defaults when no overrides provided', async () => {
            const result = await coolprop.calculateSuperheat({
                temperature: 25,
                pressure: 10
            });
            expect(result.refrigerant).toBe('R404A');
            expect(result.units.temperature).toBe('C');
            expect(result.units.pressure).toBe('bar');
        });

        it('should allow refrigerant override', async () => {
            const result = await coolprop.calculateSuperheat({
                temperature: 25,
                pressure: 10,
                refrigerant: 'R134a'
            });
            expect(result.refrigerant).toBe('R134a');
        });

        it('should allow unit overrides', async () => {
            const result = await coolprop.calculateSuperheat({
                temperature: 77,
                pressure: 145,
                tempUnit: 'F',
                pressureUnit: 'psi'
            });
            expect(result.units.temperature).toBe('F');
            expect(result.units.pressure).toBe('psi');
        });
    });

    describe('Default Settings Management', () => {
        it('should allow updating defaults after initialization', async () => {
            // Initial setup
            await coolprop.init({
                refrigerant: 'R404A',
                tempUnit: 'C',
                pressureUnit: 'bar'
            });

            // Update defaults
            const updateResult = await coolprop.init({
                refrigerant: 'R134a',
                tempUnit: 'F',
                pressureUnit: 'psi'
            });

            expect(updateResult.type).toBe('success');
            expect(updateResult.message).toBe('Default settings updated');

            // Verify new defaults are used
            const result = await coolprop.calculateSuperheat({
                temperature: 77,
                pressure: 145
            });

            expect(result.refrigerant).toBe('R134a');
            expect(result.units.temperature).toBe('F');
            expect(result.units.pressure).toBe('psi');
        });

        it('should update the coolprop instance if refrigerant is changed', async () => {
            // Set initial defaults
            await coolprop.init({
                refrigerant: 'R404A',
                tempUnit: 'C',
                pressureUnit: 'bar'
            });

            const config = await coolprop.getConfig();

            // First call with overrides
            const result1 = await coolprop.calculateSuperheat({
                temperature: 25,
                pressure: 10,
                refrigerant: 'R507A',
                tempUnit: 'C',
                pressureUnit: 'bar'
            });

            // Second call using defaults
            const result2 = await coolprop.calculateSuperheat({
                temperature: 25,
                pressure: 10
            });
            const config2 = await coolprop.getConfig();
            expect(config.refrigerant).toBe('R404A');
            expect(config2.refrigerant).toBe('R507A');
            expect(result1.refrigerant).toBe('R507A');
            expect(result2.refrigerant).toBe('R507A');
        });

        it('should allow partial updates of defaults', async () => {
            // Initial setup
            await coolprop.init({
                refrigerant: 'R404A',
                tempUnit: 'C',
                pressureUnit: 'bar'
            });

            // Update only temperature unit
            await coolprop.init({
                tempUnit: 'F'
            });

            const result = await coolprop.calculateSuperheat({
                temperature: 77,
                pressure: 10
            });

            expect(result.refrigerant).toBe('R404A');  // unchanged
            expect(result.units.temperature).toBe('F'); // updated
            expect(result.units.pressure).toBe('bar');  // unchanged
        });

        it('should validate units when updating defaults', async () => {
            await coolprop.init({
                refrigerant: 'R404A',
                tempUnit: 'C',
                pressureUnit: 'bar'
            });

            const result = await coolprop.init({
                tempUnit: 'X'  // invalid unit
            });

            expect(result.type).toBe('error');
            expect(result.message).toContain('Invalid temperature unit');
        });
    });


}); 