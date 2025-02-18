const coolprop = require('../src/index.js');

describe('Pressure Conversion Chain Tests', () => {

    test('bar -> pa -> bara -> pa -> bar conversion chain', () => {
        const startValue = 2; // 2 bar gauge
        
        const toPa = coolprop._convertPressureToPa(startValue, 'bar');
        // console.log('bar to Pa:', toPa);
        
        const toBara = coolprop._convertPressureFromPa(toPa, 'bara');
        // console.log('Pa to bara:', toBara);
        
        const backToPa = coolprop._convertPressureToPa(toBara, 'bara');
        // console.log('bara to Pa:', backToPa);
        
        const backToBar = coolprop._convertPressureFromPa(backToPa, 'bar');
        // console.log('Pa to bar:', backToBar);

        expect(Math.round(backToBar * 1000) / 1000).toBe(startValue);
    });

    test('psi -> pa -> psia -> pa -> psi conversion chain', () => {
        const startValue = 30; // 30 psi gauge
        
        const toPa = coolprop._convertPressureToPa(startValue, 'psi');
        // console.log('psi to Pa:', toPa);
        
        const toPsia = coolprop._convertPressureFromPa(toPa, 'psia');
        // console.log('Pa to psia:', toPsia);
        
        const backToPa = coolprop._convertPressureToPa(toPsia, 'psia');
        // console.log('psia to Pa:', backToPa);
        
        const backToPsi = coolprop._convertPressureFromPa(backToPa, 'psi');
        // console.log('Pa to psi:', backToPsi);

        expect(Math.round(backToPsi * 1000) / 1000).toBe(startValue);
    });

    test('kpa -> pa -> kpaa -> pa -> kpa conversion chain', () => {
        const startValue = 200; // 200 kPa gauge
        
        const toPa = coolprop._convertPressureToPa(startValue, 'kpa');
        // console.log('kpa to Pa:', toPa);
        
        const toKpaa = coolprop._convertPressureFromPa(toPa, 'kpaa');
        // console.log('Pa to kpaa:', toKpaa);
        
        const backToPa = coolprop._convertPressureToPa(toKpaa, 'kpaa');
        // console.log('kpaa to Pa:', backToPa);
        
        const backToKpa = coolprop._convertPressureFromPa(backToPa, 'kpa');
        // console.log('Pa to kpa:', backToKpa);

        expect(Math.round(backToKpa * 1000) / 1000).toBe(startValue);
    });
}); 