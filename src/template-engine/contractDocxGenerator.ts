import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Footer,
  ShadingType,
  PageBreak,
} from 'docx';
import { MappedContractFields } from './contractFieldMapper';

const NAVY_BLUE = '1e40af';
const LIGHT_BLUE = 'f0f7ff';
const BORDER_GRAY = 'cbd5e1';
const TEXT_DARK = '1e293b';

function createCellBorder() {
  return {
    top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GRAY },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GRAY },
    left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GRAY },
    right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GRAY },
  };
}

export async function generateContractDocxBlob(
  fields: MappedContractFields,
  isBlank = false
): Promise<Blob> {
  const isNonRes = fields.contractType.toLowerCase().includes('non');

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'ENERPACK | Confidential Company Document',
            size: 16, // 8pt
            color: '64748b',
          }),
        ],
      }),
    ],
  });

  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: 'ENERPACK',
          bold: true,
          size: 32, // 16pt
          color: '0f172a',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: 'EMPLOYEE CONTRACT AGREEMENT',
          bold: true,
          size: 26, // 13pt
          color: '0f172a',
        }),
      ],
    })
  );

  // Agreement No. & Date Table Box
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createCellBorder(),
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { fill: 'f8fafc', type: ShadingType.CLEAR },
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Agreement No. ', bold: true, size: 20 }),
                    new TextRun({ text: isBlank ? '' : (fields.agreementNo || ''), size: 20 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { fill: 'f8fafc', type: ShadingType.CLEAR },
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Date: ', bold: true, size: 20 }),
                    new TextRun({ text: isBlank ? '' : (fields.date || ''), size: 20 }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 180, after: 180 },
      children: [
        new TextRun({
          text: 'This Employee Contract Agreement is made between ENERPACK, (the “Company”), and the employee identified below (the “Employee”).',
          size: 19, // 9.5pt
          color: TEXT_DARK,
        }),
      ],
    })
  );

  // Section 1 Banner
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createCellBorder(),
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { fill: NAVY_BLUE, type: ShadingType.CLEAR },
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: '1. EMPLOYEE DETAILS',
                      bold: true,
                      size: 20,
                      color: 'ffffff',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // Employee Details Table
  const employeeRowsData = [
    ['Employee Full Name', isBlank ? '' : fields.fullName],
    ['Staff No.', isBlank ? '' : fields.staffNo],
    ['Age / Date of Birth', isBlank ? '' : fields.ageDob],
    ['Aadhaar No. (if lawfully required)', isBlank ? '' : fields.aadhaar],
    ['Permanent Address', isBlank ? '' : fields.permAddress],
    ['Current Address', isBlank ? '' : fields.currAddress],
    ['Mobile / Email', isBlank ? '' : fields.mobileEmail],
    ['Emergency Contact', isBlank ? '' : fields.emergencyContact],
    ['Designation / Department', isBlank ? '' : fields.designationDept],
  ];

  const empTableRows = employeeRowsData.map(([label, val]) => {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 38, type: WidthType.PERCENTAGE },
          shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
          margins: { top: 90, bottom: 90, left: 140, right: 140 },
          borders: createCellBorder(),
          children: [
            new Paragraph({
              children: [new TextRun({ text: label, bold: true, size: 18, color: TEXT_DARK })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 62, type: WidthType.PERCENTAGE },
          shading: { fill: 'ffffff', type: ShadingType.CLEAR },
          margins: { top: 90, bottom: 90, left: 140, right: 140 },
          borders: createCellBorder(),
          children: [
            new Paragraph({
              children: [new TextRun({ text: val || '', size: 18, color: TEXT_DARK })],
            }),
          ],
        }),
      ],
    });
  });

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createCellBorder(),
      rows: empTableRows,
    })
  );

  function addClause(numTitle: string, bodyText: string) {
    children.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [new TextRun({ text: numTitle, bold: true, size: 20, color: '1d4ed8' })],
      }),
      new Paragraph({
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: bodyText, size: 18, color: TEXT_DARK })],
      })
    );
  }

  function addBulletClause(numTitle: string, bullets: string[]) {
    children.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [new TextRun({ text: numTitle, bold: true, size: 20, color: '1d4ed8' })],
      })
    );
    bullets.forEach(b => {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 30, after: 30 },
          children: [new TextRun({ text: b, size: 18, color: TEXT_DARK })],
        })
      );
    });
  }

  addClause(
    '2. Appointment',
    `The Company appoints the Employee as ${isBlank ? '__________________________' : fields.designation} in the ${isBlank ? '__________________' : fields.department} Department, subject to the terms of this Agreement and applicable law.`
  );

  addClause(
    '3. Joining Date & Place of Work',
    `Joining Date: ${isBlank ? '__________' : fields.joiningDate}   Primary Work Location: ${isBlank ? '______________________________' : fields.workLocation}. The Employee may be required to work at other company locations or operational sites as reasonably required.`
  );

  addBulletClause('4. Duties & Responsibilities', [
    'Perform assigned duties diligently and safely.',
    'Follow job cards, production instructions, inventory controls, quality requirements and lawful instructions.',
    'Protect company property, materials, documents and confidential information.',
    'Comply with company procedures, safety rules and attendance requirements.',
  ]);

  addClause(
    '5. Working Hours, Attendance & Overtime',
    'The Employee must strictly follow the Company’s designated shift timings, including In and Out timings. The Employee may be required to work day or night shifts and on any machine as instructed by the supervisor, subject to applicable working-hour, rest-period, safety and overtime requirements.'
  );

  addClause(
    '6. Salary & Benefits',
    `Basic / Gross Salary: ₹${isBlank ? '________________' : fields.salary} per month. Other approved allowances/benefits: ${isBlank ? '______________________________' : fields.allowances}. Statutory deductions and benefits, where applicable, will be handled in accordance with law.`
  );

  const cleanProbation = isBlank
    ? '__________ months'
    : fields.probation.toLowerCase().endsWith('months')
    ? fields.probation
    : `${fields.probation} Months`;

  addClause(
    '7. Probation',
    `Probation period, if applicable: ${cleanProbation}. Confirmation will be subject to satisfactory performance and applicable company procedure.`
  );

  if (isNonRes) {
    addClause('8. Leave', 'Leave eligibility and approval will follow company policy and applicable law.');

    addClause(
      '9. Confidentiality & Company Property',
      'The Employee shall protect confidential business information and return company property, records, keys, devices and other assets upon request or separation. Intentional or negligent damages recovery charges from wages or loss for the damage will be made by applicable law and after the required process.'
    );

    // PAGE BREAK -> PAGE 2
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    addClause(
      '10. Health, Safety & Conduct',
      'The Employee shall comply with safety requirements, use required PPE, report accidents/unsafe conditions, and maintain professional conduct. Serious misconduct may lead to disciplinary action subject to applicable law and due process.'
    );

    addClause(
      '11. Termination / Separation',
      'Notice, resignation, termination, final settlement and handover shall be handled in accordance with this Agreement, company policy and applicable law. Nothing in this Agreement is intended to reduce any statutory right or protection available to the Employee.'
    );

    addClause(
      '12. Mobile Phone Usage',
      'Personal mobile-phone use during working hours is restricted where it affects productivity, safety, machine operation, loading/unloading, driving, customer service or other assigned duties. Unauthorized use may result in a salary deduction of ₹250 to ₹500 per occurrence, subject to applicable law, company procedure and any required authorization.'
    );

    addClause(
      '13. Absence & Attendance',
      'Employees are required to attend work as scheduled and obtain approval for leave. Unauthorized absence may result in salary deduction for the corresponding period. Where company policy provides a two-day salary deduction for an unauthorized absence, the deduction will be applied only to the extent permitted by applicable law and after appropriate review.'
    );

    addClause(
      '14. Spitting on Company Premises',
      'Spitting anywhere on Enerpack company premises is strictly prohibited. A violation may result in a direct salary deduction of ₹500, subject to applicable law, the employee\'s applicable terms and required company procedure/authorization. Repeated violations may also result in additional disciplinary action.'
    );

    addClause(
      '15. Personal Information',
      'Personal information supplied by the Employee will be collected and used for legitimate employment, payroll, attendance, statutory, safety and administrative purposes, subject to applicable law and company practices.'
    );

    addClause(
      '16. Governing Terms',
      'This Agreement shall be interpreted subject to applicable laws of India and the relevant jurisdiction of the workplace. If any clause conflicts with mandatory law, the mandatory legal requirement will prevail.'
    );

    children.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [
          new TextRun({
            text: '17. Acknowledgement of Workplace Rules',
            bold: true,
            size: 20,
            color: '1d4ed8',
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: 'The Employee confirms that the following Enerpack rules have been explained and understood. The Employee acknowledges that any salary/wage deduction will be made only as permitted by applicable law and company procedure:',
            size: 18,
            color: TEXT_DARK,
          }),
        ],
      }),
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({
            text: 'Mobile Phone Usage: Unauthorized mobile-phone use during working hours may result in a salary deduction of ₹250 to ₹500 per occurrence.',
            size: 18,
            color: TEXT_DARK,
          }),
        ],
      }),
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({
            text: "Absence: Unauthorized absence may result in salary deduction for the corresponding period. The company rule of two days' salary deduction for unauthorized absence will apply only to the extent legally permissible.",
            size: 18,
            color: TEXT_DARK,
          }),
        ],
      }),
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({
            text: 'Spitting on Company Premises: Spitting anywhere on Enerpack premises is strictly prohibited. A violation may result in a direct salary deduction of ₹500, subject to applicable law and company procedure.',
            size: 18,
            color: TEXT_DARK,
          }),
        ],
      })
    );

    addClause(
      '18. Personal Leave',
      'Personal leave should normally be requested and communicated to the reporting supervisor/HR at least 7 to 10 days in advance, wherever reasonably practicable, so that work arrangements can be made. Leave approval remains subject to company policy, operational requirements and applicable law. Emergency or unforeseen leave should be reported as soon as reasonably possible.'
    );

    // PAGE BREAK -> PAGE 3
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    addClause(
      '19. Resignation & Notice Period',
      "An Employee who wishes to resign from Enerpack shall provide a minimum of 45 days' prior written notice. The resignation must be submitted in writing and signed by the Employee. The notice period shall be counted from the date the written resignation is received/acknowledged by the Company, subject to the terms of employment and applicable law. The Employee is expected to complete proper handover of duties, company property, documents, stock/material responsibilities and other assigned matters before the final working day."
    );
  } else {
    // PAGE BREAK -> PAGE 2 (Residential)
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    addClause('8. Leave', 'Leave eligibility and approval will follow company policy and applicable law.');

    addClause(
      '9. Confidentiality & Company Property',
      'The Employee shall protect confidential business information and return company property, records, keys, devices and other assets upon request or separation. Intentional or negligent damages recovery charges from wages or loss for the damage will be made by applicable law and after the required process.'
    );

    addClause(
      '10. Health, Safety & Conduct',
      'The Employee shall comply with safety requirements, use required PPE, report accidents/unsafe conditions, and maintain professional conduct. Serious misconduct may lead to disciplinary action subject to applicable law and due process.'
    );

    addClause(
      '11. Termination / Separation',
      'Notice, resignation, termination, final settlement and handover shall be handled in accordance with this Agreement, company policy and applicable law. Nothing in this Agreement is intended to reduce any statutory right or protection available to the Employee.'
    );

    addClause(
      '12. Mobile Phone Usage',
      'Personal mobile-phone use during working hours is restricted where it affects productivity, safety, machine operation, loading/unloading, driving, customer service or other assigned duties. Unauthorized use may result in a salary deduction of ₹250 to ₹500 per occurrence, subject to applicable law, company procedure and any required authorization.'
    );

    addClause(
      '13. Absence & Attendance',
      'Employees are required to attend work as scheduled and obtain approval for leave. Unauthorized absence may result in salary deduction for the corresponding period. Where company policy provides a two-day salary deduction for an unauthorized absence, the deduction will be applied only to the extent permitted by applicable law and after appropriate review.'
    );

    addClause(
      '14. Spitting on Company Premises',
      'Spitting anywhere on Enerpack company premises is strictly prohibited. A violation may result in a direct salary deduction of ₹500, subject to applicable law, the employee\'s applicable terms and required company procedure/authorization. Repeated violations may also result in additional disciplinary action.'
    );

    addClause(
      '15. Personal Information',
      'Personal information supplied by the Employee will be collected and used for legitimate employment, payroll, attendance, statutory, safety and administrative purposes, subject to applicable law and company practices.'
    );

    addClause(
      '16. Governing Terms',
      'This Agreement shall be interpreted subject to applicable laws of India and the relevant jurisdiction of the workplace. If any clause conflicts with mandatory law, the mandatory legal requirement will prevail.'
    );

    // PAGE BREAK -> PAGE 3 (Residential)
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    children.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [
          new TextRun({
            text: '17. Acknowledgement of Workplace Rules',
            bold: true,
            size: 20,
            color: '1d4ed8',
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: 'The Employee confirms that the following Enerpack rules have been explained and understood. The Employee acknowledges that any salary/wage deduction will be made only as permitted by applicable law and company procedure:',
            size: 18,
            color: TEXT_DARK,
          }),
        ],
      }),
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({
            text: 'Mobile Phone Usage: Unauthorized mobile-phone use during working hours may result in a salary deduction of ₹250 to ₹500 per occurrence.',
            size: 18,
            color: TEXT_DARK,
          }),
        ],
      }),
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({
            text: "Absence: Unauthorized absence may result in salary deduction for the corresponding period. The company rule of two days' salary deduction for unauthorized absence will apply only to the extent legally permissible.",
            size: 18,
            color: TEXT_DARK,
          }),
        ],
      }),
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({
            text: 'Spitting on Company Premises: Spitting anywhere on Enerpack premises is strictly prohibited. A violation may result in a direct salary deduction of ₹500, subject to applicable law and company procedure.',
            size: 18,
            color: TEXT_DARK,
          }),
        ],
      })
    );

    addClause(
      '18. Personal Leave',
      'Personal leave should normally be requested and communicated to the reporting supervisor/HR at least 7 to 10 days in advance, wherever reasonably practicable, so that work arrangements can be made. Leave approval remains subject to company policy, operational requirements and applicable law. Emergency or unforeseen leave should be reported as soon as reasonably possible.'
    );

    addClause(
      '19. Resignation & Notice Period',
      "An Employee who wishes to resign from Enerpack shall provide a minimum of 45 days' prior written notice. The resignation must be submitted in writing and signed by the Employee. The notice period shall be counted from the date the written resignation is received/acknowledged by the Company, subject to the terms of employment and applicable law. The Employee is expected to complete proper handover of duties, company property, documents, stock/material responsibilities and other assigned matters before the final working day."
    );
  }

  if (isNonRes) {
    children.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [
          new TextRun({
            text: '20. Non Residential Company Terms and Conditions',
            bold: true,
            size: 20,
            color: '1d4ed8',
          }),
        ],
      })
    );

    const nonResBullets = [
      'Leave Eligibility: Leave will ordinarily be permitted only after completion of 12 months of service, subject to applicable statutory leave entitlements, emergency circumstances and Company policy.',
      'Travel during Authorized Leave: For eligible and authorized leave, the Company will provide round-trip Sleeper Class train tickets, subject to Company travel procedure and route availability.',
      'Final Leave before One Year: No employee is ordinarily permitted to proceed on final/home leave before completing 12 months of service, except where management approves an exception or where applicable law requires otherwise.',
      'Fighting / Violence: Fighting, threats, assault or abusive conduct among employees in Company premises or accommodation quarters is strictly prohibited and may lead to disciplinary action.',
      'Accommodation: The Company will provide accommodation/room for employees where such accommodation is part of the employment arrangement. Employees must keep their living quarters clean, orderly and safe and must follow accommodation rules.',
      'Waste & Plastic: Employees must not accumulate plastic waste outside their quarters and must not burn plastic. Waste shall be disposed of in the designated manner.',
      'Pan / Tampack / Tobacco: The use or consumption of Pan, Tampack or other tobacco products in Accommodation premises is strictly prohibited. A violation may attract a fine of ₹500, subject to applicable law and Company procedure.',
      'Resignation: The Company may require proper handover of duties, Company property, documents, stock/material responsibility and accommodation assets before the final working day.',
      'Leaving Home Before One Year: If an employee leaves for home before completing one year of service, a uniform fee of ₹400 may be recovered only where legally authorized.',
      'Bonus Eligibility: Bonus eligibility under Company policy is applicable only upon successful completion of one year of service, subject to any statutory bonus or other mandatory entitlement that may apply.',
      'Uniform: Wearing the prescribed uniform inside the plant is mandatory. Employees shall maintain the uniform in a clean and serviceable condition and follow Company instructions regarding its use and care.',
      'Separation, Handover & Final Settlement: On resignation or separation, the Employee must complete the required handover and return Company property. Final salary and other amounts due will be settled in accordance with applicable law and Company procedure. Nothing in this Agreement is intended to remove any mandatory statutory right or protection.',
    ];

    nonResBullets.forEach(b => {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 20, after: 20 },
          children: [new TextRun({ text: b, size: 18, color: TEXT_DARK })],
        })
      );
    });
  }

  const acceptNumber = isNonRes ? '21. Acceptance' : '20. Acceptance';
  children.push(
    new Paragraph({
      spacing: { before: 160, after: 60 },
      children: [
        new TextRun({
          text: acceptNumber,
          bold: true,
          size: 20,
          color: '1d4ed8',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 100 },
      children: [
        new TextRun({
          text: 'By signing below, both parties confirm that they have read and understood this Agreement and agree to the terms stated herein.',
          size: 18,
          color: TEXT_DARK,
        }),
      ],
    })
  );

  // Table 1: Employee signature box
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createCellBorder(),
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              borders: createCellBorder(),
              children: [new Paragraph({ children: [new TextRun({ text: 'Employee Name', bold: true, size: 18 })] })],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              shading: { fill: 'ffffff', type: ShadingType.CLEAR },
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              borders: createCellBorder(),
              children: [new Paragraph({ children: [new TextRun({ text: isBlank ? '' : (fields.fullName || ''), size: 18 })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
              margins: { top: 140, bottom: 140, left: 140, right: 140 },
              borders: createCellBorder(),
              children: [new Paragraph({ children: [new TextRun({ text: 'Employee Signature', bold: true, size: 18 })] })],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              shading: { fill: 'ffffff', type: ShadingType.CLEAR },
              margins: { top: 140, bottom: 140, left: 140, right: 140 },
              borders: createCellBorder(),
              children: [new Paragraph({ children: [] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              borders: createCellBorder(),
              children: [new Paragraph({ children: [new TextRun({ text: 'Date', bold: true, size: 18 })] })],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              shading: { fill: 'ffffff', type: ShadingType.CLEAR },
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              borders: createCellBorder(),
              children: [new Paragraph({ children: [new TextRun({ text: isBlank ? '' : (fields.date || ''), size: 18 })] })],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 100, after: 100 }, children: [] })
  );

  // Table 2: Approval box
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createCellBorder(),
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: NAVY_BLUE, type: ShadingType.CLEAR },
              margins: { top: 90, bottom: 90, left: 140, right: 140 },
              borders: createCellBorder(),
              children: [new Paragraph({ children: [new TextRun({ text: 'APPROVED BY', bold: true, size: 18, color: 'ffffff' })] })],
            }),
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: NAVY_BLUE, type: ShadingType.CLEAR },
              margins: { top: 90, bottom: 90, left: 140, right: 140 },
              borders: createCellBorder(),
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'SIGNATURE', bold: true, size: 18, color: 'ffffff' })] })],
            }),
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              shading: { fill: NAVY_BLUE, type: ShadingType.CLEAR },
              margins: { top: 90, bottom: 90, left: 140, right: 140 },
              borders: createCellBorder(),
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DATE', bold: true, size: 18, color: 'ffffff' })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: 'ffffff', type: ShadingType.CLEAR },
              margins: { top: 120, bottom: 120, left: 140, right: 140 },
              borders: createCellBorder(),
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Authorized Signature Name\n& Designation:\n', size: 17, bold: true }),
                    new TextRun({ text: 'HR / Administration', size: 17 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: 'ffffff', type: ShadingType.CLEAR },
              margins: { top: 120, bottom: 120, left: 140, right: 140 },
              borders: createCellBorder(),
              children: [new Paragraph({ children: [] })],
            }),
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              shading: { fill: 'ffffff', type: ShadingType.CLEAR },
              margins: { top: 120, bottom: 120, left: 140, right: 140 },
              borders: createCellBorder(),
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: isBlank ? '' : (fields.date || ''), size: 17 })] })],
            }),
          ],
        }),
      ],
    })
  );

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1150,
              right: 1150,
            },
          },
        },
        footers: {
          default: footer,
        },
        children: children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
