# NodeProp

A Node.js wrapper for CoolProp providing an easy-to-use interface for thermodynamic calculations and refrigerant properties. Unlike all the other CoolProp npm packages I've seen, this one should actually work. Please report any issues.

## Installation

```bash
npm install coolprop-node
```

## Features

- Easy-to-use async interface for CoolProp
- Unit conversion support (Temperature: K/C/F, Pressure: Pa/kPa/bar/psi)
- Automatic initialization
- Configurable defaults
- Comprehensive error handling

## Dependencies
 No External Dependencies, as CoolProp.js and CoolProp.wasm are bundled with the package.
- [CoolProp](https://github.com/CoolProp/CoolProp) for the powerful thermodynamic library


## Quick Start
```javascript
const nodeprop = require('coolprop-node');
async function example() {
    // Initialize with defaults (optional)
    await nodeprop.init({
        refrigerant: 'R404A',
        tempUnit: 'C',
        pressureUnit: 'bar'
    });
    // Calculate superheat
    const result = await nodeprop.calculateSuperheat({
        temperature: 25, // 25°C
        pressure: 10, // 10 bar
        refrigerant: 'R404A' // optional if set in init
    });
    console.log(result);
    
    {
        type: 'success',
        superheat: 5.2,
        saturationTemperature: 19.8,
        refrigerant: 'R404A',
        units: {
            temperature: 'C',
            pressure: 'bar'
        }
    }
```

## API Reference

### nodeprop.init(config)
Initializes the wrapper with optional configuration.

```javascript
await nodeprop.init({
    refrigerant: 'R404A', // Required on first init
    tempUnit: 'C', // Optional, defaults to 'K'
    pressureUnit: 'bar' // Optional, defaults to 'Pa'
});
```

### nodeprop.calculateSuperheat(input)
Calculates superheat for a given refrigerant.

```javascript   
const result = await nodeprop.calculateSuperheat({
    temperature: 25, // 25°C
    pressure: 10, // 10 bar
    refrigerant: 'R404A' // optional if set in init
});


returns:
    {
        type: 'success',
        superheat: 5.2,
        saturationTemperature: 19.8,
        refrigerant: 'R404A',
        units: {
            temperature: 'C',
            pressure: 'bar'
        }
    }
```

### nodeprop.getSaturationTemperature(input)
Calculates saturation temperature for a given refrigerant.  

```javascript
const result = await nodeprop.calculateSaturationTemperature({
    temperature: 25, // 25°C
    pressure: 10, // 10 bar
    refrigerant: 'R404A' // optional if set in init
});

returns:
    {
        type: 'success',
        temperature: 19.8,
        refrigerant: 'R404A',
        units: {
            temperature: 'C',
            pressure: 'bar'
        }
    }
```

### nodeprop.getSaturationPressure(input)
Calculates saturation pressure for a given refrigerant.

```javascript
const result = await nodeprop.calculateSaturationPressure({
    temperature: 25, // 25°C
    refrigerant: 'R404A' // optional if set in init
});

returns:
    {
        type: 'success',
        pressure: 10,
        refrigerant: 'R404A',
        units: {
            temperature: 'C',
            pressure: 'bar'
        }
    }   
```

### nodeprop.calculateSubcooling(input)
Calculates subcooling for a given refrigerant.

```javascript
const result = await nodeprop.calculateSubcooling({
    temperature: 25, // 25°C
    pressure: 10, // 10 bar
    refrigerant: 'R404A' // optional if set in init
});

returns:
    {
        type: 'success',
        subcooling: 5.2,
        saturationTemperature: 19.8,
        refrigerant: 'R404A',
        units: {
            temperature: 'C',
            pressure: 'bar'
        }
    }
```

### nodeprop.calculateSuperheat(input)
Calculates superheat for a given refrigerant.

```javascript   
const result = await nodeprop.calculateSuperheat({
    temperature: 25, // 25°C
    pressure: 10, // 10 bar
    refrigerant: 'R404A' // optional if set in init
});

returns:
    {
        type: 'success',
        superheat: 5.2,
        saturationTemperature: 19.8,
        refrigerant: 'R404A',
        units: {
            temperature: 'C',
            pressure: 'bar'
        }
    }
```

### nodeprop.getProperties(input)
Gets all properties for a given refrigerant.

```javascript
const result = await nodeprop.getProperties({
    temperature: 25, // 25°C
    pressure: 10, // 10 bar
    refrigerant: 'R404A' // optional if set in init
});

returns:
    {
        type: 'success',
        properties: {
            temperature: 25, // in configured temperature unit (e.g., °C)
            pressure: 10, // in configured pressure unit (e.g., bar)
            density: 1234.56, // in kg/m³
            enthalpy: 400000, // in J/kg
            entropy: 1750, // in J/kg/K
            quality: 1, // dimensionless (0-1)
            conductivity: 0.013, // in W/m/K
            viscosity: 1.2e-5, // in Pa·s
            specificHeat: 850 // in J/kg/K
        },
        refrigerant: 'R404A',
        units: {
            temperature: 'C',
            pressure: 'bar',
            density: 'kg/m³',
            enthalpy: 'J/kg',
            entropy: 'J/kg/K',
            quality: 'dimensionless',
            conductivity: 'W/m/K',
            viscosity: 'Pa·s',
            specificHeat: 'J/kg/K'
        }
    }
```

### nodeprop.PropsSI
Direct access to CoolProp's PropsSI function.

```javascript
const PropsSI = await nodeprop.getPropsSI();
const result = PropsSI('H', 'T', 298.15, 'P', 101325, 'R134a');
```

### Error Handling

```javascript
const result = await nodeprop.calculateSuperheat({
    temperature: 25, // 25°C
    pressure: 10, // 10 bar
    refrigerant: 'R404' // Invalid refrigerant. Must be supported by CoolProp, but R404 is not even a valid refrigerant.
});

returns:
    {
        type: 'error',
        message: 'Invalid refrigerant'
    }
```

### Acknowledgements

- [CoolProp](https://github.com/CoolProp/CoolProp) for the powerful thermodynamic library




