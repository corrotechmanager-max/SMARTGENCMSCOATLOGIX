import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  AlignmentType, 
  WidthType, 
  BorderStyle, 
  Header, 
  Footer,
  PageNumber
} from "docx";
import { jsPDF } from "jspdf";
import { Job } from "../types";

const COLOR_PRIMARY = "1E293B"; // Dark Charcoal slate
const COLOR_ACCENT = "D97706";  // Amber accent
const COLOR_BORDER = "CBD5E1";  // Silver Border
const COLOR_LIGHT_BG = "F1F5F9"; // Light gray bg for table headers
const COLOR_TEXT = "334155";     // Dark gray for text
const COLOR_MUTED = "64748B";    // slate secondary text
const COLOR_RED = "DC2626";      // Red for high priority / emergency

// Helper for cell creation
function createCell(content: Paragraph[], bg?: string, widthPct?: number, span?: number): TableCell {
  return new TableCell({
    children: content,
    shading: bg ? { fill: bg } : undefined,
    width: widthPct ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
    columnSpan: span,
    margins: {
      top: 100,
      bottom: 100,
      left: 140,
      right: 140
    }
  });
}

// Helper to create a formatted paragraph
function createPara(text: string, size = 20, isBold = false, color = COLOR_TEXT, italic = false, align: any = AlignmentType.LEFT): Paragraph {
  return new Paragraph({
    alignment: align,
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({
        text,
        size,
        bold: isBold,
        italics: italic,
        color,
        font: "Arial"
      })
    ]
  });
}

// DOCX Download Generator
export async function downloadJobWordReport(jobs: Job[]) {
  // 1. Create Report Header
  const reportHeader = new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "auto" },
          bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_BORDER },
          left: { style: BorderStyle.NONE, size: 0, color: "auto" },
          right: { style: BorderStyle.NONE, size: 0, color: "auto" },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 60, type: WidthType.PERCENTAGE },
                children: [
                  createPara("SPIC CHINA POWER HUB GENERATION COMPANY", 15, true, COLOR_PRIMARY),
                  createPara("INTEGRITY & COATING OPERATIONAL DIRECTORY", 11, true, COLOR_MUTED)
                ]
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                children: [
                  createPara("COMPREHENSIVE AUDIT REPORT", 12, true, COLOR_ACCENT, false, AlignmentType.RIGHT),
                  createPara(`Generated: ${new Date().toLocaleDateString()}`, 11, false, COLOR_MUTED, true, AlignmentType.RIGHT)
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // 2. Create Report Footer
  const reportFooter = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120 },
        children: [
          new TextRun({
            children: [
              "COMPREHENSIVE MD ANTI CORROSION   |   Page ",
              PageNumber.CURRENT,
              " of ",
              PageNumber.TOTAL_PAGES,
              "   |   Operating Report"
            ],
            size: 10,
            font: "Arial",
            color: COLOR_MUTED
          })
        ]
      })
    ]
  });

  const docElements: any[] = [];

  // Title section
  docElements.push(
    createPara("COMPREHENSIVE INDUSTRIAL JOB AUDIT REPORT", 32, true, COLOR_PRIMARY, false, AlignmentType.CENTER),
    createPara("Operational Activity & Maintenance Work Directory", 14, false, COLOR_ACCENT, true, AlignmentType.CENTER),
    new Paragraph({ spacing: { before: 200, after: 200 } })
  );

  // Summary Grid Section
  const pmCount = jobs.filter(j => j.type === "PM").length;
  const projectCount = jobs.filter(j => j.type === "Project").length;
  const onDemandCount = jobs.filter(j => j.type === "OnDemand").length;

  docElements.push(
    createPara("1. OPERATIONAL STATISTICS & SEGREGATION SUMMARY", 24, true, COLOR_PRIMARY),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell([createPara("Category / Work Type", 11, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 50),
            createCell([createPara("Total Registered Campaigns / Jobs", 11, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 50)
          ]
        }),
        new TableRow({
          children: [
            createCell([createPara("I. Preventive Maintenance (PM) Core Jobs", 11, false, COLOR_TEXT)]),
            createCell([createPara(pmCount.toString() + " Campaigns", 11, true, COLOR_ACCENT)])
          ]
        }),
        new TableRow({
          children: [
            createCell([createPara("II. Major Integrity Projects & Capital Works", 11, false, COLOR_TEXT)]),
            createCell([createPara(projectCount.toString() + " Campaigns", 11, true, COLOR_ACCENT)])
          ]
        }),
        new TableRow({
          children: [
            createCell([createPara("III. On-Demand & Urgent Corrective Repairs", 11, false, COLOR_TEXT)]),
            createCell([createPara(onDemandCount.toString() + " Campaigns", 11, true, COLOR_ACCENT)])
          ]
        }),
        new TableRow({
          children: [
            createCell([createPara("TOTAL INTEGRITY PORTFOLIO", 11, true, COLOR_PRIMARY)], COLOR_LIGHT_BG),
            createCell([createPara(jobs.length.toString() + " Campaign Directory Entries", 11, true, COLOR_PRIMARY)], COLOR_LIGHT_BG)
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { before: 240, after: 120 } })
  );

  // 3. SEGREGATE - Category I: Preventive Maintenance
  docElements.push(
    createPara("2. SECTION I: PREVENTIVE MAINTENANCE (PM) CAMPAIGNS", 24, true, COLOR_PRIMARY),
    createPara("Cyclical, scheduled anti-corrosion audits and mapping operations", 11, false, COLOR_MUTED, true),
    new Paragraph({ spacing: { after: 100 } })
  );

  const pmJobs = jobs.filter(j => j.type === "PM");
  if (pmJobs.length === 0) {
    docElements.push(createPara("No Preventive Maintenance campaigns scheduled.", 11, false, COLOR_MUTED, true));
  } else {
    pmJobs.forEach((job, index) => {
      docElements.push(
        createPara(`${index + 1}. Work Order: ${job.workOrderNo || "N/A"} - ${job.title}`, 14, true, COLOR_ACCENT),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell([createPara("Target Asset", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.assetName || "Unassigned", 10, false, COLOR_TEXT)], undefined, 25),
                createCell([createPara("Timeline Period", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(`${job.startDate} to ${job.endDate}`, 10, false, COLOR_TEXT)], undefined, 25)
              ]
            }),
            new TableRow({
              children: [
                createCell([createPara("PM Type & Freq", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(`${job.pmType || "N/A"} / ${job.frequency || "N/A"}`, 10, false, COLOR_TEXT)], undefined, 25),
                createCell([createPara("Technician", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.technician || "Unassigned", 10, false, COLOR_TEXT)], undefined, 25)
              ]
            }),
            new TableRow({
              children: [
                createCell([createPara("Campaign Status", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.status, 10, true, job.status === "In Progress" ? COLOR_ACCENT : COLOR_TEXT)], undefined, 25),
                createCell([createPara("Priority Level", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.priority, 10, true, job.priority === "High" ? COLOR_RED : COLOR_TEXT)], undefined, 25)
              ]
            }),
            new TableRow({
              children: [
                createCell([createPara("Scope of Works", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.scope || "No custom scope defined", 10, false, COLOR_TEXT, true)], undefined, 75, 3)
              ]
            }),
            job.notes ? new TableRow({
              children: [
                createCell([createPara("Auditor Remarks", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.notes, 10, false, COLOR_MUTED, true)], undefined, 75, 3)
              ]
            }) : null
          ].filter(Boolean) as TableRow[]
        }),
        new Paragraph({ spacing: { before: 100, after: 100 } })
      );
    });
  }

  // 4. SEGREGATE - Category II: Major Integrity Projects
  docElements.push(
    new Paragraph({ spacing: { before: 200 } }),
    createPara("3. SECTION II: MAJOR INTEGRITY PROJECTS & CAPITAL CAMPAIGNS", 24, true, COLOR_PRIMARY),
    createPara("Capital engineering coating applications, sandblasting, and structural overhauls", 11, false, COLOR_MUTED, true),
    new Paragraph({ spacing: { after: 100 } })
  );

  const projectJobs = jobs.filter(j => j.type === "Project");
  if (projectJobs.length === 0) {
    docElements.push(createPara("No Major Projects registered.", 11, false, COLOR_MUTED, true));
  } else {
    projectJobs.forEach((job, index) => {
      docElements.push(
        createPara(`${index + 1}. Project No: ${job.projectNo || "N/A"} - CTR: ${job.contractNo || "N/A"} - ${job.title}`, 14, true, COLOR_ACCENT),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell([createPara("Client Organization", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.client || "Unspecified", 10, false, COLOR_TEXT)], undefined, 25),
                createCell([createPara("Project Timeline", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(`${job.startDate} to ${job.endDate}`, 10, false, COLOR_TEXT)], undefined, 25)
              ]
            }),
            new TableRow({
              children: [
                createCell([createPara("Project Manager", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.projectManager || "Unspecified", 10, false, COLOR_TEXT)], undefined, 25),
                createCell([createPara("Current Phase", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.phase || "Unspecified", 10, true, COLOR_ACCENT)], undefined, 25)
              ]
            }),
            new TableRow({
              children: [
                createCell([createPara("Budget Allocation", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(`${job.budgetHours || 0} Man-Hours`, 10, true, COLOR_TEXT)], undefined, 25),
                createCell([createPara("Status / Priority", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(`${job.status} / ${job.priority}`, 10, true, job.priority === "High" ? COLOR_RED : COLOR_TEXT)], undefined, 25)
              ]
            }),
            new TableRow({
              children: [
                createCell([createPara("Capital Scope Summary", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.scope || "No custom scope defined", 10, false, COLOR_TEXT, true)], undefined, 75, 3)
              ]
            }),
            job.notes ? new TableRow({
              children: [
                createCell([createPara("Operational Remarks", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.notes, 10, false, COLOR_MUTED, true)], undefined, 75, 3)
              ]
            }) : null
          ].filter(Boolean) as TableRow[]
        }),
        new Paragraph({ spacing: { before: 100, after: 100 } })
      );
    });
  }

  // 5. SEGREGATE - Category III: On-Demand Urgent Corrective Repairs
  docElements.push(
    new Paragraph({ spacing: { before: 200 } }),
    createPara("4. SECTION III: ON-DEMAND & URGENT CORRECTIVE REPAIRS", 24, true, COLOR_PRIMARY),
    createPara("High priority, fast response remedial campaigns to address spot defects", 11, false, COLOR_MUTED, true),
    new Paragraph({ spacing: { after: 100 } })
  );

  const onDemandJobs = jobs.filter(j => j.type === "OnDemand");
  if (onDemandJobs.length === 0) {
    docElements.push(createPara("No Urgent On-Demand repairs registered.", 11, false, COLOR_MUTED, true));
  } else {
    onDemandJobs.forEach((job, index) => {
      docElements.push(
        createPara(`${index + 1}. Emergency Level: ${job.emergencyLevel || "Urgent"} - ${job.title}`, 14, true, COLOR_RED),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell([createPara("Target Asset", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.assetName || "Unassigned", 10, false, COLOR_TEXT)], undefined, 25),
                createCell([createPara("Remediation Period", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(`${job.startDate} to ${job.endDate}`, 10, false, COLOR_TEXT)], undefined, 25)
              ]
            }),
            new TableRow({
              children: [
                createCell([createPara("Site Location", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.siteLocation || "Unspecified", 10, false, COLOR_TEXT)], undefined, 25),
                createCell([createPara("Repair Classification", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.onDemandType || "N/A", 10, false, COLOR_TEXT)], undefined, 25)
              ]
            }),
            new TableRow({
              children: [
                createCell([createPara("Campaign Status", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.status, 10, true, COLOR_RED)], undefined, 25),
                createCell([createPara("First Responder", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.technician || "Unassigned", 10, false, COLOR_TEXT)], undefined, 25)
              ]
            }),
            new TableRow({
              children: [
                createCell([createPara("Urgent Work Scope", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.scope || "No custom scope defined", 10, false, COLOR_TEXT, true)], undefined, 75, 3)
              ]
            }),
            job.notes ? new TableRow({
              children: [
                createCell([createPara("Remarks / Risks", 10, true, COLOR_PRIMARY)], COLOR_LIGHT_BG, 25),
                createCell([createPara(job.notes, 10, false, COLOR_MUTED, true)], undefined, 75, 3)
              ]
            }) : null
          ].filter(Boolean) as TableRow[]
        }),
        new Paragraph({ spacing: { before: 100, after: 100 } })
      );
    });
  }

  // Compile the unified document
  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: reportHeader
        },
        footers: {
          default: reportFooter
        },
        children: docElements
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Comprehensive_Industrial_Job_Audit_Report_${new Date().toISOString().split("T")[0]}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// PDF Download Generator using jsPDF
export function downloadJobPdfReport(jobs: Job[]) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 25;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = 25;
    }
  };

  // Title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("COMPREHENSIVE INDUSTRIAL JOB AUDIT REPORT", pageWidth / 2, y, { align: "center" });
  y += 6;

  doc.setFont("Helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(217, 119, 6); // Accent amber
  doc.text("Operational Activity & Maintenance Work Directory", pageWidth / 2, y, { align: "center" });
  y += 12;

  // Portfolio counts
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(10, y, pageWidth - 20, 22, 2, 2, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("OPERATIONAL AUDIT SUMMARY STATISTICS", 14, y + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`- PM Core Maintenance Campaigns: ${jobs.filter(j => j.type === "PM").length}`, 14, y + 12);
  doc.text(`- Major Capital Overhauls & Projects: ${jobs.filter(j => j.type === "Project").length}`, 14, y + 17);
  doc.text(`- On-Demand Remedial Urgent Tasks: ${jobs.filter(j => j.type === "OnDemand").length}`, 110, y + 12);
  y += 30;

  // Render segregated categories
  const categories: { title: string; subtitle: string; type: Job["type"] }[] = [
    { title: "I. PREVENTIVE MAINTENANCE (PM) CORE CAMPAIGNS", subtitle: "Scheduled cyclical coating health checks & UT thickness audits", type: "PM" },
    { title: "II. MAJOR INTEGRITY PROJECTS & CAPITAL CAMPAIGNS", subtitle: "Heavy industrial overhauls, high-build epoxy specifications", type: "Project" },
    { title: "III. ON-DEMAND & URGENT REMEDIAL REPAIRS", subtitle: "Spot remediation triggered by sudden localized failure detections", type: "OnDemand" }
  ];

  categories.forEach((cat) => {
    checkPageBreak(25);
    doc.setFillColor(30, 41, 59);
    doc.rect(10, y, pageWidth - 20, 6, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(cat.title, 13, y + 4.5);
    y += 10;

    doc.setFont("Helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(cat.subtitle, 10, y);
    y += 6;

    const catJobs = jobs.filter(j => j.type === cat.type);
    if (catJobs.length === 0) {
      doc.setFont("Helvetica", "normal");
      doc.text("No active campaigns listed in this section.", 12, y);
      y += 8;
    } else {
      catJobs.forEach((job) => {
        checkPageBreak(30);

        // Card header line
        doc.setFillColor(248, 250, 252);
        doc.rect(10, y, pageWidth - 20, 5, "F");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(217, 119, 6); // amber accent
        const titleText = `${job.workOrderNo || job.projectNo || "REF-PM"} - ${job.title}`;
        doc.text(titleText.substring(0, 100), 12, y + 3.5);
        y += 7;

        // Details
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);

        let details1 = "";
        let details2 = "";

        if (job.type === "PM") {
          details1 = `Target Asset: ${job.assetName || "General"} | PM Freq: ${job.frequency || "Daily"}`;
          details2 = `Technician: ${job.technician || "Unspecified"} | Period: ${job.startDate} to ${job.endDate}`;
        } else if (job.type === "Project") {
          details1 = `Client: ${job.client || "CGE"} | Manager: ${job.projectManager || "N/A"} | Phase: ${job.phase || "Active"}`;
          details2 = `Man-Hours Budget: ${job.budgetHours || 0} Hours | Period: ${job.startDate} to ${job.endDate}`;
        } else if (job.type === "OnDemand") {
          details1 = `Asset: ${job.assetName || "N/A"} | Site Location: ${job.siteLocation || "N/A"} | Type: ${job.onDemandType || "Standard"}`;
          details2 = `Responder: ${job.technician || "Unspecified"} | Emergency: ${job.emergencyLevel || "Urgent"}`;
        } else {
          details1 = `General Area: ${job.assetName || "Plant-wide"} | Foreman: ${job.foreman || "N/A"}`;
          details2 = `Crew Size: ${job.crewSize || 0} Men | Timeline: ${job.startDate} to ${job.endDate}`;
        }

        doc.text(details1, 12, y);
        y += 4;
        doc.text(details2, 12, y);
        y += 4.5;

        // Scope and Status
        doc.setFont("Helvetica", "bold");
        doc.text(`Status: ${job.status}  |  Priority: ${job.priority}`, 12, y);
        y += 4;

        if (job.scope) {
          doc.setFont("Helvetica", "normal");
          const splitScope = doc.splitTextToSize(`Scope: ${job.scope}`, pageWidth - 25);
          checkPageBreak(splitScope.length * 3.5);
          doc.text(splitScope, 12, y);
          y += (splitScope.length * 3.5) + 2;
        }

        if (job.notes) {
          doc.setFont("Helvetica", "italic");
          doc.setTextColor(100, 116, 139);
          const splitNotes = doc.splitTextToSize(`Remarks: "${job.notes}"`, pageWidth - 25);
          checkPageBreak(splitNotes.length * 3.5);
          doc.text(splitNotes, 12, y);
          y += (splitNotes.length * 3.5) + 3;
        }

        doc.setDrawColor(226, 232, 240);
        doc.line(10, y, pageWidth - 10, y);
        y += 5;
      });
    }
    y += 4;
  });

  // Draw headers and footers with dynamic page numbers across all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    doc.setFillColor(30, 41, 59); // Primary slate bg
    doc.rect(10, 8, pageWidth - 20, 1.5, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("SPIC CHINA POWER HUB GENERATION COMPANY", 10, 14);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("INTEGRITY & COATING AUDIT REPORT", pageWidth - 10, 14, { align: "right" });

    // footer line
    doc.setDrawColor(203, 213, 225);
    doc.line(10, pageHeight - 12, pageWidth - 10, pageHeight - 12);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("COMPREHENSIVE MD ANTI CORROSION", 10, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 10, pageHeight - 8, { align: "right" });
  }

  doc.save(`Comprehensive_Job_Audit_Report_${new Date().toISOString().split("T")[0]}.pdf`);
}

// CSV Download Generator
export function downloadJobCsvReport(jobs: Job[]) {
  const headers = [
    "Work Type",
    "Campaign ID/WorkOrder",
    "Campaign Title",
    "Target Asset / Location",
    "Timeline Start",
    "Timeline End",
    "Technician / PIC",
    "Campaign Status",
    "Priority Level",
    "Budget/Crew Detail",
    "Scope of Work",
    "Notes / Auditor Remarks"
  ];

  const rows = jobs.map((job) => {
    const idOrWo = job.workOrderNo || job.projectNo || job.id;
    const detail = job.type === "PM" ? `Freq: ${job.frequency || ""}` :
                   job.type === "Project" ? `Budget: ${job.budgetHours || 0} hrs` :
                   job.type === "OnDemand" ? `Emergency: ${job.emergencyLevel || ""}` :
                   `Crew: ${job.crewSize || 0} men`;

    const assetOrLocation = job.assetName || job.siteLocation || "General Plant";
    const pic = job.technician || job.projectManager || job.foreman || "Unspecified";

    return [
      job.type,
      idOrWo,
      job.title,
      assetOrLocation,
      job.startDate,
      job.endDate,
      pic,
      job.status,
      job.priority,
      detail,
      job.scope || "",
      job.notes || ""
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(val => {
      const formatted = String(val).replace(/"/g, '""');
      return formatted.includes(",") || formatted.includes("\n") ? `"${formatted}"` : formatted;
    }).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Comprehensive_Job_Operational_Directory_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
