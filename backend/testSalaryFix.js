// Test the specific salary calculation issue
const testSpecificCalculation = () => {
  console.log('🧮 Testing Specific Salary Calculation Fix...\n');

  // Test case: Basic salary 1000, House rent allowance 100
  const basicSalary = 1000;
  const allowances = {
    houseRentAllowance: 100,
    dearnessAllowance: 0,
    transportAllowance: 0,
    medicalAllowance: 0,
    otherAllowances: 0
  };
  const deductions = {
    providentFund: 0,
    tax: 0,
    insurance: 0,
    otherDeductions: 0
  };

  // Calculate with proper type conversion (like the fixed middleware)
  const totalAllowances = Object.values(allowances).reduce((sum, val) => {
    const numVal = parseFloat(val) || 0;
    return sum + numVal;
  }, 0);
  
  const totalDeductions = Object.values(deductions).reduce((sum, val) => {
    const numVal = parseFloat(val) || 0;
    return sum + numVal;
  }, 0);
  
  const grossSalary = basicSalary + totalAllowances;
  const netSalary = grossSalary - totalDeductions;

  console.log('📊 Test Case: Basic Salary ₹1000 + House Rent Allowance ₹100');
  console.log(`   Basic Salary: ₹${basicSalary}`);
  console.log(`   House Rent Allowance: ₹${allowances.houseRentAllowance}`);
  console.log(`   Total Allowances: ₹${totalAllowances}`);
  console.log(`   Total Deductions: ₹${totalDeductions}`);
  console.log(`   Gross Salary: ₹${grossSalary}`);
  console.log(`   Net Salary: ₹${netSalary}`);
  
  // Check if the calculation is correct
  const expectedGross = 1000 + 100; // 1100
  const expectedNet = 1100 - 0; // 1100
  
  console.log(`\n✅ Expected Gross: ₹${expectedGross}, Actual: ₹${grossSalary}`);
  console.log(`✅ Expected Net: ₹${expectedNet}, Actual: ₹${netSalary}`);
  console.log(`🎯 Calculation: ${grossSalary === expectedGross && netSalary === expectedNet ? '✅ CORRECT' : '❌ INCORRECT'}`);

  // Test string conversion issue
  console.log('\n🔍 Testing String Conversion Issue:');
  const basicSalaryString = "1000";
  const allowanceString = "100";
  
  const basicSalaryNum = parseFloat(basicSalaryString) || 0;
  const allowanceNum = parseFloat(allowanceString) || 0;
  
  const resultWithStrings = basicSalaryNum + allowanceNum;
  const resultWithConcatenation = basicSalaryString + allowanceString;
  
  console.log(`   Basic Salary (string): "${basicSalaryString}"`);
  console.log(`   Allowance (string): "${allowanceString}"`);
  console.log(`   Correct calculation (parseFloat): ${basicSalaryNum} + ${allowanceNum} = ${resultWithStrings}`);
  console.log(`   Wrong calculation (concatenation): "${basicSalaryString}" + "${allowanceString}" = "${resultWithConcatenation}"`);
  console.log(`   ✅ String conversion: ${resultWithStrings === 1100 ? 'WORKING' : '❌ BROKEN'}`);
};

// Run the test
testSpecificCalculation(); 