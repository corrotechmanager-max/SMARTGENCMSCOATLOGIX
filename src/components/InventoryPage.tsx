import { useState, useEffect, useMemo, FormEvent } from "react";
import {
  Paintbrush,
  Wrench,
  Package,
  Search,
  SlidersHorizontal,
  Plus,
  X,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  History,
  User,
  Calendar,
  ArrowUpRight,
  Download,
  Printer
} from "lucide-react";
import { InventoryItem, IssuedPaintRecord, Job } from "../types";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Helper utilities to parse and convert CSS OKLCH and OKLAB color formats to standard RGB/RGBA.
// This is critical to prevent html2canvas's CSS parser from crashing on modern CSS color functions.
function parseOklch(str: string): { l: number; c: number; h: number; a: number } | null {
  const match = str.match(/oklch\s*\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].trim().split(/[\s,/]+/);
  if (parts.length < 3) return null;

  let l = parseFloat(parts[0]);
  if (parts[0].includes("%")) l = l / 100;

  const c = parseFloat(parts[1]);

  let h = parseFloat(parts[2]);
  if (parts[2].includes("rad")) {
    h = h * (180 / Math.PI);
  } else if (parts[2].includes("grad")) {
    h = h * 0.9;
  } else if (parts[2].includes("turn")) {
    h = h * 360;
  }

  let a = 1;
  if (parts.length >= 4) {
    const alphaStr = parts[3];
    a = parseFloat(alphaStr);
    if (alphaStr.includes("%")) a = a / 100;
  }

  return { l, c, h, a };
}

function parseOklab(str: string): { l: number; a: number; b: number; alpha: number } | null {
  const match = str.match(/oklab\s*\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].trim().split(/[\s,/]+/);
  if (parts.length < 3) return null;

  let l = parseFloat(parts[0]);
  if (parts[0].includes("%")) l = l / 100;

  const a = parseFloat(parts[1]);
  const b = parseFloat(parts[2]);

  let alpha = 1;
  if (parts.length >= 4) {
    const alphaStr = parts[3];
    alpha = parseFloat(alphaStr);
    if (alphaStr.includes("%")) alpha = alpha / 100;
  }

  return { l, a, b, alpha };
}

function oklabToRgb(l: number, a: number, b: number, alpha: number): string {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l_cube = l_ * l_ * l_;
  const m_cube = m_ * m_ * m_;
  const s_cube = s_ * s_ * s_;

  const r_lin = +4.0767416621 * l_cube - 3.3077115913 * m_cube + 0.2309699292 * s_cube;
  const g_lin = -1.2684380046 * l_cube + 2.6097574011 * m_cube - 0.3413193965 * s_cube;
  const b_lin = -0.0041960863 * l_cube - 0.7034186147 * m_cube + 1.7076147010 * s_cube;

  const gamma = (c: number) => {
    if (c <= 0.0031308) {
      return 12.92 * c;
    } else {
      return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    }
  };

  const r = Math.round(Math.max(0, Math.min(1, gamma(r_lin))) * 255);
  const g = Math.round(Math.max(0, Math.min(1, gamma(g_lin))) * 255);
  const b_val = Math.round(Math.max(0, Math.min(1, gamma(b_lin))) * 255);

  if (alpha === 1) {
    return `rgb(${r}, ${g}, ${b_val})`;
  } else {
    return `rgba(${r}, ${g}, ${b_val}, ${alpha})`;
  }
}

function oklchToRgb(l: number, c: number, h: number, alpha: number): string {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  return oklabToRgb(l, a, b, alpha);
}

function convertOklToRgb(value: string): string {
  if (!value) return value;
  if (!value.includes("oklch") && !value.includes("oklab")) return value;

  let result = value.replace(/oklch\([^)]+\)/gi, (match) => {
    try {
      const parsed = parseOklch(match);
      if (parsed) {
        return oklchToRgb(parsed.l, parsed.c, parsed.h, parsed.a);
      }
    } catch (e) {
      console.error("Error converting OKLCH match", match, e);
    }
    return "rgb(0, 0, 0)";
  });

  result = result.replace(/oklab\([^)]+\)/gi, (match) => {
    try {
      const parsed = parseOklab(match);
      if (parsed) {
        return oklabToRgb(parsed.l, parsed.a, parsed.b, parsed.alpha);
      }
    } catch (e) {
      console.error("Error converting OKLAB match", match, e);
    }
    return "rgb(0, 0, 0)";
  });

  return result;
}

// Pre-seed realistic data for CorroTech corrosion control inventory
const DEFAULT_INVENTORY: InventoryItem[] = [
  // Paint Store
  {
    id: "inv-1",
    name: "Interzinc 52 — Epoxy Zinc-Rich Primer",
    store: "Paint",
    category: "Coatings",
    sku: "IZ52-GRY-5L",
    quantity: 45,
    unit: "litre",
    minStock: 15,
    location: "Paint Store Shelf A1",
    supplier: "International Paint",
    notes: "Epoxy zinc primer, Gray color. Batch #82103."
  },
  {
    id: "inv-2",
    name: "Intergard 475HS — MIO Epoxy Tie-coat",
    store: "Paint",
    category: "Coatings",
    sku: "IG475-MIO-20L",
    quantity: 120,
    unit: "litre",
    minStock: 40,
    location: "Paint Store Shelf A2",
    supplier: "International Paint",
    notes: "High build epoxy tie-coat with Micaceous Iron Oxide. Batch #77412."
  },
  {
    id: "inv-3",
    name: "Interthane 990 — Polyurethane Topcoat",
    store: "Paint",
    category: "Coatings",
    sku: "IT990-WHT-5L",
    quantity: 8,
    unit: "litre",
    minStock: 12,
    location: "Paint Store Shelf B1",
    supplier: "International Paint",
    notes: "High gloss white aliphatic polyurethane topcoat. Batch #90223. Low stock alert!"
  },
  {
    id: "inv-4",
    name: "GTA220 — Epoxy Thinner",
    store: "Paint",
    category: "Thinners",
    sku: "GTA220-5L",
    quantity: 0,
    unit: "can",
    minStock: 5,
    location: "Paint Store Flammable Cabinet 1",
    supplier: "International Paint",
    notes: "Thinner for epoxy coatings. Order urgent replenishment."
  },
  // Equipment Store
  {
    id: "inv-5",
    name: "Elcometer 456 — Coating Thickness Gauge",
    store: "Equipment",
    category: "NDT Instruments",
    sku: "ELC-456-F1",
    quantity: 4,
    unit: "pcs",
    minStock: 2,
    location: "Instrument Cabinet A",
    supplier: "Elcometer Ltd.",
    notes: "Dry film thickness gauge, Model F with scan probe. Calibrated Feb 2026."
  },
  {
    id: "inv-6",
    name: "Garnet Abrasive Blast Grit (30/60 Mesh)",
    store: "Equipment",
    category: "Abrasives",
    sku: "GARNET-3060-25K",
    quantity: 1500,
    unit: "kg",
    minStock: 1000,
    location: "Silo Area 2",
    supplier: "Almandine Corp",
    notes: "High-quality blasting media for structural steel preparation."
  },
  {
    id: "inv-7",
    name: "Blast Nozzle No.6 (Silicon Carbide)",
    store: "Equipment",
    category: "Blasting Accessories",
    sku: "NOZ-6-SC",
    quantity: 1,
    unit: "pcs",
    minStock: 3,
    location: "Tool Crib Bin B4",
    supplier: "Graco Corp",
    notes: "Silicon carbide lining, wide venturi configuration."
  }
];

const DEFAULT_ISSUED_PAINT: IssuedPaintRecord[] = [
  {
    id: "issue-1",
    itemId: "inv-1",
    itemName: "Interzinc 52 — Epoxy Zinc-Rich Primer",
    sku: "IZ52-GRY-5L",
    quantity: 15,
    unit: "litre",
    jobId: "job-1",
    jobTitle: "Offshore Riser R-4 Corrosion Treatment",
    issuedTo: "Robert Chen (Foreman)",
    issuedBy: "A. Davis (Admin)",
    issueDate: "2026-07-14",
    notes: "First stage primer application for Splash Zone section."
  },
  {
    id: "issue-2",
    itemId: "inv-2",
    itemName: "Intergard 475HS — MIO Epoxy Tie-coat",
    sku: "IG475-MIO-20L",
    quantity: 40,
    unit: "litre",
    jobId: "job-2",
    jobTitle: "Main Platform Deck Recoating",
    issuedTo: "Marcus Brody (Lead Applicator)",
    issuedBy: "A. Davis (Admin)",
    issueDate: "2026-07-15",
    notes: "High-build tie-coat over zinc primer on eastern deck walkway."
  }
];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activeStore, setActiveStore] = useState<"Paint" | "Equipment">("Paint");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"All" | "Low" | "Out">("All");
  const [sortBy, setSortBy] = useState<"Name" | "Qty" | "Category">("Name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Paint Store sub-tab
  const [paintSubTab, setPaintSubTab] = useState<"available" | "issued">("available");

  // Issued Paint State
  const [issuedRecords, setIssuedRecords] = useState<IssuedPaintRecord[]>([]);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // Issue Paint form fields
  const [issueItemId, setIssueItemId] = useState("");
  const [issueQuantity, setIssueQuantity] = useState(1);
  const [issueJobId, setIssueJobId] = useState("");
  const [issueIssuedTo, setIssueIssuedTo] = useState("");
  const [issueIssuedBy, setIssueIssuedBy] = useState("A. Davis (Admin)");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [issueNotes, setIssueNotes] = useState("");
  const [issueRequestingDept, setIssueRequestingDept] = useState("Asset Protection Dept");
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [previewSlipRecord, setPreviewSlipRecord] = useState<IssuedPaintRecord | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [triggerAutoDownload, setTriggerAutoDownload] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [returnConfirmId, setReturnConfirmId] = useState<string | null>(null);
  const [deleteIssuedConfirmId, setDeleteIssuedConfirmId] = useState<string | null>(null);

  // Form Fields
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Coatings");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("litre");
  const [minStock, setMinStock] = useState(0);
  const [location, setLocation] = useState("");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");

  // Load items & issued records from local storage
  useEffect(() => {
    const stored = localStorage.getItem("corrotech_inventory");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        setItems(DEFAULT_INVENTORY);
      }
    } else {
      setItems(DEFAULT_INVENTORY);
      localStorage.setItem("corrotech_inventory", JSON.stringify(DEFAULT_INVENTORY));
    }

    const storedIssued = localStorage.getItem("corrotech_issued_paint");
    if (storedIssued) {
      try {
        setIssuedRecords(JSON.parse(storedIssued));
      } catch (e) {
        setIssuedRecords(DEFAULT_ISSUED_PAINT);
      }
    } else {
      setIssuedRecords(DEFAULT_ISSUED_PAINT);
      localStorage.setItem("corrotech_issued_paint", JSON.stringify(DEFAULT_ISSUED_PAINT));
    }

    // Load active jobs for dropdown list
    const storedJobs = localStorage.getItem("corrotech_jobs");
    if (storedJobs) {
      try {
        const parsedJobs: Job[] = JSON.parse(storedJobs);
        setJobs(parsedJobs.map(j => ({ id: j.id, title: j.title })));
      } catch (e) {
        setJobs([
          { id: "job-1", title: "Offshore Riser R-4 Corrosion Treatment" },
          { id: "job-2", title: "Main Platform Deck Recoating" },
          { id: "job-3", title: "Helideck Non-Slip Paint Application" },
          { id: "job-4", title: "SPIC Marine Dock Structural Integrity Camp" }
        ]);
      }
    } else {
      setJobs([
        { id: "job-1", title: "Offshore Riser R-4 Corrosion Treatment" },
        { id: "job-2", title: "Main Platform Deck Recoating" },
        { id: "job-3", title: "Helideck Non-Slip Paint Application" },
        { id: "job-4", title: "SPIC Marine Dock Structural Integrity Camp" }
      ]);
    }
  }, []);

  // Save items helper
  const saveItems = (updatedItems: InventoryItem[]) => {
    setItems(updatedItems);
    localStorage.setItem("corrotech_inventory", JSON.stringify(updatedItems));
  };

  // Save issued records helper
  const saveIssuedRecords = (updatedRecords: IssuedPaintRecord[]) => {
    setIssuedRecords(updatedRecords);
    localStorage.setItem("corrotech_issued_paint", JSON.stringify(updatedRecords));
  };

  // Open Issue Paint modal helper
  const openIssueModal = (preselectedItem?: InventoryItem) => {
    const paintItems = items.filter(i => i.store === "Paint" && i.quantity > 0);
    if (paintItems.length === 0) {
      alert("No paint products with active stock available in store.");
      return;
    }

    const selected = preselectedItem || paintItems[0];
    setIssueItemId(selected.id);
    setIssueQuantity(1);
    setIssueIssuedTo("");
    setIssueNotes("");
    setIssueRequestingDept("Asset Protection Dept");
    setIssueDate(new Date().toISOString().split("T")[0]);

    if (jobs.length > 0) {
      setIssueJobId(jobs[0].id);
    } else {
      setIssueJobId("");
    }

    setIsIssueModalOpen(true);
  };

  // Selected item for current issuance
  const selectedIssueItem = useMemo(() => {
    return items.find(i => i.id === issueItemId);
  }, [items, issueItemId]);

  // Handle saving new Paint Issuance
  const handleIssuePaint = (e: FormEvent) => {
    e.preventDefault();
    if (!issueItemId) return;

    const selectedItem = items.find(i => i.id === issueItemId);
    if (!selectedItem) return;

    if (issueQuantity <= 0) {
      alert("Please enter a valid quantity to issue.");
      return;
    }

    if (issueQuantity > selectedItem.quantity) {
      alert(`Cannot issue more than current stock (${selectedItem.quantity} ${selectedItem.unit}(s)).`);
      return;
    }

    const selectedJob = jobs.find(j => j.id === issueJobId);
    const jobTitle = selectedJob ? selectedJob.title : (issueJobId || "General Maintenance");

    const newRecord: IssuedPaintRecord = {
      id: "issue-" + Date.now(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      sku: selectedItem.sku,
      quantity: issueQuantity,
      unit: selectedItem.unit,
      jobId: issueJobId || "general",
      jobTitle: jobTitle,
      issuedTo: issueIssuedTo.trim() || "Unspecified Operator",
      issuedBy: issueIssuedBy.trim() || "A. Davis (Admin)",
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      notes: issueNotes.trim(),
      requestingDept: issueRequestingDept.trim() || "Asset Protection Dept"
    };

    // Deduct stock
    const updatedItems = items.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          quantity: item.quantity - issueQuantity
        };
      }
      return item;
    });

    const updatedIssued = [newRecord, ...issuedRecords];

    saveItems(updatedItems);
    saveIssuedRecords(updatedIssued);
    setIsIssueModalOpen(false);
  };

  // Return issued paint back to stock helper
  const handleReturnPaint = (recordId: string) => {
    setReturnConfirmId(recordId);
  };

  const confirmReturnPaint = () => {
    if (!returnConfirmId) return;
    const record = issuedRecords.find(r => r.id === returnConfirmId);
    if (!record) return;

    // Return stock
    const updatedItems = items.map(item => {
      if (item.id === record.itemId) {
        return {
          ...item,
          quantity: item.quantity + record.quantity
        };
      }
      return item;
    });

    const updatedIssued = issuedRecords.filter(r => r.id !== returnConfirmId);

    saveItems(updatedItems);
    saveIssuedRecords(updatedIssued);
    setReturnConfirmId(null);
  };

  // Delete issued record permanently from log helper
  const handleDeleteIssuedRecord = (recordId: string) => {
    setDeleteIssuedConfirmId(recordId);
  };

  const confirmDeleteIssuedRecord = () => {
    if (!deleteIssuedConfirmId) return;
    const record = issuedRecords.find(r => r.id === deleteIssuedConfirmId);
    if (!record) return;

    const updatedIssued = issuedRecords.filter(r => r.id !== deleteIssuedConfirmId);
    saveIssuedRecords(updatedIssued);
    setDeleteIssuedConfirmId(null);
  };

  // Download official Paint Issuance Slip as TXT format
  const handleDownloadSlip = (record: IssuedPaintRecord) => {
    const title = "CORROTECH CORROSION CONTROL — PAINT ISSUANCE SLIP";
    const border = "======================================================================";
    const divider = "----------------------------------------------------------------------";
    const slipContent = `${border}
${title}
${border}
SLIP REF ID    : ${record.id}
DISPATCH DATE  : ${record.issueDate}
STATUS         : STOCK DISPATCHED & APPROVED
${divider}

[ PAINT / COATING SPECIFICATION ]
Product Name   : ${record.itemName}
SKU Code       : ${record.sku || "N/A"}
Volume Issued  : ${record.quantity} ${record.unit}(s)

[ PROJECT CAMPAIGN / DEPLOYMENT ]
Campaign ID    : ${record.jobId}
Campaign Title : ${record.jobTitle}
Field Notes    : ${record.notes || "N/A"}

[ AUTHORIZATION SIGN-OFF ]
Issued To      : ${record.issuedTo}
Authorized By  : ${record.issuedBy}

${divider}
Verification Note:
This is an authentic digital dispatch record of CorroTech Corrosion
Control Systems. Please retain this slip for QA/QC inspections on-site.
All product volumes are registered and checked prior to delivery.
${border}
Generated by CorroTech LogiX on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
`;

    const blob = new Blob([slipContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Paint_Issuance_Slip_${record.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Convert the high-fidelity HTML slip to a downloaded PDF document
  const handleDownloadPDFSlip = async (record: IssuedPaintRecord) => {
    const element = document.getElementById("printable-slip");
    if (!element) return;

    setIsGeneratingPDF(true);
    const restoredInlineStyles: (() => void)[] = [];
    const originalStyleNodes: { parent: Node; node: Node; nextSibling: Node | null }[] = [];

    try {
      // 1. Inline all computed styles on the target element and its children to lock down styles
      const inlineAllStyles = (rootElement: HTMLElement) => {
        const elements = [rootElement, ...Array.from(rootElement.querySelectorAll("*"))] as HTMLElement[];
        const saved: { element: HTMLElement; originalStyle: string }[] = [];

        for (const el of elements) {
          const computed = window.getComputedStyle(el);
          let cssText = "";
          
          const propertiesToCopy = [
            "position", "top", "right", "bottom", "left",
            "display", "flex-direction", "justify-content", "align-items", "flex-wrap", "flex-grow", "flex-shrink", "flex-basis",
            "width", "height", "min-width", "min-height", "max-width", "max-height",
            "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
            "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
            "background", "background-color", "color",
            "font-family", "font-size", "font-weight", "line-height", "text-align", "text-transform", "letter-spacing",
            "border", "border-top", "border-right", "border-bottom", "border-left",
            "border-width", "border-style", "border-color", "border-radius",
            "box-shadow", "opacity", "vertical-align", "border-collapse", "box-sizing", "grid-template-columns", "gap"
          ];

          for (const prop of propertiesToCopy) {
            let val = computed.getPropertyValue(prop);
            if (val) {
              // Convert OKLCH and OKLAB color codes to standard RGB/RGBA
              val = convertOklToRgb(val);
              cssText += `${prop}: ${val}; `;
            }
          }

          saved.push({
            element: el,
            originalStyle: el.getAttribute("style") || ""
          });

          el.setAttribute("style", cssText);
        }

        return () => {
          for (const { element, originalStyle } of saved) {
            if (originalStyle) {
              element.setAttribute("style", originalStyle);
            } else {
              element.removeAttribute("style");
            }
          }
        };
      };

      const restoreStyles = inlineAllStyles(element);
      restoredInlineStyles.push(restoreStyles);

      // 2. Temporarily detach all document stylesheets from the DOM so html2canvas doesn't try to load or parse them.
      // This is a foolproof way to prevent any underlying library CSS with oklch/oklab rules from triggering library-internal parse errors.
      const styleNodes = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"));
      for (const node of styleNodes) {
        if (node.parentNode) {
          originalStyleNodes.push({
            parent: node.parentNode,
            node: node,
            nextSibling: node.nextSibling
          });
          node.parentNode.removeChild(node);
        }
      }

      // Small delay to ensure any layout state is fully settled
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, {
        scale: 2.5, // High resolution crisp text rendering
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 800, // Fixed window width context for consistent layouts
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 12; // 12mm margins
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      // Center vertically if it fits cleanly on a single page
      const xPos = margin;
      const yPos = contentHeight < pdfHeight - (margin * 2) 
        ? (pdfHeight - contentHeight) / 2 
        : margin;

      pdf.addImage(imgData, "PNG", xPos, yPos, contentWidth, contentHeight, undefined, "FAST");
      pdf.save(`SPIC_Paint_Issue_Note_${record.id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to render PDF. Please use standard 'Print Note / Save PDF' in the browser.");
    } finally {
      // 3. Restore styles to normal
      for (const fn of restoredInlineStyles) {
        fn();
      }
      for (const { parent, node, nextSibling } of originalStyleNodes) {
        try {
          parent.insertBefore(node, nextSibling);
        } catch (e) {
          console.warn("Could not restore stylesheet element:", e);
        }
      }
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    if (previewSlipRecord && triggerAutoDownload) {
      const runAutoDownload = async () => {
        // Wait for React to render and mount the element in the DOM
        await new Promise((resolve) => setTimeout(resolve, 400));
        await handleDownloadPDFSlip(previewSlipRecord);
        setTriggerAutoDownload(false);
        setPreviewSlipRecord(null);
      };
      runAutoDownload();
    }
  }, [previewSlipRecord, triggerAutoDownload]);

  // Preset categories for each store type
  const paintCategories = ["Coatings", "Thinners", "Solvents", "Cleaners", "Other"];
  const equipmentCategories = ["NDT Instruments", "Abrasives", "Blasting Accessories", "Safety & PPE", "Tools", "Other"];

  // Open modal for adding/editing
  const openAddModal = () => {
    setEditingItem(null);
    setItemName("");
    setCategory(activeStore === "Paint" ? "Coatings" : "NDT Instruments");
    setSku("");
    setQuantity(0);
    setUnit(activeStore === "Paint" ? "litre" : "pcs");
    setMinStock(0);
    setLocation("");
    setSupplier("");
    setNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setCategory(item.category);
    setSku(item.sku);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setMinStock(item.minStock);
    setLocation(item.location);
    setSupplier(item.supplier);
    setNotes(item.notes || "");
    setIsModalOpen(true);
  };

  // Quantity helpers matching custom spinner buttons
  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => Math.max(0, prev - 1));

  // Form submission handling
  const handleSaveItem = (e: FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const savedItem: InventoryItem = {
      id: editingItem ? editingItem.id : "inv-" + Date.now(),
      name: itemName,
      store: activeStore,
      category,
      sku,
      quantity,
      unit,
      minStock,
      location,
      supplier,
      notes
    };

    let updated;
    if (editingItem) {
      updated = items.map((i) => (i.id === editingItem.id ? savedItem : i));
    } else {
      updated = [...items, savedItem];
    }

    saveItems(updated);
    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteItem = () => {
    if (deleteConfirmId) {
      const updated = items.filter((i) => i.id !== deleteConfirmId);
      saveItems(updated);
      setDeleteConfirmId(null);
    }
  };

  // Calculated Stats (Filtered to ACTIVE store tab)
  const activeStoreItems = useMemo(() => {
    return items.filter((i) => i.store === activeStore);
  }, [items, activeStore]);

  const stats = useMemo(() => {
    const total = activeStoreItems.length;
    const inStock = activeStoreItems.filter((i) => i.quantity > i.minStock).length;
    const lowStock = activeStoreItems.filter((i) => i.quantity > 0 && i.quantity <= i.minStock).length;
    const outOfStock = activeStoreItems.filter((i) => i.quantity === 0).length;

    return { total, inStock, lowStock, outOfStock };
  }, [activeStoreItems]);

  // Issued Paint computed stats
  const issuedStats = useMemo(() => {
    const totalBatches = issuedRecords.length;
    const totalLitres = issuedRecords
      .filter((r) => r.unit === "litre")
      .reduce((sum, r) => sum + r.quantity, 0);
    const totalCans = issuedRecords
      .filter((r) => r.unit === "can")
      .reduce((sum, r) => sum + r.quantity, 0);
    const uniqueJobs = new Set(issuedRecords.map((r) => r.jobId)).size;

    return { totalBatches, totalLitres, totalCans, uniqueJobs };
  }, [issuedRecords]);

  // Filtered Issued Records
  const processedIssuedRecords = useMemo(() => {
    let result = [...issuedRecords];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.itemName.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          r.jobTitle.toLowerCase().includes(q) ||
          r.issuedTo.toLowerCase().includes(q) ||
          r.issuedBy.toLowerCase().includes(q)
      );
    }

    // Newest first
    result.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

    return result;
  }, [issuedRecords, searchQuery]);

  // Overall counts for total across BOTH stores (for title badge and tab badges)
  const totalPaintCount = useMemo(() => items.filter((i) => i.store === "Paint").length, [items]);
  const totalEquipmentCount = useMemo(() => items.filter((i) => i.store === "Equipment").length, [items]);
  const grandTotalCount = items.length;

  // Change Sort Helper with toggled direction
  const handleSortChange = (type: "Name" | "Qty" | "Category") => {
    if (sortBy === type) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(type);
      setSortOrder("asc");
    }
  };

  // Filter and Sort Processing
  const processedItems = useMemo(() => {
    let result = [...activeStoreItems];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.supplier.toLowerCase().includes(q)
      );
    }

    // Stock levels filter
    if (stockFilter === "Low") {
      result = result.filter((i) => i.quantity > 0 && i.quantity <= i.minStock);
    } else if (stockFilter === "Out") {
      result = result.filter((i) => i.quantity === 0);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "Name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "Qty") {
        comparison = a.quantity - b.quantity;
      } else if (sortBy === "Category") {
        comparison = a.category.localeCompare(b.category);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [activeStoreItems, searchQuery, stockFilter, sortBy, sortOrder]);

  return (
    <div className="flex-1 bg-[#0d0c0b] text-white p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
      {/* 1. Header with Title, Overall Count, and Add Item */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-white font-sans tracking-tight">Inventory</h1>
          <span className="bg-gray-800 text-gray-400 text-xs px-2.5 py-1 rounded-full font-bold">
            {grandTotalCount} total
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {activeStore === "Paint" && (
            <button
              onClick={() => openIssueModal()}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <ClipboardCheck size={16} />
              Issue Paint
            </button>
          )}
          <button
            onClick={openAddModal}
            className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/10 cursor-pointer text-sm"
          >
            <Plus size={16} className="stroke-[3]" />
            Add Item
          </button>
        </div>
      </div>

      {/* 2. Horizontal Store Selection Tabs */}
      <div className="border-b border-gray-800/80 flex gap-6">
        <button
          onClick={() => {
            setActiveStore("Paint");
            setStockFilter("All");
          }}
          className={`pb-3 flex items-center gap-2 font-bold text-sm tracking-wide transition-all relative ${
            activeStore === "Paint" ? "text-amber-400" : "text-gray-400 hover:text-white"
          }`}
        >
          <Paintbrush size={16} />
          <span>Paint Store</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
            activeStore === "Paint" ? "bg-amber-400/20 text-amber-400" : "bg-gray-800 text-gray-500"
          }`}>
            {totalPaintCount}
          </span>
          {activeStore === "Paint" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveStore("Equipment");
            setStockFilter("All");
          }}
          className={`pb-3 flex items-center gap-2 font-bold text-sm tracking-wide transition-all relative ${
            activeStore === "Equipment" ? "text-amber-400" : "text-gray-400 hover:text-white"
          }`}
        >
          <Wrench size={16} />
          <span>Equipment Store</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
            activeStore === "Equipment" ? "bg-amber-400/20 text-amber-400" : "bg-gray-800 text-gray-500"
          }`}>
            {totalEquipmentCount}
          </span>
          {activeStore === "Equipment" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500" />
          )}
        </button>
      </div>

      {/* 2b. Sub-tabs for Paint Store: Available Coatings vs. Issued Paint Log */}
      {activeStore === "Paint" && (
        <div className="flex gap-4 border-b border-gray-900/60 pb-1 -mt-2">
          <button
            onClick={() => setPaintSubTab("available")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
              paintSubTab === "available"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Package size={13} />
              Available Stock ({totalPaintCount})
            </span>
          </button>
          <button
            onClick={() => setPaintSubTab("issued")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
              paintSubTab === "issued"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <History size={13} />
              Issued Paint Log ({issuedRecords.length})
            </span>
          </button>
        </div>
      )}

      {/* 3. Stats cards under selection (Filtered to currently active store / sub-tab) */}
      {activeStore === "Paint" && paintSubTab === "issued" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Issued */}
          <div className="border border-amber-900/30 bg-amber-950/10 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Issued Batches</span>
            <span className="text-3xl font-black text-amber-400 mt-2">{issuedStats.totalBatches}</span>
          </div>

          {/* Litres Issued */}
          <div className="border border-blue-900/30 bg-blue-950/10 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
            <div className="flex items-center gap-1.5 text-blue-400">
              <Paintbrush size={14} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Total Volume Issued</span>
            </div>
            <span className="text-3xl font-black text-blue-400 mt-2">
              {issuedStats.totalLitres}{" "}
              <span className="text-xs font-sans font-normal text-blue-500">litres</span>
            </span>
          </div>

          {/* Cans Issued */}
          <div className="border border-emerald-900/30 bg-emerald-950/10 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Package size={14} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Cans / Drums Issued</span>
            </div>
            <span className="text-3xl font-black text-emerald-400 mt-2">
              {issuedStats.totalCans}{" "}
              <span className="text-xs font-sans font-normal text-emerald-500">cans</span>
            </span>
          </div>

          {/* Active Jobs */}
          <div className="border border-purple-900/30 bg-purple-950/10 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
            <div className="flex items-center gap-1.5 text-purple-400">
              <CheckCircle2 size={14} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Supported Campaigns</span>
            </div>
            <span className="text-3xl font-black text-purple-400 mt-2">{issuedStats.uniqueJobs}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Items */}
          <div className="border border-blue-900/30 bg-blue-950/10 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
            <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Total Items</span>
            <span className="text-3xl font-black text-blue-400 mt-2">{stats.total}</span>
          </div>

          {/* In Stock */}
          <div className="border border-emerald-900/30 bg-emerald-950/10 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 size={14} />
              <span className="text-[10px] uppercase font-bold tracking-wider">In Stock</span>
            </div>
            <span className="text-3xl font-black text-emerald-400 mt-2">{stats.inStock}</span>
          </div>

          {/* Low Stock */}
          <div className="border border-amber-900/30 bg-amber-950/10 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
            <div className="flex items-center gap-1.5 text-amber-400">
              <TrendingDown size={14} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Low Stock</span>
            </div>
            <span className="text-3xl font-black text-amber-400 mt-2">{stats.lowStock}</span>
          </div>

          {/* Out of Stock */}
          <div className="border border-rose-900/30 bg-rose-950/10 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
            <div className="flex items-center gap-1.5 text-rose-400">
              <AlertTriangle size={14} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Out of Stock</span>
            </div>
            <span className="text-3xl font-black text-rose-400 mt-2">{stats.outOfStock}</span>
          </div>
        </div>
      )}

      {/* 4. Active Filters Tab Badge pill */}
      <div>
        <span className="bg-[#f59e0b] text-black font-extrabold text-[11px] px-3 py-1.5 rounded-full uppercase tracking-wider">
          {activeStore === "Paint" && paintSubTab === "issued" ? (
            `Issued Records (${processedIssuedRecords.length})`
          ) : (
            `${stockFilter === "All" ? "All" : stockFilter === "Low" ? "Low Stock" : "Out of Stock"} (${processedItems.length})`
          )}
        </span>
      </div>

      {/* 5. Filtering Bar with Search, Stock Level Quick Toggle, and Sort Buttons */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        {/* Search */}
        <div className="relative w-full xl:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, SKU, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Filter Pills and Sorters Row */}
        {!(activeStore === "Paint" && paintSubTab === "issued") && (
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Quick Filters */}
            <div className="flex items-center gap-1 bg-[#171513] border border-gray-800 p-1.5 rounded-xl">
              <SlidersHorizontal size={14} className="text-gray-500 mx-2" />
              <button
                onClick={() => setStockFilter("All")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  stockFilter === "All"
                    ? "bg-[#f59e0b] text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                All Stock
              </button>
              <button
                onClick={() => setStockFilter("Low")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  stockFilter === "Low"
                    ? "bg-[#f59e0b] text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Low
              </button>
              <button
                onClick={() => setStockFilter("Out")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  stockFilter === "Out"
                    ? "bg-[#f59e0b] text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Out
              </button>
            </div>

            {/* Sorter */}
            <div className="flex items-center gap-1.5 bg-[#171513] border border-gray-800 p-1.5 rounded-xl text-xs">
              <span className="text-gray-500 font-bold ml-1.5">Sort:</span>
              <button
                onClick={() => handleSortChange("Name")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  sortBy === "Name"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Name
                {sortBy === "Name" && (sortOrder === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
              </button>
              <button
                onClick={() => handleSortChange("Qty")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  sortBy === "Qty"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Qty
                {sortBy === "Qty" && (sortOrder === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
              </button>
              <button
                onClick={() => handleSortChange("Category")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  sortBy === "Category"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Category
                {sortBy === "Category" && (sortOrder === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Main Body Content (List of items or empty state) */}
      <div className="flex-1 bg-gray-950/40 border border-white/5 rounded-2xl p-6 min-h-[300px] flex flex-col justify-between">
        {activeStore === "Paint" && paintSubTab === "issued" ? (
          processedIssuedRecords.length === 0 ? (
            /* Empty State for Issued Paint Log */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-14 h-14 bg-gray-900 border border-gray-800/80 rounded-full flex items-center justify-center text-gray-500">
                <History size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-400">No paint items issued yet.</p>
                <p className="text-xs text-gray-500">Issue paint to active jobs to begin tracking field operations.</p>
              </div>
              <button
                onClick={() => openIssueModal()}
                className="bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#f59e0b] px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-all mt-2"
              >
                <ClipboardCheck size={14} />
                Issue Paint Now
              </button>
            </div>
          ) : (
            /* Issued Paint Log Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-900 text-gray-500 text-[10px] uppercase font-black tracking-wider">
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Campaign / Work Area</th>
                    <th className="py-3 px-4 text-right">Qty Issued</th>
                    <th className="py-3 px-4">Authorized Personnel</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900">
                  {processedIssuedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-white/[0.01] group transition-all">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white leading-snug">{record.itemName}</div>
                        <div className="font-mono text-[10px] text-gray-500 mt-1">
                          SKU: {record.sku || "N/A"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs text-gray-300 font-medium">{record.jobTitle}</div>
                        {record.notes && (
                          <div className="text-[10px] text-amber-500/80 mt-1 italic flex items-center gap-1.5">
                            <Info size={11} /> <span>{record.notes}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-amber-400">
                        {record.quantity} <span className="text-[10px] text-gray-500 font-sans font-normal">{record.unit}(s)</span>
                      </td>
                      <td className="py-4 px-4 text-xs space-y-0.5">
                        <div className="flex items-center gap-1 text-gray-300">
                          <User size={11} className="text-gray-500" />
                          <span>To: {record.issuedTo}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 pl-4">
                          By: {record.issuedBy}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-xs font-mono">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-600" />
                          <span>{record.issueDate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setPreviewSlipRecord(record);
                              setTriggerAutoDownload(true);
                            }}
                            className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                            title="Download Paint Issue Note PDF Slip"
                          >
                            <Download size={12} />
                            <span>Download Slip</span>
                          </button>
                          <button
                            onClick={() => handleReturnPaint(record.id)}
                            className="px-2.5 py-1.5 bg-gray-900 hover:bg-amber-500/10 hover:text-amber-400 text-gray-400 border border-gray-800 hover:border-amber-500/30 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                            title="Return paint back to inventory"
                          >
                            <History size={12} />
                            <span>Return to Stock</span>
                          </button>
                          <button
                            onClick={() => handleDeleteIssuedRecord(record.id)}
                            className="px-2.5 py-1.5 bg-[#f43f5e]/10 hover:bg-[#f43f5e]/20 text-rose-400 border border-[#f43f5e]/30 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                            title="Delete Issued Record permanently from log"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : processedItems.length === 0 ? (
          /* Empty State exactly styled as screenshot */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-4">
            <div className="w-14 h-14 bg-gray-900 border border-gray-800/80 rounded-full flex items-center justify-center text-gray-500">
              <Package size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-400">No items yet. Add your first item.</p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#f59e0b] px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-all mt-2"
            >
              <Plus size={14} className="stroke-[3]" />
              Add Item
            </button>
          </div>
        ) : (
          /* List of Inventory items */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-900 text-gray-500 text-[10px] uppercase font-black tracking-wider">
                  <th className="py-3 px-4">Item details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900">
                {processedItems.map((item) => {
                  const isOutOfStock = item.quantity === 0;
                  const isLowStock = item.quantity > 0 && item.quantity <= item.minStock;

                  let statusText = "In Stock";
                  let statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  if (isOutOfStock) {
                    statusText = "Out of Stock";
                    statusColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                  } else if (isLowStock) {
                    statusText = "Low Stock";
                    statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  }

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.01] group transition-all">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white leading-snug">{item.name}</div>
                        <div className="font-mono text-[10px] text-gray-500 mt-1 flex items-center gap-1.5">
                          <span>SKU: {item.sku || "N/A"}</span>
                          {item.notes && (
                            <span className="flex items-center gap-1 text-gray-600 font-sans" title={item.notes}>
                              • <Info size={11} className="inline text-gray-500" /> Notes attached
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-gray-800 text-gray-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold">
                        <span className={isOutOfStock ? "text-rose-400 font-black" : isLowStock ? "text-amber-400" : "text-white"}>
                          {item.quantity}
                        </span>{" "}
                        <span className="text-[10px] text-gray-500 font-sans font-normal">{item.unit}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 border rounded-full ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-xs">
                        {item.location || "Unspecified"}
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-xs">
                        {item.supplier || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-all">
                          {item.store === "Paint" && item.quantity > 0 && (
                            <button
                              onClick={() => openIssueModal(item)}
                              className="p-1.5 hover:bg-white/5 hover:text-amber-400 rounded-lg text-gray-500 transition-all cursor-pointer"
                              title="Issue Paint from Stock"
                            >
                              <ClipboardCheck size={14} className="text-amber-400" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 hover:bg-white/5 hover:text-amber-400 rounded-lg text-gray-500 transition-all cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 hover:bg-white/5 hover:text-rose-500 rounded-lg text-gray-500 transition-all cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. Beautiful Modal Backdrop and Dialog exactly styled as the attached Add Item image */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Transparent blur overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content container matches the second image perfectly */}
          <div className="relative w-full max-w-lg bg-[#1a1c23] border border-gray-800/80 rounded-2xl shadow-2xl p-6 z-10 flex flex-col gap-5 text-gray-300">
            {/* Header: Title, Active Store selection & Close button */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {editingItem ? "Edit Item" : "Add Item"}
                </h3>
                <span className="text-xs text-amber-500 font-semibold uppercase tracking-wider">
                  {activeStore} Store
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all border border-transparent"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs font-semibold">
              {/* ITEM NAME * */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Interzinc 52 — Zinc Primer"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* CATEGORY & SKU / CODE Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  >
                    {(activeStore === "Paint" ? paintCategories : equipmentCategories).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                    SKU / Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IZ52-GRY-5L"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* QUANTITY, UNIT & MIN STOCK Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* QUANTITY with Custom increment/decrement buttons as in screenshot */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">
                    Quantity
                  </label>
                  <div className="flex items-center bg-[#121110] border border-gray-800 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={decrementQty}
                      className="p-3 text-gray-500 hover:text-white hover:bg-white/5 transition-all outline-none"
                    >
                      <ChevronDown size={14} className="stroke-[3]" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-transparent p-3 text-sm text-center text-white focus:outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={incrementQty}
                      className="p-3 text-gray-500 hover:text-white hover:bg-white/5 transition-all outline-none"
                    >
                      <ChevronUp size={14} className="stroke-[3]" />
                    </button>
                  </div>
                </div>

                {/* UNIT */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  >
                    {activeStore === "Paint" ? (
                      <>
                        <option value="litre">litre</option>
                        <option value="can">can</option>
                        <option value="kg">kg</option>
                        <option value="drum">drum</option>
                      </>
                    ) : (
                      <>
                        <option value="pcs">pcs</option>
                        <option value="set">set</option>
                        <option value="kg">kg</option>
                        <option value="bag">bag</option>
                        <option value="box">box</option>
                      </>
                    )}
                  </select>
                </div>

                {/* MIN STOCK */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                    Min Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minStock}
                    onChange={(e) => setMinStock(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* STORAGE LOCATION & SUPPLIER Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paint Store Shelf B"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                    Supplier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AkzoNobel"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* NOTES */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                  Notes
                </label>
                <textarea
                  placeholder="Batch no., colour code, DFT range, expiry..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-gray-900 flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold rounded-lg px-5 py-2.5 transition-all shadow-md cursor-pointer text-sm"
                >
                  {editingItem ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7b. Issue Paint Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsIssueModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#11100f] border border-gray-800 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-gray-900 flex items-center justify-between bg-[#171513]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">
                  <ClipboardCheck size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight uppercase">Paint Issue Note</h2>
                  <p className="text-[10px] text-gray-500 font-mono">AUTHORIZED DISPATCH PROTOCOL</p>
                </div>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-gray-500 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleIssuePaint} className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* PAINT PRODUCT SELECTION */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                  Paint Product to Issue
                </label>
                <select
                  value={issueItemId}
                  onChange={(e) => {
                    setIssueItemId(e.target.value);
                    setIssueQuantity(1);
                  }}
                  className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  required
                >
                  {items
                    .filter((i) => i.store === "Paint" && i.quantity > 0)
                    .map((paint) => (
                      <option key={paint.id} value={paint.id}>
                        {paint.name} ({paint.sku || "No SKU"}) — Stock: {paint.quantity} {paint.unit}(s)
                      </option>
                    ))}
                </select>
                {selectedIssueItem && (
                  <div className="text-[10px] text-gray-500 font-mono flex justify-between items-center px-1 pt-0.5">
                    <span>Available Stock: {selectedIssueItem.quantity} {selectedIssueItem.unit}(s)</span>
                    <span>Location: {selectedIssueItem.location || "Unspecified"}</span>
                  </div>
                )}
              </div>

              {/* QUANTITY TO ISSUE & TARGET CAMPAIGN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Quantity */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                    Quantity to Issue
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      max={selectedIssueItem?.quantity || 1}
                      value={issueQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        const maxVal = selectedIssueItem?.quantity || 1;
                        setIssueQuantity(Math.min(maxVal, Math.max(1, val)));
                      }}
                      className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 pr-16 text-sm text-white focus:outline-none focus:border-amber-500/50"
                      required
                    />
                    <span className="absolute right-3 text-[10px] font-mono text-gray-500 uppercase">
                      {selectedIssueItem?.unit || "litre"}(s)
                    </span>
                  </div>
                </div>

                {/* Campaign */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                    Target Campaign / Job
                  </label>
                  <select
                    value={issueJobId}
                    onChange={(e) => setIssueJobId(e.target.value)}
                    className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    required
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                    <option value="General Asset Protection">General Asset Protection</option>
                  </select>
                </div>
              </div>

              {/* RECIPIENT & ISSUER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Issued To */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                    Issued To (Foreman / Operator)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Robert Chen (Foreman)"
                    value={issueIssuedTo}
                    onChange={(e) => setIssueIssuedTo(e.target.value)}
                    className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>

                {/* Issued By */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                    Authorized Issuer
                  </label>
                  <input
                    type="text"
                    value={issueIssuedBy}
                    onChange={(e) => setIssueIssuedBy(e.target.value)}
                    className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>
              </div>

              {/* REQUESTING DEPT & DATE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                    Requesting Dept. / 请求部门
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Corrosion Control Dept"
                    value={issueRequestingDept}
                    onChange={(e) => setIssueRequestingDept(e.target.value)}
                    className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>
              </div>

              {/* ISSUE NOTES */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                  Issue Notes / Remarks
                </label>
                <textarea
                  placeholder="e.g. For first coat on eastern riser joints..."
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#121110] border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-gray-900 flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold rounded-lg px-5 py-2.5 transition-all shadow-md cursor-pointer text-sm"
                >
                  Confirm Issuance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm bg-[#1a1c23] border border-gray-800 rounded-2xl p-6 shadow-2xl z-10 flex flex-col gap-4 text-gray-300">
            <h3 className="text-lg font-bold text-white tracking-tight">Delete Inventory Item?</h3>
            <p className="text-xs text-gray-400">
              Are you sure you want to delete this inventory item? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteItem}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {returnConfirmId && (() => {
        const record = issuedRecords.find(r => r.id === returnConfirmId);
        if (!record) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setReturnConfirmId(null)} />
            <div className="relative w-full max-w-sm bg-[#11100f] border border-gray-800 rounded-2xl p-6 shadow-2xl z-10 flex flex-col gap-4 text-gray-300">
              <h3 className="text-lg font-black text-white tracking-tight uppercase">Return Paint to Stock?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Are you sure you want to return <strong className="text-amber-400">{record.quantity} {record.unit}(s)</strong> of <strong className="text-white">{record.itemName}</strong> back to the Paint Store inventory?
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setReturnConfirmId(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReturnPaint}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg transition active:scale-95"
                >
                  Confirm Return
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {deleteIssuedConfirmId && (() => {
        const record = issuedRecords.find(r => r.id === deleteIssuedConfirmId);
        if (!record) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteIssuedConfirmId(null)} />
            <div className="relative w-full max-w-sm bg-[#11100f] border border-gray-800 rounded-2xl p-6 shadow-2xl z-10 flex flex-col gap-4 text-gray-300">
              <h3 className="text-lg font-black text-rose-500 tracking-tight uppercase">Delete Issued Record?</h3>
              <div className="space-y-2">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Are you sure you want to permanently delete this dispatch record for <strong className="text-white">{record.itemName}</strong>?
                </p>
                <div className="bg-rose-950/20 border border-rose-900/30 rounded-lg p-2.5 text-[10px] text-rose-400 font-medium">
                  WARNING: This action is permanent. It will delete the log entry and will NOT return the stock ({record.quantity} {record.unit}(s)) to the inventory.
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteIssuedConfirmId(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteIssuedRecord}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition active:scale-95"
                >
                  Delete Log Entry
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {previewSlipRecord && (() => {
        const record = previewSlipRecord;
        return (
          <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/95 backdrop-blur-sm print:p-0 print:bg-white print:static print:inset-auto ${triggerAutoDownload ? '-left-[9999px] w-[800px] h-[1130px]' : ''}`}>
            {/* Inject print styles dynamically when this modal is open */}
            <style>{`
              @media print {
                body {
                  background-color: white !important;
                  color: black !important;
                }
                .no-print {
                  display: none !important;
                }
                .print-content {
                  border: none !important;
                  box-shadow: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  background: white !important;
                  color: black !important;
                  position: absolute;
                  left: 0;
                  top: 0;
                }
                /* Hide standard application background */
                #root, header, nav, aside, footer, main {
                  display: none !important;
                }
              }
            `}</style>

            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm no-print" onClick={() => setPreviewSlipRecord(null)} />
            
            <div className="relative w-full max-w-3xl bg-white text-black rounded-2xl p-8 shadow-2xl z-10 flex flex-col gap-6 print-content border border-gray-200">
              {/* Header section with print controls */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 no-print">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Official Paint Issue Slip</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownloadSlip(record)}
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer"
                    title="Download raw text slip"
                  >
                    <Download size={13} />
                    <span>TXT File</span>
                  </button>
                  <button
                    onClick={() => handleDownloadPDFSlip(record)}
                    disabled={isGeneratingPDF}
                    className="px-4 py-2 bg-[#002B49] hover:bg-[#001D33] disabled:bg-gray-300 text-white disabled:text-gray-500 text-xs font-black rounded-lg transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                    title="Download high-fidelity official PDF Slip"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download size={13} />
                        <span>Download PDF Slip</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-black text-xs font-black rounded-lg transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Print Note / Save PDF</span>
                  </button>
                  <button
                    onClick={() => setPreviewSlipRecord(null)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* The Actual SPIC Paint Issue Note */}
              <div id="printable-slip" className="bg-white p-4 font-sans text-black select-text relative">
                
                {/* Logo & Corporate Identity Row */}
                <div className="flex items-start justify-between mb-6">
                  {/* Left Side: SPIC Logo */}
                  <div className="flex items-center gap-3">
                    {/* High-fidelity CSS SVG representation of SPIC Logo */}
                    <div className="w-12 h-12 flex-shrink-0 relative">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Red inner wave */}
                        <path d="M 50 15 C 30 15, 15 30, 15 50 C 15 70, 30 85, 50 85 C 40 80, 32 70, 32 50 C 32 30, 40 20, 50 15 Z" fill="#E11D48" />
                        {/* Green outer wave */}
                        <path d="M 50 15 C 70 15, 85 30, 85 50 C 85 70, 70 85, 50 85 C 60 78, 68 68, 68 50 C 68 32, 60 22, 50 15 Z" fill="#10B981" />
                        {/* Center gold/blue highlight accent */}
                        <circle cx="50" cy="50" r="10" fill="#F59E0B" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[15px] font-black tracking-wider text-[#002B49] leading-tight">国家电投</div>
                      <div className="text-[16px] font-bold tracking-widest text-[#002B49] font-mono leading-none">SPIC</div>
                    </div>
                  </div>

                  {/* Right Side: China Power Hub Company Text */}
                  <div className="text-right max-w-md">
                    <h1 className="text-[17px] font-extrabold text-[#002B49] tracking-normal font-sans">
                      中电国际胡布发电有限公司
                    </h1>
                    <p className="text-[9px] font-black text-[#002B49]/80 font-mono tracking-tight leading-tight uppercase mt-0.5">
                      CHINA POWER HUB GENERATION COMPANY (PVT.) LIMITED
                    </p>
                  </div>
                </div>

                {/* Slip Title Section */}
                <div className="text-center my-6">
                  <h2 className="text-[18px] font-bold text-black tracking-wide border-b-2 border-black inline-block px-4 pb-0.5 uppercase">
                    Paint Issue Note
                  </h2>
                  <div className="text-[16px] font-black text-black tracking-widest mt-1">
                    油漆发放单
                  </div>
                </div>

                {/* Upper Metadata Table */}
                <table className="w-full border-collapse border-2 border-black text-xs mb-6">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-1/3 border-r border-black px-3 py-2 bg-gray-50/50 font-bold">
                        <div className="font-sans text-black">Date:</div>
                        <div className="text-[10px] text-gray-700 font-bold font-sans">日期</div>
                      </td>
                      <td className="w-2/3 px-3 py-2 font-mono text-sm font-bold text-black">
                        {record.issueDate}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="w-1/3 border-r border-black px-3 py-2 bg-gray-50/50 font-bold">
                        <div className="font-sans text-black">Requesting Dept.</div>
                        <div className="text-[10px] text-gray-700 font-bold font-sans">请求部门</div>
                      </td>
                      <td className="w-2/3 px-3 py-2 text-sm font-bold text-black">
                        {record.requestingDept || "Asset Protection Dept"}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="w-1/3 border-r border-black px-3 py-2 bg-gray-50/50 font-bold">
                        <div className="font-sans text-black">Authorized By</div>
                        <div className="text-[10px] text-gray-700 font-bold font-sans">授权</div>
                      </td>
                      <td className="w-2/3 px-3 py-2 text-sm font-bold text-black">
                        {record.issuedBy}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-1/3 border-r border-black px-3 py-2 bg-gray-50/50 font-bold">
                        <div className="font-sans text-black">Issued To</div>
                        <div className="text-[10px] text-gray-700 font-bold font-sans">签发给</div>
                      </td>
                      <td className="w-2/3 px-3 py-2 text-sm font-bold text-black">
                        {record.issuedTo}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Lower Items Table */}
                <table className="w-full border-collapse border-2 border-black text-xs mb-8 text-center">
                  <thead>
                    <tr className="border-b-2 border-black bg-gray-50 font-bold">
                      <th className="w-16 border-r border-black py-2 font-bold text-black">SR.NO</th>
                      <th className="border-r border-black py-2 px-3 font-bold text-left text-black">
                        <div>Item Description</div>
                        <div className="text-[10px] text-gray-700 font-bold">产品描述</div>
                      </th>
                      <th className="w-36 py-2 px-2 font-bold text-black">
                        <div>Qty-Litre</div>
                        <div className="text-[10px] text-gray-700 font-bold">数量-升</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 1: The Issued Paint details */}
                    <tr className="border-b border-black h-10">
                      <td className="border-r border-black font-bold font-mono text-black">1</td>
                      <td className="border-r border-black text-left px-3 font-bold text-black text-sm">
                        <div>{record.itemName} {record.sku ? `(SKU: ${record.sku})` : ""}</div>
                        {record.notes && (
                          <div className="text-[10px] text-gray-600 font-normal mt-0.5 italic">
                            Remarks: {record.notes}
                          </div>
                        )}
                      </td>
                      <td className="font-mono text-sm font-bold text-black px-2">
                        {record.quantity} {record.unit || "litre"}(s)
                      </td>
                    </tr>
                    {/* Row 2: Empty padding row for authentic look */}
                    <tr className="border-b border-black h-10">
                      <td className="border-r border-black font-mono text-gray-300">2</td>
                      <td className="border-r border-black"></td>
                      <td></td>
                    </tr>
                    {/* Row 3: Empty padding row for authentic look */}
                    <tr className="border-b border-black h-10">
                      <td className="border-r border-black font-mono text-gray-300">3</td>
                      <td className="border-r border-black"></td>
                      <td></td>
                    </tr>
                    {/* Row 4: Empty padding row for authentic look */}
                    <tr className="border-b border-black h-10">
                      <td className="border-r border-black font-mono text-gray-300">4</td>
                      <td className="border-r border-black"></td>
                      <td></td>
                    </tr>
                    {/* Row 5: Empty padding row for authentic look */}
                    <tr className="h-10">
                      <td className="border-r border-black font-mono text-gray-300">5</td>
                      <td className="border-r border-black"></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer Sign-off Areas */}
                <div className="grid grid-cols-3 gap-4 pt-10 text-center text-xs text-black">
                  <div>
                    <div className="border-b border-black mx-auto w-4/5 h-6"></div>
                    <p className="mt-1 font-bold">Prepared By / Formulated</p>
                  </div>
                  <div>
                    <div className="border-b border-black mx-auto w-4/5 h-6"></div>
                    <p className="mt-1 font-bold">Store Keeper / Receiver</p>
                  </div>
                  <div>
                    <div className="border-b border-black mx-auto w-4/5 h-6"></div>
                    <p className="mt-1 font-bold">Site Engineer / Approval</p>
                  </div>
                </div>

                {/* Fine print */}
                <div className="text-[9px] text-gray-500 mt-12 pt-4 border-t border-gray-100 flex justify-between items-center font-mono">
                  <span>SYSTEM REF ID: {record.id}</span>
                  <span>© CHINA POWER HUB GENERATION COMPANY — INVENTORY DISPATCH</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {isGeneratingPDF && triggerAutoDownload && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md">
          <div className="relative p-8 max-w-sm w-full bg-[#11100f] border border-gray-800 rounded-2xl flex flex-col items-center gap-4 text-center">
            {/* Elegant Spinning Outer Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-amber-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <Download size={24} className="text-amber-500 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white tracking-wider uppercase">Generating PDF Slip</h3>
              <p className="text-[11px] text-gray-400">Compiling official SPIC Paint Issue Note with high-definition rendering...</p>
            </div>
            
            {/* progress bar simulation */}
            <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full w-4/5 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
