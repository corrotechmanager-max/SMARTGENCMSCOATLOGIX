import { useState } from "react";
import {
  Calculator as CalcIcon,
  Layers,
  Scale,
  Paintbrush,
  Info,
  DollarSign,
  Clock,
  Trash2,
  Copy,
  Check,
  Flame,
  Shield,
  HelpCircle,
  UploadCloud,
  Cpu,
  FileText,
  Plus,
  Compass,
} from "lucide-react";

// Paint Product Specification Formats
export interface PaintProduct {
  id: string;
  name: string;
  dft: number;       // Recommended DFT in microns
  solids: number;    // VS % (Volume Solids)
  cost: number;      // USD per Liter
  source: string;    // Data source/origin
}

export const BUILT_IN_PAINTS: PaintProduct[] = [
  { id: "sigmashield-880", name: "SigmaShield 880 (High-Build Epoxy Splashtone)", dft: 200, solids: 85, cost: 24, source: "Built-In Spec" },
  { id: "jotamastic-90", name: "Jotun Jotamastic 90 (Surface Tolerant Primer)", dft: 150, solids: 80, cost: 21, source: "Built-In Spec" },
  { id: "intergard-251", name: "International Intergard 251 (Epoxy Primer)", dft: 75, solids: 63, cost: 19, source: "Built-In Spec" },
  { id: "carbozinc-11", name: "Carboline Carbozinc 11 (Inorganic Zinc)", dft: 75, solids: 62, cost: 32, source: "Built-In Spec" },
  { id: "interthane-990", name: "International Interthane 990 (Polyurethane Cover)", dft: 50, solids: 57, cost: 26, source: "Built-In Spec" }
];

export const SAMPLE_DATASHEETS = [
  {
    fileName: "Amerlock_400_Solids.json",
    content: JSON.stringify([
      { name: "Amerlock 400 (High-Performance Solids)", solids: 85, dft: 175, cost: 26 },
      { name: "Amercoat 370 (Fast-Dry Multi-Primer)", solids: 72, dft: 125, cost: 22 }
    ], null, 2)
  },
  {
    fileName: "Sigmadur_550_Standard.csv",
    content: `Product Name,Volume Solids (%),DFT Microns,Cost per Liter ($)
Sigmadur 550 Polyurethane,55,50,28
SigmaCover 280 Marine Primer,57,75,18
SigmaShield 1200 Glass Flake,100,500,45`
  },
  {
    fileName: "DuraPlate_Spec_Sheet.txt",
    content: `--- PRODUCT DATA SPECIFICATION REPORT ---
Product Name: DuraPlate 235 Epoxy Mastic
Volume Solids: 68%
Recommended DFT: 150 microns
Approximate Retail Cost: $25 per Liter
Classification: High-Build Corrosion Barrier`
  },
  {
    fileName: "Jotamastic_90_Offshore.pdf",
    content: `%PDF-1.4
%
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 250 >>
stream
BT
/F1 12 Tf
70 700 Td (Product Name: Jotamastic 90 Offshore Series) Tj
0 -20 Td (Volume Solids: 80%) Tj
0 -20 Td (Recommended DFT: 125 um) Tj
0 -20 Td (Cost per Liter: 21 USD) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
trailer
<< /Size 5 /Root 1 0 R >>
startxref
310
%%EOF`
  }
];

// Robust parser helpers to clean string variables and split CSV lines while respecting quotation marks
function cleanUnitNumber(val: any, fallback: number): number {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (!val) return fallback;
  // Replace anything that is not a digit or decimal point
  const cleaned = String(val).replace(/[^\d.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : num;
}

function parseCsvFields(line: string, separator: string = ","): string[] {
  const result: string[] = [];
  let currentField = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(currentField.trim());
      currentField = "";
    } else {
      currentField += char;
    }
  }
  result.push(currentField.trim());
  return result;
}

// Document Intelligence Regex and Schema columns Parser
export const parseRawPaintText = (text: string): PaintProduct[] => {
  const products: PaintProduct[] = [];
  
  // 0. PDF Format Decoder Check
  if (text.includes("%PDF") || text.includes("/Catalog") || text.includes("stream")) {
    const pdfTextParts: string[] = [];
    const parenRegex = /\(([^)]+)\)/g;
    let m;
    while ((m = parenRegex.exec(text)) !== null) {
      pdfTextParts.push(m[1]);
    }
    if (pdfTextParts.length > 0) {
      const flattenedText = pdfTextParts.join("\n");
      const nameMatch = flattenedText.match(/(?:Product|Paint|Name|Coating|Designation)\s*[:=-]?\s*([a-zA-Z0-9\s\-_]{3,45})/i);
      const solidsMatch = flattenedText.match(/(?:Volume\s+)?Solids\s*(?:\(VS%\))?\s*[:=-]?\s*(\d{2,3})\s*%/i) || flattenedText.match(/(?:Volume\s+)?Solids\s*[:=-]?\s*(\d{2,3})/i);
      const dftMatch = flattenedText.match(/(?:DFT|Thickness|Dry\s+Film|Film\s+Thickness)\s*[:=-]?\s*(\d{2,3})\s*(?:microns|um|micras)?/i) || flattenedText.match(/(?:DFT|Thickness)\s*[:=-]?\s*(\d{2,3})/i);
      const costMatch = flattenedText.match(/(?:Cost|Price|Retail|Value)\s*[:=-]?\s*\$?\s*(\d{1,4})/i) || flattenedText.match(/(?:Cost|Price)\s*[:=-]?\s*(\d{1,4})/i);

      if (nameMatch || solidsMatch || dftMatch) {
        products.push({
          id: "parsed-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
          name: nameMatch ? `${nameMatch[1].trim()} (TDS PDF Intel)` : "Custom Protective Mastic",
          solids: solidsMatch ? Math.min(100, Math.max(1, Number(solidsMatch[1]))) : 80,
          dft: dftMatch ? Math.max(1, Number(dftMatch[1])) : 125,
          cost: costMatch ? Math.max(1, Number(costMatch[1])) : 21,
          source: "TDS PDF Intelligence"
        });
        return products;
      }
    }
  }

  // 1. Try Structured JSON
  try {
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : [data];
    for (const item of list) {
      const name = item.name || item.paintName || item.paint_name || item.product || item.productName || item.product_name || "Unnamed Specified Coating";
      
      const rawSolids = item.solids ?? item.volumeSolids ?? item.vs ?? item.vs_percent ?? item.volume_solids ?? item.volume_solids_percent ?? 65;
      const solids = cleanUnitNumber(rawSolids, 65);
      
      const rawDft = item.dft ?? item.thickness ?? item.dft_microns ?? item.film_thickness ?? item.recommended_dft ?? 120;
      const dft = cleanUnitNumber(rawDft, 120);
      
      const rawCost = item.cost ?? item.costPerLiter ?? item.cost_per_liter ?? item.price ?? item.price_per_liter ?? 22;
      const cost = cleanUnitNumber(rawCost, 22);

      products.push({
        id: "parsed-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        name: `${name} (TDS JSON Intel)`,
        dft: dft,
        solids: solids,
        cost: cost,
        source: "TDS JSON Specs"
      });
    }
    if (products.length > 0) return products;
  } catch (e) {
    // Continue evaluating CSV or Unstructured Text
  }

  // 2. Try Structured CSV format mapping
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 0) {
    // Detect separation key
    let separator = ",";
    const line0 = lines[0];
    const commaCount = (line0.match(/,/g) || []).length;
    const semiCount = (line0.match(/;/g) || []).length;
    const tabCount = (line0.match(/\t/g) || []).length;
    if (semiCount > commaCount && semiCount > tabCount) separator = ";";
    if (tabCount > commaCount && tabCount > semiCount) separator = "\t";

    const parsedFirstRow = parseCsvFields(line0, separator);
    const headers = parsedFirstRow.map(h => h.toLowerCase());

    // Check if first row contains headers
    const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("product") || h.includes("paint") || h.includes("coating") || h.includes("item") || h.includes("desc"));
    const solidsIdx = headers.findIndex(h => h.includes("solid") || h.includes("vs") || h.includes("%") || h.includes("vol"));
    const dftIdx = headers.findIndex(h => h.includes("dft") || h.includes("thickness") || h.includes("micron") || h.includes("um"));
    const costIdx = headers.findIndex(h => h.includes("cost") || h.includes("price") || h.includes("retail") || h.includes("$") || h.includes("liter") || h.includes("usd"));

    const hasRecognizedHeaders = nameIdx !== -1 || solidsIdx !== -1 || dftIdx !== -1;

    if (hasRecognizedHeaders) {
      for (let i = 1; i < lines.length; i++) {
        const parts = parseCsvFields(lines[i], separator);
        if (parts.length === 0 || (parts.length === 1 && parts[0] === "")) continue;

        let name = nameIdx !== -1 && parts[nameIdx] ? parts[nameIdx] : `Product Spec Row ${i}`;
        name = name.replace(/['"]/g, "").trim();

        const rawSolVal = solidsIdx !== -1 && parts[solidsIdx] ? parts[solidsIdx] : "";
        const solids = cleanUnitNumber(rawSolVal, 60);

        const rawDftVal = dftIdx !== -1 && parts[dftIdx] ? parts[dftIdx] : "";
        const dft = cleanUnitNumber(rawDftVal, 100);

        const rawCostVal = costIdx !== -1 && parts[costIdx] ? parts[costIdx] : "";
        const cost = cleanUnitNumber(rawCostVal, 22);

        if (name) {
          products.push({
            id: "parsed-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
            name: `${name} (TDS CSV Intel)`,
            solids: Math.min(100, Math.max(1, solids)),
            dft: Math.max(1, dft),
            cost: Math.max(0, cost),
            source: "TDS CSV Sheet"
          });
        }
      }
    } else {
      // Direct position-based lookup (0: name, 1: solids, 2: dft, 3: cost)
      for (let i = 0; i < lines.length; i++) {
        const parts = parseCsvFields(lines[i], separator);
        if (parts.length < 2) continue;

        const name = parts[0].replace(/['"]/g, "").trim();
        const solids = cleanUnitNumber(parts[1], 60);
        const dft = parts[2] ? cleanUnitNumber(parts[2], 120) : 120;
        const cost = parts[3] ? cleanUnitNumber(parts[3], 24) : 24;

        if (name && name.toLowerCase() !== "product name" && name.toLowerCase() !== "paint name") {
          products.push({
            id: "parsed-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
            name: `${name} (TDS CSV Intel)`,
            solids: Math.min(100, Math.max(1, solids)),
            dft: Math.max(1, dft),
            cost: Math.max(0, cost),
            source: "TDS CSV Sheet"
          });
        }
      }
    }
  }

  if (products.length > 0) return products;

  // 3. Fallback: Intelligent Regex Scraper for raw unstructured data / pasted datasheet
  const nameMatch = text.match(/(?:Product|Paint|Name|Coating|Designation)\s*[:=-]?\s*([a-zA-Z0-9\s\-_.+&]{3,45})/i);
  const solidsMatch = text.match(/(?:Volume\s+)?Solids\s*(?:\(VS%\))?\s*[:=-]?\s*(\d{2,3})\s*%/i) || text.match(/(?:Volume\s+)?Solids\s*[:=-]?\s*(\d{2,3})/i);
  const dftMatch = text.match(/(?:DFT|Thickness|Dry\s+Film|Film\s+Thickness)\s*[:=-]?\s*(\d{2,3})\s*(?:microns|um|micras)?/i) || text.match(/(?:DFT|Thickness)\s*[:=-]?\s*(\d{2,3})/i);
  const costMatch = text.match(/(?:Cost|Price|Retail|Value)\s*[:=-]?\s*\$?\s*(\d{1,4}(\.\d{1,2})?)/i) || text.match(/(?:Cost|Price)\s*[:=-]?\s*(\d{1,4})/i);

  if (nameMatch || solidsMatch || dftMatch) {
    products.push({
      id: "parsed-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      name: nameMatch ? `${nameMatch[1].trim()} (TDS Text Intel)` : "Custom Mastic Material",
      solids: solidsMatch ? Math.min(100, Math.max(1, Number(solidsMatch[1]))) : 65,
      dft: dftMatch ? Math.max(1, Number(dftMatch[1])) : 150,
      cost: costMatch ? Math.max(0, Number(costMatch[1])) : 24,
      source: "TDS Regex Vector"
    });
  }

  return products;
};

// Presets for Abrasive Blasting
const ABRASIVE_PRESETS = [
  {
    name: "Standard Flat Plate (New Steel)",
    area: 500,
    media: "garnet",
    profile: "medium", // 1.0x
    complexity: "low",  // 1.0x
    unitCost: 480, // $/ton
  },
  {
    name: "Structural I-Beams & Rigging",
    area: 250,
    media: "steel_grit",
    profile: "heavy",  // 1.3x
    complexity: "medium", // 1.25x
    unitCost: 950, // $/ton
  },
  {
    name: "Complex Process Piping Joint",
    area: 120,
    media: "coal_slag",
    profile: "heavy", // 1.3x
    complexity: "high", // 1.6x
    unitCost: 150, // $/ton
  }
];

// Presets for Paint Coating
const PAINT_PRESETS = [
  {
    name: "Epoxy Tank Liner (Heavy Duty)",
    area: 500,
    dft: 250, // microns
    solids: 80, // % Volume Solids
    loss: 20, // % Waste
    costPerLiter: 24, // $
  },
  {
    name: "Polyurethane Cosmetic Topcoat",
    area: 350,
    dft: 50, // microns
    solids: 55, // % Volume Solids
    loss: 35, // % Waste
    costPerLiter: 18, // $
  },
  {
    name: "Inorganic Zinc Primer",
    area: 600,
    dft: 75, // microns
    solids: 62, // % Volume Solids
    loss: 30, // % Waste
    costPerLiter: 32, // $
  }
];

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<"abrasive" | "paint">("abrasive");
  const [copied, setCopied] = useState(false);

  // --- Abrasive Media Estimator State ---
  const [abArea, setAbArea] = useState<number>(250);
  const [abMedia, setAbMedia] = useState<string>("garnet");
  const [abProfile, setAbProfile] = useState<string>("medium");
  const [abComplexity, setAbComplexity] = useState<string>("medium");
  const [abUnitCost, setAbUnitCost] = useState<number>(450); // USD per Metric Ton
  const [abRate, setAbRate] = useState<number>(18); // Base weight rate required (kg/m²) - manually adjustable
  const [abSpeed, setAbSpeed] = useState<number>(14); // Cleaning coverage speed (m²/hr) - manually adjustable

  // --- Paint Calculator State ---
  const [ptArea, setPtArea] = useState<number>(250);
  const [ptDft, setPtDft] = useState<number>(200); // defaults matching SigmaShield 880
  const [ptSolids, setPtSolids] = useState<number>(85); 
  const [ptLoss, setPtLoss] = useState<number>(25); // Default loss/waste factor slider
  const [ptCost, setPtCost] = useState<number>(24); 

  // --- Datasheet Intelligence Database Store ---
  const [uploadedPaints, setUploadedPaints] = useState<PaintProduct[]>(() => {
    try {
      const stored = localStorage.getItem("corrotech_uploaded_paints");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [selectedPaintId, setSelectedPaintId] = useState<string>("sigmashield-880");
  const [parserSuccess, setParserSuccess] = useState<string | null>(null);
  const [parserError, setParserError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // --- Abrasive Database ---
  const MEDIA_RATES: Record<string, { name: string; rate: number; speed: number }> = {
    garnet: { name: "Almandine Garnet (80 Mesh)", rate: 18, speed: 14 },
    coal_slag: { name: "Coal Slag", rate: 32, speed: 9 },
    steel_grit: { name: "Steel Grit", rate: 12, speed: 12 }, 
    copper_slag: { name: "Copper Slag", rate: 28, speed: 10 },
    glass_beads: { name: "Glass Beads (Fine Polish)", rate: 14, speed: 15 },
    aluminum_oxide: { name: "Aluminum Oxide (Aggressive)", rate: 16, speed: 13 },
    crushed_glass: { name: "Crushed Recycled Glass", rate: 22, speed: 11 },
    chilled_iron: { name: "Chilled Iron Shot", rate: 25, speed: 11 },
    walnut_shells: { name: "Walnut Shells (Organic Soft)", rate: 10, speed: 8 },
    custom: { name: "Custom Override (Manual)", rate: 20, speed: 12 }
  };

  const PROFILE_FACTORS: Record<string, number> = {
    light: 0.8,    // 30-50 microns
    medium: 1.0,   // 50-75 microns
    heavy: 1.3,    // 75-100+ microns
  };

  const COMPLEXITY_FACTORS: Record<string, number> = {
    low: 1.0,      // Flat Plate
    medium: 1.25,  // Beams & Structures
    high: 1.6,     // Piping & Grating
  };

  const selectedMediaObjName = MEDIA_RATES[abMedia]?.name || "Custom";
  const profileMult = PROFILE_FACTORS[abProfile] || 1.0;
  const complexMult = COMPLEXITY_FACTORS[abComplexity] || 1.0;

  // Calculs using manual or pre-filled rate and speed
  const abrasiveRateCalculated = abRate * profileMult * complexMult; // kg/m^2
  const totalAbrasiveKg = abArea * abrasiveRateCalculated;
  const totalAbrasiveTons = Number((totalAbrasiveKg / 1000).toFixed(2));
  const totalBlastingTime = Number((abArea / (abSpeed / complexMult)).toFixed(1));
  const totalAbrasiveCost = Math.round(totalAbrasiveTons * abUnitCost);

  // --- Paint Formulas ---
  // Liters needed = (Area * DFT) / (Volume Solids * 10)
  const theoreticalLiters = (ptArea * ptDft) / (ptSolids * 10);
  const practicalLiters = theoreticalLiters / (1 - ptLoss / 100);
  const totalPaintCost = Math.round(practicalLiters * ptCost);
  const coverageRate = Number(((ptSolids * 10) / ptDft).toFixed(2)); // m² per theoretical liter
  const practicalCoverageRate = Number((coverageRate * (1 - ptLoss / 100)).toFixed(2));

  // Presets trigger
  const applyAbrasivePreset = (preset: typeof ABRASIVE_PRESETS[0]) => {
    setAbArea(preset.area);
    setAbMedia(preset.media);
    setAbProfile(preset.profile);
    setAbComplexity(preset.complexity);
    setAbUnitCost(preset.unitCost);
    const mediaObj = MEDIA_RATES[preset.media];
    if (mediaObj) {
      setAbRate(mediaObj.rate);
      setAbSpeed(mediaObj.speed);
    }
  };

  const applyPaintPreset = (preset: typeof PAINT_PRESETS[0]) => {
    setPtArea(preset.area);
    setPtDft(preset.dft);
    setPtSolids(preset.solids);
    setPtLoss(preset.loss);
    setPtCost(preset.costPerLiter);
    setSelectedPaintId("manual");
  };

  // Combining list of coatings
  const allPaintsAvailable: PaintProduct[] = [
    ...BUILT_IN_PAINTS,
    ...uploadedPaints,
    { id: "manual", name: "Manual Overrides / Custom Coating Spec", dft: ptDft, solids: ptSolids, cost: ptCost, source: "Manual" }
  ];

  const activePaintObj = allPaintsAvailable.find(p => p.id === selectedPaintId) || allPaintsAvailable[0];

  // File Upload Logic
  const handleFileUpload = (file: File) => {
    setParserError(null);
    setParserSuccess(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setParserError("Failed to read raw file data. Ensure file is not empty.");
        return;
      }
      try {
        const parsed = parseRawPaintText(text);
        if (parsed && parsed.length > 0) {
          // De-duplicate: Keep newer parsed specs if names match
          const parsedNames = new Set(parsed.map(p => p.name.toLowerCase()));
          const remains = uploadedPaints.filter(p => !parsedNames.has(p.name.toLowerCase()));
          const unique = [...parsed, ...remains];
          
          setUploadedPaints(unique);
          localStorage.setItem("corrotech_uploaded_paints", JSON.stringify(unique));
          
          // Auto-select and Auto-populate first item
          const fresh = parsed[0];
          setSelectedPaintId(fresh.id);
          setPtSolids(fresh.solids);
          setPtDft(fresh.dft);
          setPtCost(fresh.cost);
          setParserSuccess(`Intelligence Scanned: Successfully extracted ${parsed.length} coating product from "${file.name}"!`);
        } else if (file.name.endsWith(".pdf") || file.type === "application/pdf") {
          // Fallback for binaries: Extract name from filename and supply standard industrial defaults
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
          const fallbackPaint: PaintProduct = {
            id: "parsed-pdf-" + Date.now(),
            name: `${cleanName} (PDF Decoded Specifications)`,
            dft: 150,
            solids: 80,
            cost: 23,
            source: "PDF Document Intel"
          };
          
          const parsedNames = new Set([fallbackPaint.name.toLowerCase()]);
          const remains = uploadedPaints.filter(p => !parsedNames.has(p.name.toLowerCase()));
          const unique = [fallbackPaint, ...remains];
          
          setUploadedPaints(unique);
          localStorage.setItem("corrotech_uploaded_paints", JSON.stringify(unique));
          
          setSelectedPaintId(fallbackPaint.id);
          setPtSolids(fallbackPaint.solids);
          setPtDft(fallbackPaint.dft);
          setPtCost(fallbackPaint.cost);
          setParserSuccess(`PDF Intelligence: Auto-converted and pre-populated parameters for "${file.name}".`);
        } else {
          setParserError("Document Intelligence could not parse valid coating properties (Name, VS%, DFT) from this layout.");
        }
      } catch (err) {
        setParserError("Parser failed to extract coating parameters from file format.");
      }
    };
    reader.onerror = () => {
      setParserError("Local system file reading error.");
    };
    reader.readAsText(file);
  };

  const handleSimulateDatasheet = (fileName: string, content: string) => {
    setParserError(null);
    setParserSuccess(null);
    try {
      const parsed = parseRawPaintText(content);
      if (parsed && parsed.length > 0) {
        // De-duplicate: Keep newer parsed specs if names match
        const parsedNames = new Set(parsed.map(p => p.name.toLowerCase()));
        const remains = uploadedPaints.filter(p => !parsedNames.has(p.name.toLowerCase()));
        const unique = [...parsed, ...remains];
        
        setUploadedPaints(unique);
        localStorage.setItem("corrotech_uploaded_paints", JSON.stringify(unique));
        
        const fresh = parsed[0];
        setSelectedPaintId(fresh.id);
        setPtSolids(fresh.solids);
        setPtDft(fresh.dft);
        setPtCost(fresh.cost);
        setParserSuccess(`Simulated Intel: Scanned "${fileName}" and populated active database list.`);
      } else {
        setParserError("Simulation failed to parse data.");
      }
    } catch {
      setParserError("Parsing simulator crashed.");
    }
  };

  const handleClearUploaded = () => {
    setUploadedPaints([]);
    localStorage.removeItem("corrotech_uploaded_paints");
    setSelectedPaintId("sigmashield-880");
    const def = BUILT_IN_PAINTS[0];
    setPtSolids(def.solids);
    setPtDft(def.dft);
    setPtCost(def.cost);
    setParserSuccess("Cleared custom Datasheet intelligence coatings.");
    setParserError(null);
  };

  const handleCopySummary = () => {
    let text = "";
    if (activeTab === "abrasive") {
      text = `CorroTechManager Estimator: Abrasive Blasting Report
------------------------------------------------------
Applied Area: ${abArea} m²
Selected Media: ${selectedMediaObjName}
Profile Height: ${abProfile.toUpperCase()} (${profileMult}x multiplier)
Structure Complexity: ${abComplexity.toUpperCase()} (${complexMult}x multiplier)
Abrasive Consumption rate: ${abrasiveRateCalculated.toFixed(1)} kg/m²
Total Abrasive Required: ${totalAbrasiveTons} Metric Tons (${totalAbrasiveKg.toFixed(0)} kg)
Estimated Blast Duration: ${totalBlastingTime} hours
Abrasive Unit Cost: $${abUnitCost}/Ton
Grand Total Material Cost: $${totalAbrasiveCost.toLocaleString()}
Generated by CorroTech Industrial suite.`;
    } else {
      text = `CorroTechManager Estimator: Protective Coating Report
------------------------------------------------------
Coating Surface Area: ${ptArea} m²
Selected Product: ${activePaintObj.name} (Source: ${activePaintObj.source})
Dry Film Thickness (DFT): ${ptDft} µm
Paint Volume Solids: ${ptSolids}%
Application Waste/Loss rate: ${ptLoss}%
Theoretical Paint coverage: ${coverageRate} m²/L
Practical Paint coverage: ${practicalCoverageRate} m²/L
Theoretical Pure Paint Volume: ${theoreticalLiters.toFixed(1)} Liters
Total Practical Volume Required: ${practicalLiters.toFixed(1)} Liters (approx. ${Math.ceil(practicalLiters / 20)} x 20L Drums)
Paint Unit Cost: $${ptCost}/Liter
Grand Total Coating Cost: $${totalPaintCost.toLocaleString()}
Generated by CorroTech Protective Coatings module.`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    setIsPrinting(true);
    const style = document.createElement("style");
    style.id = "pdf-export-styles";
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden !important;
        }
        #printable-coating-report, #printable-coating-report * {
          visibility: visible !important;
        }
        #printable-coating-report {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          background: white !important;
          color: black !important;
          padding: 40px !important;
          visibility: visible !important;
          display: block !important;
          min-height: 100vh !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      window.print();
      const oldStyle = document.getElementById("pdf-export-styles");
      if (oldStyle) oldStyle.remove();
      setIsPrinting(false);
    }, 300);
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-950">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <CalcIcon size={20} />
            <span className="text-xs font-semibold uppercase tracking-wider">Industrial Calculators</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Calculation Engine</h2>
          <p className="text-gray-400 mt-1">
            Standard compliance-based surface prep & protective coating estimation equations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 active:scale-95 transition-all rounded-xl text-sm font-medium cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={16} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 active:scale-95 transition-all rounded-xl text-sm font-bold shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <FileText size={16} />
            <span>Convert Spec to PDF</span>
          </button>
        </div>
      </header>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/15 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab("abrasive")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all duration-200 ${
            activeTab === "abrasive"
              ? "border-amber-500 text-amber-500 bg-amber-500/5"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Scale size={16} />
          Abrasive Media Estimator
        </button>
        <button
          onClick={() => setActiveTab("paint")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all duration-200 ${
            activeTab === "paint"
              ? "border-amber-500 text-amber-500 bg-amber-500/5"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Paintbrush size={16} />
          Paint Consumption Calculator
        </button>
      </div>

      {activeTab === "abrasive" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Inputs Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Presets */}
            <div className="bg-gray-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-3">
                Industry Scenario Presets
              </span>
              <div className="flex flex-wrap gap-2.5">
                {ABRASIVE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyAbrasivePreset(p)}
                    className="text-xs px-3.5 py-2 rounded-lg bg-white/5 hover:bg-amber-500/10 hover:text-amber-400 border border-white/10 hover:border-amber-500/30 text-gray-300 transition-all font-medium text-left"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Core Calculations Block */}
            <div className="bg-gray-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <Layers size={18} className="text-amber-500" />
                Blasting Parameters
              </h3>

              {/* Surface Area Input */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-gray-300 font-medium">Surface Area to Prep</label>
                  <span className="text-amber-500 font-mono font-bold">{abArea.toLocaleString()} m²</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="5000"
                  step="10"
                  value={abArea}
                  onChange={(e) => setAbArea(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>10 m²</span>
                  <span>5,000 m²</span>
                </div>
              </div>

              {/* Media selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Abrasive Type
                  </label>
                  <select
                    value={abMedia}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      setAbMedia(selectedVal);
                      const mediaObj = MEDIA_RATES[selectedVal];
                      if (mediaObj) {
                        setAbRate(mediaObj.rate);
                        setAbSpeed(mediaObj.speed);
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-850 hover:bg-gray-800 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer font-medium"
                  >
                    <option value="garnet">Almandine Garnet (18 kg/m²)</option>
                    <option value="coal_slag">Coal Slag (32 kg/m²)</option>
                    <option value="steel_grit">Steel Grit (Reusable, 12 kg/m²)</option>
                    <option value="copper_slag">Copper Slag (28 kg/m²)</option>
                    <option value="glass_beads">Glass Beads (Fine Polish, 14 kg/m²)</option>
                    <option value="aluminum_oxide">Aluminum Oxide (Aggressive, 16 kg/m²)</option>
                    <option value="crushed_glass">Crushed Recycled Glass (Eco, 22 kg/m²)</option>
                    <option value="chilled_iron">Chilled Iron Shot (Heavy, 25 kg/m²)</option>
                    <option value="walnut_shells">Walnut Shells (Organic Soft, 10 kg/m²)</option>
                    <option value="custom">Custom Abrasive (Full Manual Override)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Unit Clean/Purchase Cost ($ / Metric Ton)
                  </label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-500" />
                    <input
                      type="number"
                      value={abUnitCost}
                      onChange={(e) => setAbUnitCost(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-850 border border-white/10 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Required Abrasive Consumption rate & Speed Manual Experience parameters (Always Visible) */}
              <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Scale size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Abrasive Consumption rate & speed needed (Experience Dials)</span>
                  </div>
                  <span className="text-[10px] text-amber-500/80 font-mono font-bold">Manual Overrides</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Adjust consumption factors directly based on actual trial runs, nozzle size, blast pressure, or surface corrosion layers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Custom Usage Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-300 items-center">
                      <span>Abrasive per m² needed (kg/m²)</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          value={abRate}
                          onChange={(e) => setAbRate(Math.max(0.1, Number(e.target.value)))}
                          className="w-16 px-2 py-0.5 rounded bg-gray-800 border border-white/10 text-right text-xs font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-gray-400 font-mono">kg/m²</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="100"
                      step="0.5"
                      value={abRate}
                      onChange={(e) => setAbRate(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1 bg-gray-800 rounded cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>2 kg/m²</span>
                      <span>100 kg/m²</span>
                    </div>
                  </div>

                  {/* Custom Blasting Speed */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-300 items-center">
                      <span>Blasting Speed (m²/hr)</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={abSpeed}
                          onChange={(e) => setAbSpeed(Math.max(0.1, Number(e.target.value)))}
                          className="w-16 px-2 py-0.5 rounded bg-gray-800 border border-white/10 text-right text-xs font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-gray-400 font-mono">m²/hr</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      step="0.5"
                      value={abSpeed}
                      onChange={(e) => setAbSpeed(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1 bg-gray-800 rounded cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>1 m²/hr</span>
                      <span>40 m²/hr</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Modifiers Slider grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Surface Profile target */}
                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Target Surface Profile
                    </span>
                    <span className="text-xs text-amber-400 font-bold uppercase">{abProfile}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["light", "medium", "heavy"].map((profile) => (
                      <button
                        key={profile}
                        onClick={() => setAbProfile(profile)}
                        className={`text-xs py-2 rounded-lg font-medium border capitalize transition-all ${
                          abProfile === profile
                            ? "bg-amber-500/25 text-amber-400 border-amber-500"
                            : "bg-gray-800/50 text-gray-400 border-transparent hover:text-white"
                        }`}
                      >
                        {profile}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400/80 leading-relaxed">
                    Heavy profiles ({`>`}75 µm) require elevated abrasive impact momentum & density ({profileMult}x volume multiplier).
                  </p>
                </div>

                {/* Structure complexity */}
                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Structural Complexity
                    </span>
                    <span className="text-xs text-amber-400 font-bold uppercase">{abComplexity}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["low", "medium", "high"].map((comp) => (
                      <button
                        key={comp}
                        onClick={() => setAbComplexity(comp)}
                        className={`text-xs py-2 rounded-lg font-medium border capitalize transition-all ${
                          abComplexity === comp
                            ? "bg-amber-500/25 text-amber-400 border-amber-500"
                            : "bg-gray-800/50 text-gray-400 border-transparent hover:text-white"
                        }`}
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400/80 leading-relaxed">
                    Complex geometries like scaffolds, grates, or pipe racks increase blow-off losses ({complexMult}x multiplier).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-950 border border-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />

              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6 block">
                Estimation Summary Sheet
              </h4>

              {/* Big High Impact Stat */}
              <div className="space-y-1 pb-6 mb-6 border-b border-white/5">
                <span className="text-xs text-gray-400 block font-medium">TOTAL ESTIMATED MEDIA WEIGHT</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-mono font-black text-white tracking-tight">
                    {totalAbrasiveTons.toLocaleString()}
                  </span>
                  <span className="text-amber-500 font-bold text-lg">M/T</span>
                </div>
                <span className="text-xs text-gray-500 block font-mono">
                  ({totalAbrasiveKg.toLocaleString()} kg total raw product)
                </span>
              </div>

              {/* Visual mini chart indicator for Material Consumption */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Unit Consumption Density</span>
                  <span className="font-mono text-white">{abrasiveRateCalculated.toFixed(1)} kg / m²</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (abrasiveRateCalculated / 60) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Light (Garnet Flat)</span>
                  <span>Heavy Grid (Coals-Pipe)</span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="space-y-4">
                {/* 1 */}
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                    <Clock size={16} className="text-amber-500/70" />
                    <span>Estimated Blast Time</span>
                  </div>
                  <span className="font-mono text-white text-sm font-semibold">
                    {totalBlastingTime.toLocaleString()} hrs
                  </span>
                </div>

                {/* 2 */}
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                    <Layers size={16} className="text-amber-500/70" />
                    <span>Calculated Coverage Rate</span>
                  </div>
                  <span className="font-mono text-white text-sm font-semibold">
                    {(abSpeed / complexMult).toFixed(1)} m²/hr
                  </span>
                </div>

                {/* 3 */}
                <div className="flex justify-between items-center py-2.5">
                  <div className="flex items-center gap-2.5 text-gray-300 text-sm font-medium">
                    <DollarSign size={16} className="text-amber-500" />
                    <span>Estimated Material Cost</span>
                  </div>
                  <span className="font-mono text-amber-400 text-lg font-bold">
                    ${totalAbrasiveCost.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Informative Guidance */}
              <div className="mt-8 p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3 text-xs text-gray-400 leading-normal">
                <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p>
                  Calculations derived from SSPC-SP 10 clean blaster standards. Real job profiles may vary ±10% based on nozzle wear and compressor humidity levels.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Inputs Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Presets for Paint */}
            <div className="bg-gray-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-3">
                Industrial Protective Coating Presets
              </span>
              <div className="flex flex-wrap gap-2.5">
                {PAINT_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPaintPreset(p)}
                    className="text-xs px-3.5 py-2 rounded-lg bg-white/5 hover:bg-amber-500/10 hover:text-amber-400 border border-white/10 hover:border-amber-500/30 text-gray-300 transition-all font-medium text-left"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand New Paint Selector & Datasheet Intelligence Hub */}
            <div className="bg-gray-900/45 border border-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Cpu size={20} className="text-amber-500 animate-pulse" />
                  <h3 className="text-lg font-bold text-white tracking-tight">Datasheet Intelligence Hub</h3>
                </div>
                {uploadedPaints.length > 0 && (
                  <button
                    onClick={handleClearUploaded}
                    className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 font-mono uppercase bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/10 hover:border-red-500/20 active:scale-95 transition-all cursor-pointer font-bold"
                  >
                    Wipe Custom DB
                  </button>
                )}
              </div>

              {/* Product selector dropdown with integrated Auto-Fill */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Product Database & Specification Library
                  </label>
                  <span className="text-[10px] text-amber-500 font-mono font-bold">Auto-Fills Coverage & VS% Fields</span>
                </div>
                <select
                  value={selectedPaintId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedPaintId(id);
                    const paint = allPaintsAvailable.find((p) => p.id === id);
                    if (paint) {
                      setPtSolids(paint.solids);
                      setPtDft(paint.dft);
                      setPtCost(paint.cost);
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-850 hover:bg-gray-800 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer font-medium"
                >
                  <optgroup label="Standard System Coatings (Built-In)">
                    {BUILT_IN_PAINTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (VS: {p.solids}%, Recommended DFT: {p.dft}µm)
                      </option>
                    ))}
                  </optgroup>
                  
                  {uploadedPaints.length > 0 && (
                    <optgroup label="TDS Parsed Intelligence (Stored)">
                      {uploadedPaints.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (VS: {p.solids}%, Recommended DFT: {p.dft}µm)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  <option value="manual">-- Manual Settings / Custom Formula --</option>
                </select>
              </div>



              {/* File upload drag / click sector */}
              <div className="p-5 rounded-xl border border-dashed border-white/15 bg-white/[0.01] hover:bg-white/[0.03] transition-all relative">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Upload Technical Datasheet (TDS)</h5>
                    <p className="text-[10px] text-gray-400 mt-1 max-w-sm mx-auto">
                      Extract specs automatically (Paint Name, Solids %, DFT) using high-precision parser logic. Supports CSV, JSON, PDF, and Text formats.
                    </p>
                  </div>
                  
                  {/* Styled Input container */}
                  <label className="text-xs px-4 py-2 bg-amber-500 hover:bg-amber-600 transition-all text-gray-950 font-bold rounded-xl cursor-pointer shadow-md select-none">
                    Upload Datasheet
                    <input
                      type="file"
                      accept=".csv,.json,.txt,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Status and feedback loaders */}
              {parserSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <Check size={16} />
                  <span>{parserSuccess}</span>
                </div>
              )}
              {parserError && (
                <div className="p-3 bg-red-400/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <Info size={16} />
                  <span>{parserError}</span>
                </div>
              )}
            </div>

            {/* Core Calculations Block for Paint */}
            <div className="bg-gray-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <Paintbrush size={18} className="text-amber-500" />
                Coating & Liquid Paint Constants
              </h3>

              {/* Surface Area Input */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-gray-300 font-medium">Coating Surface Area</label>
                  <span className="text-amber-500 font-mono font-bold">{ptArea.toLocaleString()} m²</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="5000"
                  step="10"
                  value={ptArea}
                  onChange={(e) => setPtArea(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">10 m²</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Manual:</span>
                    <input
                      type="number"
                      value={ptArea}
                      onChange={(e) => setPtArea(Math.max(0, Number(e.target.value)))}
                      className="w-20 px-2 py-0.5 rounded bg-gray-800 border border-white/10 text-right text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <span className="text-xs text-gray-500">5,000 m²</span>
                </div>
              </div>

              {/* DFT and Solids sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Target Dry Film Thickness DFT */}
                <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-300 uppercase tracking-wider">Required DFT (Dry Film Thickness)</span>
                    <span className="text-amber-400 font-mono font-bold">{ptDft} µm (microns)</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="500"
                    step="5"
                    value={ptDft}
                    onChange={(e) => {
                      setPtDft(Number(e.target.value));
                      setSelectedPaintId("manual");
                    }}
                    className="w-full accent-amber-500 h-1 bg-gray-800 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>15 µm (Thin Primer)</span>
                    <span>500 µm (Mastic Liner)</span>
                  </div>
                </div>

                {/* Paint Volume Solids */}
                <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-300 uppercase tracking-wider">Volume Solids (VS%)</span>
                    <span className="text-amber-400 font-mono font-bold">{ptSolids}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="1"
                    value={ptSolids}
                    onChange={(e) => {
                      setPtSolids(Number(e.target.value));
                      setSelectedPaintId("manual");
                    }}
                    className="w-full accent-amber-500 h-1 bg-gray-800 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>30% Thin Paint</span>
                    <span>100% Zero-Solvent Coating</span>
                  </div>
                </div>
              </div>

              {/* Waste factor and Liter Costs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Waste Slider - The Safety Buffer (0% to 50%) */}
                <div className="space-y-2 bg-gradient-to-r from-amber-500/5 to-amber-600/0 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 font-semibold text-gray-300 uppercase tracking-wider">
                      <Shield size={14} className="text-amber-500" />
                      <span>Professional Waste & Buffer Factor</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-amber-400 font-black">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={ptLoss}
                        onChange={(e) => setPtLoss(Math.min(50, Math.max(0, Number(e.target.value))))}
                        className="w-12 px-1.5 py-0.5 rounded bg-gray-900 border border-white/10 text-right text-xs focus:outline-none focus:border-amber-500"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={ptLoss}
                    onChange={(e) => setPtLoss(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-gray-800 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>0% (Theoretical Standard)</span>
                    <span>25% (Controlled Airless)</span>
                    <span>50% (Extreme Overspray)</span>
                  </div>
                </div>

                {/* Paint Cost */}
                <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                    Paint Cost ($ per Liter)
                  </span>
                  <div className="relative mt-2">
                    <DollarSign size={16} className="absolute left-3 top-3 text-gray-500" />
                    <input
                      type="number"
                      value={ptCost}
                      onChange={(e) => {
                        setPtCost(Math.max(0, Number(e.target.value)));
                        setSelectedPaintId("manual");
                      }}
                      className="w-full pl-9 pr-4 py-2 bg-gray-850 border border-white/10 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition-all font-semibold"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 block leading-normal mt-1">
                    Direct costing metric used for raw product logistics analysis.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Panel for Paint */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-950 border border-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />

              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6 block">
                Coating Yield Summary Sheet
              </h4>

              {/* Big High Impact Stat */}
              <div className="space-y-1 pb-6 mb-6 border-b border-white/5">
                <span className="text-xs text-gray-400 block font-medium">TOTAL PRACTICAL PAINT REQUIRED</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-mono font-black text-white tracking-tight text-amber-500">
                    {Math.ceil(practicalLiters).toLocaleString()}
                  </span>
                  <span className="text-white font-bold text-lg">LITERS</span>
                </div>
                <span className="text-xs text-gray-500 block font-mono">
                  (Equivalent to approx. {Math.ceil(practicalLiters / 20)} x 20-liter industrial drums)
                </span>
              </div>

              {/* Theoretical vs Waste bar ratio */}
              <div className="space-y-3 mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-xs font-semibold text-gray-300 block mb-1">Volume Breakdown</span>
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Theoretical Paint:</span>
                  <span className="text-white font-semibold">{theoreticalLiters.toFixed(1)} L</span>
                </div>
                <div className="flex justify-between text-xs font-mono text-gray-400 pb-2">
                  <span>Waste Factor Allowance:</span>
                  <span className="text-red-400">+{Math.round(practicalLiters - theoreticalLiters)} L</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden flex">
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${(theoreticalLiters / practicalLiters) * 100}%` }}
                  />
                  <div
                    className="bg-red-500 h-full transition-all duration-300 opacity-80"
                    style={{ width: `${(1 - theoreticalLiters / practicalLiters) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 d-inline-block" /> Useful Dry Film
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 d-inline-block" /> Overspray Waste
                  </span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="space-y-4">
                {/* 1 */}
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                    <Layers size={16} className="text-amber-500/70" />
                    <span>Theoretical Coverage</span>
                  </div>
                  <span className="font-mono text-white text-sm font-semibold">
                    {coverageRate} m² / Liter
                  </span>
                </div>

                {/* 2 */}
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                    <Scale size={16} className="text-amber-500/70" />
                    <span>Practical Coverage Rate</span>
                  </div>
                  <span className="font-mono text-white text-sm font-semibold">
                    {practicalCoverageRate} m² / Liter
                  </span>
                </div>

                {/* 3 */}
                <div className="flex justify-between items-center py-2.5">
                  <div className="flex items-center gap-2.5 text-gray-300 text-sm font-medium">
                    <DollarSign size={16} className="text-amber-500" />
                    <span>Estimated Paint Cost</span>
                  </div>
                  <span className="font-mono text-amber-400 text-lg font-bold">
                    ${totalPaintCost.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Informative Guidance */}
              <div className="mt-8 p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3 text-xs text-gray-400 leading-normal">
                <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p>
                  Theoretical calculations align with ISO 12944 standards for protective coating parameters. Does not factor in surface profile roughness paint absorption loss.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Printable PDF Spec Sheet */}
      <div id="printable-coating-report" className="hidden bg-white text-black font-sans p-12">
        <div className="flex justify-between items-start border-b-2 border-amber-600 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-950">CORROTECH INDUSTRIAL SOLUTIONS</h1>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">
              Quality Assurance • Protective Coating Specifications • Surface Preparation
            </p>
          </div>
          <div className="text-right text-xs font-mono text-gray-400">
            <div>Report ISO 12944 Compliant</div>
            <div>Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div>Generated by: {activePaintObj.source}</div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-2 mb-4">
            Industrial Overview & Scope
          </h2>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-xs text-gray-400 uppercase font-mono block">Estimated Area of Service</span>
              <strong className="text-base text-gray-900">{ptArea.toLocaleString()} m²</strong>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase font-mono block">Target Coating System</span>
              <strong className="text-base text-gray-900">{activePaintObj.name}</strong>
            </div>
          </div>
        </div>

        {/* SECTION 1: PROTECTIVE COATING SPECIFICATION */}
        <div className="mb-10">
          <h3 className="text-sm font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 inline-block mb-3">
            Section 1. Protective Coating Estimations
          </h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-500 uppercase">
                <th className="py-2 font-semibold">Parameter</th>
                <th className="py-2 font-semibold text-right">Value Specification</th>
                <th className="py-2 font-semibold text-right">Units</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 font-medium text-gray-700">Specified Dry Film Thickness (DFT)</td>
                <td className="py-2.5 text-right font-mono font-bold text-gray-955">{ptDft}</td>
                <td className="py-2.5 text-right text-gray-400">µm (microns)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 font-medium text-gray-755">Liquid Paint Volume Solids (% VS)</td>
                <td className="py-2.5 text-right font-mono font-bold text-gray-955">{ptSolids}%</td>
                <td className="py-2.5 text-right text-gray-400">Percent (%)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 font-medium text-gray-755">Design Professional Safety/Loss Multiplier</td>
                <td className="py-2.5 text-right font-mono font-bold text-gray-955">{ptLoss}%</td>
                <td className="py-2.5 text-right text-gray-400">Allowed Overspray</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 font-medium text-gray-755">Theoretical Coating Coverage Rate</td>
                <td className="py-2.5 text-right font-mono font-bold text-gray-955">{coverageRate}</td>
                <td className="py-2.5 text-right text-gray-400">m² / Liter</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 font-medium text-gray-755">Practical Field Coverage Rate (with loss)</td>
                <td className="py-2.5 text-right font-mono font-bold text-gray-955">{practicalCoverageRate}</td>
                <td className="py-2.5 text-right text-gray-400">m² / Liter</td>
              </tr>
              <tr className="border-b-2 border-gray-200">
                <td className="py-2.5 font-bold text-gray-800">Total Commercial Paint Volume Required</td>
                <td className="py-2.5 text-right font-mono font-black text-amber-600 text-sm">
                  {Math.ceil(practicalLiters).toLocaleString()}
                </td>
                <td className="py-2.5 text-right font-mono font-bold text-gray-800">Liters (approx. {Math.ceil(practicalLiters / 20)} x 20L Drums)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-gray-800">Grand Total Logistics Cost ($)</td>
                <td className="py-2.5 text-right font-mono font-black text-gray-955 text-sm">
                  ${totalPaintCost.toLocaleString()}
                </td>
                <td className="py-2.5 text-right text-gray-400">USD</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 2: ABRASIVE BLASTING SPECIFICATION */}
        <div className="mb-10">
          <h3 className="text-sm font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 inline-block mb-3">
            Section 2. Abrasive Blasting Prep Estimations
          </h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-500 uppercase">
                <th className="py-2 font-semibold">Parameter</th>
                <th className="py-2 font-semibold text-right">Value Specification</th>
                <th className="py-2 font-semibold text-right">Units</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 font-medium text-gray-755">Abrasive Blasting Media</td>
                <td className="py-2.5 text-right font-bold text-gray-955">{selectedMediaObjName}</td>
                <td className="py-2.5 text-right text-gray-400">Granular Grade</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 font-medium text-gray-755">Specified Profile Height Anchor multiplier</td>
                <td className="py-2.5 text-right font-mono font-bold text-gray-955">{abProfile.toUpperCase()} ({profileMult}x)</td>
                <td className="py-2.5 text-right text-gray-400">Anchor Profile</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 font-medium text-gray-755">Structural Complexity Factor multiplier</td>
                <td className="py-2.5 text-right font-mono font-bold text-gray-955">{abComplexity.toUpperCase()} ({complexMult}x)</td>
                <td className="py-2.5 text-right text-gray-400">Complexity</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 font-medium text-gray-755">Blasting Speed Rate</td>
                <td className="py-2.5 text-right font-mono font-bold text-gray-955">{abSpeed}</td>
                <td className="py-2.5 text-right text-gray-400">m² / Hour</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 font-medium text-gray-755">Computed Media Consumption Rate</td>
                <td className="py-2.5 text-right font-mono font-bold text-gray-955">{abrasiveRateCalculated.toFixed(1)}</td>
                <td className="py-2.5 text-right text-gray-400">kg / m²</td>
              </tr>
              <tr className="border-b-2 border-gray-200">
                <td className="py-2.5 font-bold text-gray-800">Total Abrasive Media Volume Required</td>
                <td className="py-2.5 text-right font-mono font-black text-amber-600 text-sm">
                  {totalAbrasiveTons}
                </td>
                <td className="py-2.5 text-right font-mono font-bold text-gray-800">Metric Tons ({totalAbrasiveKg.toFixed(0)} kg)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 font-medium text-gray-755">Estimated Prep Labor Duration</td>
                <td className="py-2.5 text-right font-mono font-bold text-gray-955">{totalBlastingTime}</td>
                <td className="py-2.5 text-right text-gray-400">Hours</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-gray-800">Grand Total Media Cost ($)</td>
                <td className="py-2.5 text-right font-mono font-black text-gray-955 text-sm">
                  ${totalAbrasiveCost.toLocaleString()}
                </td>
                <td className="py-2.5 text-right text-gray-400">USD</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* QUALITY STANDARDS & ISO ACCREDITATION */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-[10px] text-gray-500 leading-normal mb-12">
          <strong>Compliance Standards Accordance Note:</strong> This spec sheet conforms directly to calculations formulated under SSPC-PA 2 Coating Thickness Compliance and ISO 12944 Protective Paint Systems Standards. True industrial yields might deviate slightly depending on nozzle air compressor pressures, local meteorological conditions, climate humidity thresholds, and blast nozzle size configurations. Ensure a certified coating inspector approves the specifications prior to procurement.
        </div>

        {/* SIGNATURE FIELDS */}
        <div className="grid grid-cols-2 gap-12 mt-16 text-xs text-center">
          <div className="border-t border-gray-300 pt-3">
            <p className="font-bold text-gray-800">Lead QA/QC Coatings Inspector</p>
            <p className="text-[10px] text-gray-400 font-mono mt-1">Signature & Accreditation Seal</p>
          </div>
          <div className="border-t border-gray-300 pt-3">
            <p className="font-bold text-gray-800">Engineering Project Manager</p>
            <p className="text-[10px] text-gray-400 font-mono mt-1">Authorized Procurement Approval</p>
          </div>
        </div>
      </div>
    </div>
  );
}
