export interface ContractMasterTemplateMeta {
  id: string;
  name: string;
  contractType: 'Residential' | 'Non-Residential / Other State Employee';
  pageCount: number;
  docxFilename: string;
  docxUrl: string;
  description: string;
  clausesCount: number;
}

export const MASTER_CONTRACT_TEMPLATES: ContractMasterTemplateMeta[] = [
  {
    id: 'residential-master',
    name: 'Enerpack Residential Employee Contract Agreement',
    contractType: 'Residential',
    pageCount: 3,
    docxFilename: 'Enerpack_Employee_Contract_Agreement_Residential.docx',
    docxUrl: '/templates/contracts/Enerpack_Employee_Contract_Agreement_Residential.docx',
    description:
      'Authoritative master contract template for Residential employees (Kerala/Local plant workforce). Exactly 3 pages with Clauses 1–20 and dual acceptance tables.',
    clausesCount: 20,
  },
  {
    id: 'non-residential-master',
    name: 'Enerpack Non-Residential / Other State Employee Contract Agreement',
    contractType: 'Non-Residential / Other State Employee',
    pageCount: 3,
    docxFilename: 'Enerpack_Employee_Contract_Agreement_Non_Residential.docx',
    docxUrl: '/templates/contracts/Enerpack_Employee_Contract_Agreement_Non_Residential.docx',
    description:
      'Authoritative master contract template for Non-Residential & Other State employees. Exactly 3 pages with Clauses 1–19, Clause 20 (12 accommodation & travel terms), Clause 21 Acceptance and complete dual signature tables on Page 3.',
    clausesCount: 21,
  },
];

export function getMasterTemplateByType(
  type: 'Residential' | 'Non-Residential / Other State Employee'
): ContractMasterTemplateMeta {
  const isNonRes = type.toLowerCase().includes('non');
  return isNonRes ? MASTER_CONTRACT_TEMPLATES[1] : MASTER_CONTRACT_TEMPLATES[0];
}
