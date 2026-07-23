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
  HeadingLevel,
  Header,
  Footer
} from "docx";
import { CorrosionReport } from "../types";

// Professional Color Palette matching the web application's elegant theme
const COLOR_PRIMARY = "1E293B"; // Dark Charcoal slate
const COLOR_ACCENT = "D97706";  // Amber accent
const COLOR_BORDER = "CBD5E1";  // Silver Border
const COLOR_LIGHT_BG = "F8FAFC"; // Soft slate off-white for table headers
const COLOR_TEXT = "334155";     // Clean dark text
const COLOR_MUTED = "64748B";    // slate secondary text
const COLOR_RED = "DC2626";      // Red for critical defects
const COLOR_ORANGE = "EA580C";   // Orange for high defects

// Helper of bilingual title formatting
function makeBilingualHeader(en: string, zh: string, size = 28): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 120, after: 40 },
      keepNext: true,
      children: [
        new TextRun({
          text: "■  " + en,
          bold: true,
          size: size,
          color: COLOR_PRIMARY,
          font: "Arial"
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 60 },
      keepNext: true,
      children: [
        new TextRun({
          text: "    " + zh,
          bold: true,
          size: size - 4,
          color: COLOR_ACCENT,
          font: "Microsoft YaHei"
        })
      ]
    })
  ];
}

// Helper of label-value table cell parameters
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

function createTextParagraph(text: string, isZh = false, italic = false, isBold = false): Paragraph {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({
        text,
        size: isZh ? 19 : 21,
        font: isZh ? "Microsoft YaHei" : "Calibri",
        italics: italic,
        bold: isBold,
        color: COLOR_TEXT
      })
    ]
  });
}

export async function downloadWordReport(report: CorrosionReport) {
  // Build standard 5-page report contents inside Word sections using standard XML groupings
  
  // Custom headers & footers matching user prompt details
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
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "国家电投 SPIC 中电国际胡布发电有限公司",
                        bold: true,
                        size: 16,
                        font: "Microsoft YaHei",
                        color: COLOR_PRIMARY
                      })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "CHINA POWER HUB GENERATION COMPANY (PVT.) LIMITED",
                        bold: true,
                        size: 11,
                        font: "Arial",
                        color: COLOR_MUTED
                      })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: "OFFICIAL INSPECTION SPECIFICATION",
                        bold: true,
                        size: 12,
                        font: "Arial",
                        color: COLOR_ACCENT
                      })
                    ]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: `TAG: ${report.metadata.tagNo || "PR-SEC-ZONE-02"}`,
                        bold: true,
                        size: 14,
                        font: "Courier New",
                        color: COLOR_PRIMARY
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Footer: includes corporate logo for COMPREHENSIVE MD ANTI CORROSION inside table cells
  const reportFooter = new Footer({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
          bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
          left: { style: BorderStyle.NONE, size: 0, color: "auto" },
          right: { style: BorderStyle.NONE, size: 0, color: "auto" },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "COMPREHENSIVE MD",
                        bold: true,
                        size: 16,
                        font: "Georgia",
                        color: COLOR_PRIMARY
                      }),
                      new TextRun({
                        text: "  |  ",
                        color: COLOR_BORDER,
                        bold: true,
                        size: 16
                      }),
                      new TextRun({
                        text: "ANTI CORROSION",
                        bold: true,
                        size: 11,
                        font: "Arial",
                        color: COLOR_ACCENT
                      })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Expert Forensic Engineering & Technical Asset Protection",
                        size: 12,
                        font: "Calibri",
                        color: COLOR_MUTED,
                        italics: true
                      })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: "NACE SP0169 · SP0188 · ISO 12944 · API 570 · ASTM D7091",
                        size: 12,
                        font: "Consolas",
                        color: COLOR_MUTED
                      })
                    ]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: "BILINGUAL TECHNICAL REPORT",
                        bold: true,
                        size: 11,
                        font: "Arial",
                        color: COLOR_PRIMARY
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Construct Content Pages
  const docElements: any[] = [];

  // ==================== COVER PAGE / INTRO ====================
  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 360, after: 120 },
      children: [
        new TextRun({
          text: report.header.company_en.toUpperCase(),
          bold: true,
          size: 26,
          font: "Arial",
          color: COLOR_PRIMARY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [
        new TextRun({
          text: report.header.company_zh,
          bold: true,
          size: 22,
          font: "Microsoft YaHei",
          color: COLOR_ACCENT
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 180, after: 80 },
      children: [
        new TextRun({
          text: report.header.title_en,
          bold: true,
          size: 32,
          font: "Georgia",
          color: COLOR_PRIMARY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 360 },
      children: [
        new TextRun({
          text: report.header.title_zh,
          bold: true,
          size: 24,
          font: "Microsoft YaHei",
          color: COLOR_MUTED
        })
      ]
    })
  );

  // Metadata Table
  const metaRows = [
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "ASSET PARAMETER / 设备参数", bold: true, size: 14, font: "Microsoft YaHei", color: COLOR_PRIMARY })] })], COLOR_LIGHT_BG, 50),
        createCell([new Paragraph({ children: [new TextRun({ text: "AUDIT FIELD VALUES / 检测数据", bold: true, size: 14, font: "Microsoft YaHei", color: COLOR_PRIMARY })] })], COLOR_LIGHT_BG, 50)
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Asset Name / 设施名称:", bold: true, size: 13, font: "Microsoft YaHei" })] })]),
        createCell([new Paragraph({ children: [new TextRun({ text: report.metadata.assetName || "Secondary Zone Pipe System", size: 13, font: "Calibri" })] })])
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Tag Number / 标签编码:", bold: true, size: 13, font: "Microsoft YaHei" })] })]),
        createCell([new Paragraph({ children: [new TextRun({ text: report.metadata.tagNo || "PR-SEC-ZONE-02", size: 13, font: "Calibri" })] })])
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Plant Unit / 厂区单位:", bold: true, size: 13, font: "Microsoft YaHei" })] })]),
        createCell([new Paragraph({ children: [new TextRun({ text: report.metadata.plant || "China Power Hub 2x660MW", size: 13, font: "Calibri" })] })])
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Process Area / 运行区域:", bold: true, size: 13, font: "Microsoft YaHei" })] })]),
        createCell([new Paragraph({ children: [new TextRun({ text: report.metadata.area || "Boiler Feed Water Pre-Heating Zone", size: 13, font: "Calibri" })] })])
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Location / 部位坐标:", bold: true, size: 13, font: "Microsoft YaHei" })] })]),
        createCell([new Paragraph({ children: [new TextRun({ text: report.metadata.location || "Section-03 Pipe Rack Supports", size: 13, font: "Calibri" })] })])
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Inspection Date / 检测日期:", bold: true, size: 13, font: "Microsoft YaHei" })] })]),
        createCell([new Paragraph({ children: [new TextRun({ text: report.metadata.date || "2026-06-15", size: 13, font: "Calibri" })] })])
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Lead Inspector / 主检工程师:", bold: true, size: 13, font: "Microsoft YaHei" })] })]),
        createCell([new Paragraph({ children: [new TextRun({ text: report.metadata.inspector || "NACE CIP Level III #89341", size: 13, font: "Calibri" })] })])
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Integrity Level / 风险等级:", bold: true, size: 13, font: "Microsoft YaHei" })] })]),
        createCell([
          new Paragraph({ 
            children: [
              new TextRun({ 
                text: report.metadata.priority || "HIGH", 
                bold: true, 
                size: 13, 
                font: "Calibri", 
                color: report.metadata.priority === "CRITICAL" ? COLOR_RED : (report.metadata.priority === "HIGH" ? COLOR_ORANGE : COLOR_PRIMARY)
              })
            ] 
          })
        ])
      ]
    })
  ];

  docElements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
        left: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
        right: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER }
      },
      rows: metaRows
    }),
    new Paragraph({ spacing: { before: 180, after: 120 } })
  );

  // Executive summary
  docElements.push(
    ...makeBilingualHeader("Executive Summary & Inspection Scope", "执行摘要与检测范围", 24),
    createTextParagraph(report.summary.en, false),
    createTextParagraph(report.summary.zh, true, true),
    new Paragraph({ spacing: { before: 180, after: 120 }, pageBreakBefore: true }) // Move to next page for Defects
  );

  // ==================== PAGE 2: FIELD DEFECTS DIRECTORY ====================
  docElements.push(
    ...makeBilingualHeader("Field-Observed Integrity Defects", "现地检出壁面结构缺陷名录", 24)
  );

  if (report.defects && report.defects.length > 0) {
    report.defects.forEach((defect, idx) => {
      const isCritical = defect.severity === "CRITICAL" || defect.severity === "HIGH";
      
      docElements.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          keepNext: true,
          children: [
            new TextRun({
              text: `Defect #${idx + 1}: ${defect.title_en}`,
              bold: true,
              size: 16,
              color: isCritical ? COLOR_RED : COLOR_PRIMARY,
              font: "Arial"
            })
          ]
        }),
        new Paragraph({
          spacing: { before: 0, after: 80 },
          children: [
            new TextRun({
              text: `缺陷 #${idx + 1}: ${defect.title_zh}  [Severity: ${defect.severity}]`,
              bold: true,
              size: 13,
              font: "Microsoft YaHei",
              color: COLOR_ACCENT
            })
          ]
        }),
        createTextParagraph(defect.desc_en, false),
        createTextParagraph(defect.desc_zh, true, true),
        new Paragraph({
          spacing: { before: 40, after: 180 },
          children: [
            new TextRun({
              text: "──────────────────────────────────────────────────",
              color: COLOR_BORDER,
              size: 10
            })
          ]
        })
      );
    });
  } else {
    docElements.push(
      createTextParagraph("No anomalies or major rust defects identified during this physical audit.", false),
      createTextParagraph("现地物理审计期间未发现明显异常或重度锈蚀缺陷。", true, true)
    );
  }

  // Next page: Root Cause
  docElements.push(
    new Paragraph({ pageBreakBefore: true })
  );

  // ==================== PAGE 3: ROOT CAUSE ANALYSIS ====================
  docElements.push(
    ...makeBilingualHeader("Forensic Chemical & Physical Root Cause Analysis", "失效与腐蚀演化根本原因物理电化学探伤分析", 24)
  );

  docElements.push(
    new Paragraph({
      spacing: { before: 120, after: 40 },
      keepNext: true,
      children: [
        new TextRun({ text: "1. Primary Corrosion Mechanisms / 首要腐蚀演化机制", bold: true, size: 15, font: "Microsoft YaHei", color: COLOR_PRIMARY })
      ]
    }),
    createTextParagraph(report.rootCause.mechanisms_en, false),
    createTextParagraph(report.rootCause.mechanisms_zh, true, true),

    new Paragraph({
      spacing: { before: 120, after: 40 },
      keepNext: true,
      children: [
        new TextRun({ text: "2. Support Geometry & Crevice Factors / 托架几何与缝隙应力集中因素", bold: true, size: 15, font: "Microsoft YaHei", color: COLOR_PRIMARY })
      ]
    }),
    createTextParagraph(report.rootCause.support_en, false),
    createTextParagraph(report.rootCause.support_zh, true, true),

    new Paragraph({
      spacing: { before: 120, after: 40 },
      keepNext: true,
      children: [
        new TextRun({ text: "3. Micro-Environmental Factors / 高温盐雾特殊微气候环境载荷", bold: true, size: 15, font: "Microsoft YaHei", color: COLOR_PRIMARY })
      ]
    }),
    createTextParagraph(report.rootCause.env_en, false),
    createTextParagraph(report.rootCause.env_zh, true, true),

    new Paragraph({
      spacing: { before: 120, after: 40 },
      keepNext: true,
      children: [
        new TextRun({ text: "4. Contributing Operational Parameters / 生产运行相关贡献参数分析", bold: true, size: 15, font: "Microsoft YaHei", color: COLOR_PRIMARY })
      ]
    }),
    createTextParagraph(report.rootCause.contributing_en, false),
    createTextParagraph(report.rootCause.contributing_zh, true, true)
  );

  // Next page: Remediation
  docElements.push(
    new Paragraph({ pageBreakBefore: true })
  );

  // ==================== PAGE 4: TECHNICAL REMEDIATION & COATING SPECIFICATION ====================
  docElements.push(
    ...makeBilingualHeader("Remediation & Protective Coating Specifications", "涂刷技术防腐规范与质量把控施工指导方案", 24)
  );

  const rectRows = [
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "COATING PARAMETER / 工程规范项目", bold: true, size: 13, font: "Microsoft YaHei", color: COLOR_PRIMARY })] })], COLOR_LIGHT_BG, 35),
        createCell([new Paragraph({ children: [new TextRun({ text: "SPECIFICATION DETAILS (ENGLISH / 中文)", bold: true, size: 13, font: "Microsoft YaHei", color: COLOR_PRIMARY })] })], COLOR_LIGHT_BG, 65)
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Surface Preparation / 表面处理级别", bold: true, size: 12, font: "Microsoft YaHei" })] })]),
        createCell([
          createTextParagraph(report.rectificationPlan.surfacePrep_en, false),
          createTextParagraph(report.rectificationPlan.surfacePrep_zh, true, true)
        ])
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Primer Coat / 底漆系统规范", bold: true, size: 12, font: "Microsoft YaHei" })] })]),
        createCell([
          createTextParagraph(report.rectificationPlan.primer_en, false),
          createTextParagraph(report.rectificationPlan.primer_zh, true, true)
        ])
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Intermediate Coat / 中间漆涂覆", bold: true, size: 12, font: "Microsoft YaHei" })] })]),
        createCell([
          createTextParagraph(report.rectificationPlan.intermediate_en, false),
          createTextParagraph(report.rectificationPlan.intermediate_zh, true, true)
        ])
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Topcoat / 面漆及耐候系统", bold: true, size: 12, font: "Microsoft YaHei" })] })]),
        createCell([
          createTextParagraph(report.rectificationPlan.topcoat_en, false),
          createTextParagraph(report.rectificationPlan.topcoat_zh, true, true)
        ])
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Dry Film Thickness / 目标干膜厚度DFT", bold: true, size: 12, font: "Microsoft YaHei" })] })]),
        createCell([
          createTextParagraph(report.rectificationPlan.dft_en, false),
          createTextParagraph(report.rectificationPlan.dft_zh, true, true)
        ])
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "Holiday Detection / 漏涂及漏电检测", bold: true, size: 12, font: "Microsoft YaHei" })] })]),
        createCell([
          createTextParagraph(report.rectificationPlan.holiday_en, false),
          createTextParagraph(report.rectificationPlan.holiday_zh, true, true)
        ])
      ]
    }),
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [new TextRun({ text: "HSE Standards / 现场安全与环保", bold: true, size: 12, font: "Microsoft YaHei" })] })]),
        createCell([
          createTextParagraph(report.rectificationPlan.safety_en, false),
          createTextParagraph(report.rectificationPlan.safety_zh, true, true)
        ])
      ]
    })
  ];

  docElements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
        left: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
        right: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER }
      },
      rows: rectRows
    }),
    new Paragraph({ spacing: { before: 120, after: 80 }, pageBreakBefore: true })
  );

  // ==================== PAGE 5: MAINTENANCE & LIFETIME RISK ASSESSMENT ====================
  docElements.push(
    ...makeBilingualHeader("Proactive Maintenance & Risk Timeline", "预防性维护频率与长效周期风险演化评估", 24)
  );

  // Maintenance info
  docElements.push(
    new Paragraph({
      spacing: { before: 120, after: 40 },
      keepNext: true,
      children: [
        new TextRun({ text: "1. Planned Inspection Frequency / 规划防腐巡检频率", bold: true, size: 15, font: "Microsoft YaHei", color: COLOR_PRIMARY })
      ]
    }),
    createTextParagraph(report.maintenancePlan.frequency_en, false),
    createTextParagraph(report.maintenancePlan.frequency_zh, true, true),

    new Paragraph({
      spacing: { before: 120, after: 40 },
      keepNext: true,
      children: [
        new TextRun({ text: "2. Corrosion Integrity Degradation Risks / 部位安全寿命及风险退化载荷", bold: true, size: 15, font: "Microsoft YaHei", color: COLOR_PRIMARY })
      ]
    }),
    createTextParagraph(report.riskAssessment.corrosionRate_en, false),
    createTextParagraph(report.riskAssessment.corrosionRate_zh, true, true),
    
    new Paragraph({
      spacing: { before: 120, after: 40 },
      keepNext: true,
      children: [
        new TextRun({ text: "3. Recommended Action Timeline / 建议治理排期规划", bold: true, size: 15, font: "Microsoft YaHei", color: COLOR_PRIMARY })
      ]
    }),
    createTextParagraph(`- Immediate (0-3M): ${report.recommendedTimeline.immediate_en}`, false),
    createTextParagraph(`  立即治理 (0-3个月): ${report.recommendedTimeline.immediate_zh}`, true, true),
    createTextParagraph(`- Medium-term (3-12M): ${report.recommendedTimeline.short_en}`, false),
    createTextParagraph(`  中期排期 (3-12个月): ${report.recommendedTimeline.short_zh}`, true, true),
    createTextParagraph(`- Long-term Routine: ${report.recommendedTimeline.long_en}`, false),
    createTextParagraph(`  长期例行: ${report.recommendedTimeline.long_zh}`, true, true)
  );

  // Build the unified Document
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

  // Export & Download trigger
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const tagStr = report.metadata.tagNo || "PR-SEC-ZONE-02";
  a.download = `SPIC_Bilingual_Corrosion_Report_${tagStr}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
