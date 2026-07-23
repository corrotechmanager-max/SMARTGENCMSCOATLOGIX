export interface NavItem {
  name: string;
  icon: string;
}

export interface DefectItem {
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title_en: string;
  title_zh: string;
  desc_en: string;
  desc_zh: string;
}

export interface CorrosionReport {
  isSimulation?: boolean;
  apiMessage?: string;
  header: {
    company_en: string;
    company_zh: string;
    title_en: string;
    title_zh: string;
    prepared_by: string;
  };
  metadata: {
    assetName: string;
    tagNo: string;
    plant: string;
    area: string;
    location: string;
    date: string;
    inspector: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    imagesAnalysed: number;
  };
  summary: {
    en: string;
    zh: string;
  };
  defects: DefectItem[];
  rootCause: {
    mechanisms_en: string;
    mechanisms_zh: string;
    support_en: string;
    support_zh: string;
    env_en: string;
    env_zh: string;
    contributing_en: string;
    contributing_zh: string;
  };
  rectificationPlan: {
    surfacePrep_en: string;
    surfacePrep_zh: string;
    primer_en: string;
    primer_zh: string;
    intermediate_en: string;
    intermediate_zh: string;
    topcoat_en: string;
    topcoat_zh: string;
    dft_en: string;
    dft_zh: string;
    holiday_en: string;
    holiday_zh: string;
    safety_en: string;
    safety_zh: string;
  };
  maintenancePlan: {
    frequency_en: string;
    frequency_zh: string;
    survey_en: string;
    survey_zh: string;
    monitoring_en: string;
    monitoring_zh: string;
    threshold_en: string;
    threshold_zh: string;
    recoat_en: string;
    recoat_zh: string;
  };
  riskAssessment: {
    safety_en: string;
    safety_zh: string;
    corrosionRate_en: string;
    corrosionRate_zh: string;
    impact_en: string;
    impact_zh: string;
    life_en: string;
    life_zh: string;
  };
  recommendedTimeline: {
    immediate_en: string;
    immediate_zh: string;
    short_en: string;
    short_zh: string;
    long_en: string;
    long_zh: string;
    next_en: string;
    next_zh: string;
  };
  images: string[];
}

export interface Job {
  id: string;
  title: string;
  type: "PM" | "Running" | "Project" | "OnDemand";
  status: "Planned" | "In Progress" | "On Hold" | "Completed" | "Overdue" | "Cancelled";
  priority: "High" | "Medium" | "Low";
  startDate: string;
  endDate: string;
  // Specific fields for different types
  assetName?: string;
  workOrderNo?: string;
  pmType?: string;
  frequency?: string;
  technician?: string;
  siteLocation?: string;
  projectRef?: string;
  foreman?: string;
  crewSize?: number;
  projectNo?: string;
  contractNo?: string;
  client?: string;
  projectManager?: string;
  phase?: string;
  budgetHours?: number;
  onDemandType?: string;
  emergencyLevel?: string;
  scope?: string;
  notes?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  condition: "Good" | "Fair" | "Poor" | "Critical";
  location: string;
  lastInspected: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  store: "Paint" | "Equipment";
  category: string;
  sku: string;
  quantity: number;
  unit: string;
  minStock: number;
  location: string;
  supplier: string;
  notes?: string;
}

export interface IssuedPaintRecord {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  unit: string;
  jobId: string;
  jobTitle: string;
  issuedTo: string;
  issuedBy: string;
  issueDate: string;
  notes?: string;
  requestingDept?: string;
}


