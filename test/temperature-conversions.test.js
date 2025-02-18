const coolprop = require('../src/index.js');

describe('Temperature Conversion Tests', () => {

    describe('Regular Temperature Conversions', () => {
        const testCases = [
            {
                startUnit: 'C',
                startValue: 25,
                expectedK: 298.15,
                conversions: {
                    F: 77,
                    K: 298.15,
                    C: 25
                }
            },
            {
                startUnit: 'F',
                startValue: 77,
                expectedK: 298.15,
                conversions: {
                    F: 77,
                    K: 298.15,
                    C: 25
                }
            },
            {
                startUnit: 'K',
                startValue: 298.15,
                expectedK: 298.15,
                conversions: {
                    F: 77,
                    K: 298.15,
                    C: 25
                }
            }
        ];

        testCases.forEach(({ startUnit, startValue, expectedK, conversions }) => {
            test(`${startValue}${startUnit} conversion chain`, () => {
                // First convert to Kelvin
                const toK = coolprop._convertTempToK(startValue, startUnit);
                expect(Math.round(toK * 100) / 100).toBe(expectedK);

                // Then convert from Kelvin to each unit
                Object.entries(conversions).forEach(([unit, expected]) => {
                    const converted = coolprop._convertTempFromK(toK, unit);
                    expect(Math.round(converted * 100) / 100).toBe(expected);
                });
            });
        });
    });

    describe('Delta Temperature Conversions', () => {
        const testCases = [
            {
                startValue: 10,  // 10K temperature difference
                expected: {
                    K: 10,
                    C: 10,
                    F: 50  // 10K = 18°F difference
                }
            }
        ];

        testCases.forEach(({ startValue, expected }) => {
            test(`${startValue}K delta conversion to all units`, () => {
                Object.entries(expected).forEach(([unit, expectedValue]) => {
                    const converted = coolprop._convertDeltaTempFromK(startValue, unit);
                    expect(Math.round(converted * 100) / 100).toBe(expectedValue);
                });
            });
        });
    });

    describe('Common Temperature Points', () => {
        const commonPoints = [
            {
                description: 'Water freezing point',
                C: 0,
                F: 32,
                K: 273.15
            },
            {
                description: 'Water boiling point',
                C: 100,
                F: 212,
                K: 373.15
            },
            {
                description: 'Room temperature',
                C: 20,
                F: 68,
                K: 293.15
            },
            {
                description: 'Typical refrigeration evaporator',
                C: 5,
                F: 41,
                K: 278.15
            },
            {
                description: 'Typical refrigeration condenser',
                C: 35,
                F: 95,
                K: 308.15
            }
        ];

        commonPoints.forEach(point => {
            test(`${point.description} conversions`, () => {
                // Test conversion to Kelvin from each unit
                const fromC = coolprop._convertTempToK(point.C, 'C');
                const fromF = coolprop._convertTempToK(point.F, 'F');
                
                expect(Math.round(fromC * 100) / 100).toBe(point.K);
                expect(Math.round(fromF * 100) / 100).toBe(point.K);

                // Test conversion from Kelvin to each unit
                const toC = coolprop._convertTempFromK(point.K, 'C');
                const toF = coolprop._convertTempFromK(point.K, 'F');

                expect(Math.round(toC * 100) / 100).toBe(point.C);
                expect(Math.round(toF * 100) / 100).toBe(point.F);
            });
        });
    });
}); 