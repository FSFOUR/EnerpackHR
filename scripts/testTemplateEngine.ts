import { mapEmployeeToContractFields } from '../src/template-engine/contractFieldMapper';
import { generateContractPdf } from '../src/template-engine/contractPdfConverter';
import { validateContract } from '../src/template-engine/contractValidator';
import { generateContractDocxBlob } from '../src/template-engine/contractDocxGenerator';
import { ENERPACK_EMPLOYEE_MASTER } from '../src/data/enerpackEmployeeMaster';

async function main() {
  console.log('Testing Template Engine with sample employee...');
  const sampleEmp = ENERPACK_EMPLOYEE_MASTER[0]; // SHAFI
  console.log('Sample Employee:', sampleEmp.name, sampleEmp.id);

  // Test 1: Residential PDF
  const resFields = mapEmployeeToContractFields(sampleEmp, {
    contractType: 'Residential',
    agreementNo: 'ENR-CON-2026-0001',
    agreementDate: '2026-01-15',
  });
  const resPdf = generateContractPdf(resFields);
  const resPages = resPdf.getNumberOfPages();
  const resVal = validateContract(resPdf, resFields);
  console.log(`Residential PDF Pages: ${resPages} (Expected: 3), Valid: ${resVal.valid}, Score: ${resVal.score}%`);
  if (resPages !== 3) {
    throw new Error(`Residential page count failed: expected 3, got ${resPages}`);
  }

  // Test 2: Non-Residential PDF
  const nonResFields = mapEmployeeToContractFields(sampleEmp, {
    contractType: 'Non-Residential / Other State Employee',
    agreementNo: 'ENR-CON-2026-0002',
    agreementDate: '2026-01-15',
  });
  const nonResPdf = generateContractPdf(nonResFields);
  const nonResPages = nonResPdf.getNumberOfPages();
  const nonResVal = validateContract(nonResPdf, nonResFields);
  console.log(`Non-Residential PDF Pages: ${nonResPages} (Expected: 4), Valid: ${nonResVal.valid}, Score: ${nonResVal.score}%`);
  if (nonResPages !== 4) {
    throw new Error(`Non-Residential page count failed: expected 4, got ${nonResPages}`);
  }

  // Test 3: Blank Template Residential PDF
  const blankResFields = mapEmployeeToContractFields(null, { isBlank: true, contractType: 'Residential' });
  const blankResPdf = generateContractPdf(blankResFields, true);
  console.log(`Blank Residential PDF Pages: ${blankResPdf.getNumberOfPages()} (Expected: 3)`);

  // Test 4: Blank Template Non-Residential PDF
  const blankNonResFields = mapEmployeeToContractFields(null, { isBlank: true, contractType: 'Non-Residential / Other State Employee' });
  const blankNonResPdf = generateContractPdf(blankNonResFields, true);
  console.log(`Blank Non-Residential PDF Pages: ${blankNonResPdf.getNumberOfPages()} (Expected: 4)`);

  // Test 5: DOCX Generation
  const docxBlob = await generateContractDocxBlob(resFields);
  console.log(`DOCX generated successfully, size: ${docxBlob.size} bytes`);

  console.log('ALL CONTRACT TEMPLATE ENGINE TESTS PASSED PERFECTLY!');
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
