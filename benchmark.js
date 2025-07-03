const coolprop = require('./src/index.js');

// Function to generate random number between min and max
function getRandomNumber(min, max) {
  return min + Math.random() * (max - min);
}

// Generate 1000 combinations of temperature and pressure
function generateCombinations(count) {
  const combinations = [];
  
  // For R744 (CO2), using realistic ranges from test files
  // Temperature range: -40°F to 32°F 
  // Pressure range: 131 psig to 491 psig
  for (let i = 0; i < count; i++) {
    const temperature = getRandomNumber(-40, 32);
    const pressure = getRandomNumber(131, 491);
    
    combinations.push({
      temperature,
      pressure,
      refrigerant: 'R744',
      tempUnit: 'F',
      pressureUnit: 'psig'
    });
  }
  
  return combinations;
}

async function runBenchmark() {
  console.log('Generating 1000 temperature and pressure combinations...');
  const combinations = generateCombinations(1000);
  console.log('Combinations generated.');
  
  // Pre-initialize the library
  console.log('Initializing library...');
  await coolprop.init({
    refrigerant: 'R744',
    tempUnit: 'F',
    pressureUnit: 'psig'
  });
  console.log('Library initialized.');
  
  // Run benchmark
  console.log('Starting benchmark...');
  const startTime = performance.now();
  
  const results = [];
  for (let i = 0; i < combinations.length; i++) {
    const result = await coolprop.calculateSuperheat(combinations[i]);
    results.push(result);
    
    // Show progress every 100 calculations
    if ((i + 1) % 100 === 0) {
      console.log(`Processed ${i + 1} / ${combinations.length} calculations`);
    }
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / combinations.length;
  
  // Report results
  console.log('\nBenchmark Results:');
  console.log(`Total time: ${totalTime.toFixed(2)} ms`);
  console.log(`Average time per calculation: ${avgTime.toFixed(2)} ms`);
  console.log(`Calculations per second: ${(1000 / avgTime).toFixed(2)}`);
  
  // Count success and error results
  const successful = results.filter(r => r.type === 'success').length;
  const failed = results.filter(r => r.type === 'error').length;
  console.log(`\nSuccessful calculations: ${successful}`);
  console.log(`Failed calculations: ${failed}`);
}

// Run the benchmark
runBenchmark().catch(error => {
  console.error('Benchmark failed:', error);
}); 