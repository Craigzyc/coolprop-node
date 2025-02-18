const coolProp = require('../src/index.js');

describe('PropsSI Direct Access', () => {
    let PropsSI;

    beforeAll(async () => {
        // Get the PropsSI function
        PropsSI = await coolProp.getPropsSI();
    });

    test('should initialize and return PropsSI function', async () => {
        expect(typeof PropsSI).toBe('function');
    });

    test('should calculate saturation temperature of R134a at 1 bar', () => {
        const pressure = 100000; // 1 bar in Pa
        const temp = PropsSI('T', 'P', pressure, 'Q', 0, 'R134a');
        expect(temp).toBeCloseTo(246.79, 1); // ~246.79 K at 1 bar
    });

    test('should calculate density of R134a at specific conditions', () => {
        const temp = 300; // 300 K
        const pressure = 100000; // 1 bar in Pa
        const density = PropsSI('D', 'T', temp, 'P', pressure, 'R134a');
        expect(density).toBeGreaterThan(0)
        expect(density).toBeLessThan(Infinity);
    });

    test('should throw error for invalid refrigerant', () => {
        const temp = 300;
        const pressure = 100000;
        expect(() => {
            let result = PropsSI('D', 'T', temp, 'P', pressure, 'INVALID_REFRIGERANT');
            if(result == Infinity) {
                throw new Error('Infinity due to invalid refrigerant');
            }
        }).toThrow();
    });

    test('should throw error for invalid input parameter', () => {
        const temp = 300;
        const pressure = 100000;
        expect(() => {
            let result = PropsSI('INVALID_PARAM', 'T', temp, 'P', pressure, 'R134a');   
            if(result == Infinity) {
                throw new Error('Infinity due to invalid input parameter');
            }
        }).toThrow();
    });
}); 