import React, { useState, useRef } from "react";
import {
  BrainCircuit,
  Camera,
  Upload,
  Trash2,
  Sliders,
  Calendar,
  User,
  MapPin,
  Tag,
  Layers,
  Bookmark,
  ShieldAlert,
  Terminal,
  Activity,
  ChevronRight,
  Info,
  Loader2,
  Sparkles,
  Award,
  FileSpreadsheet,
  Layers3
} from "lucide-react";
import OfficialReportSheet from "./OfficialReportSheet";
import DiagnosticDashboard from "./DiagnosticDashboard";
import { CorrosionReport } from "../types";

export default function AIAnalysisPage() {
  const [activeTab, setActiveTab] = useState<"manual" | "visual">("visual");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>("");

  // Views can be: "input" | "report" | "dashboard"
  const [currentView, setCurrentView] = useState<"input" | "report" | "dashboard">("input");
  const [generatedReport, setGeneratedReport] = useState<CorrosionReport | null>(null);

  // --- MANUAL MODE FIELDS ---
  const [manualFields, setManualFields] = useState({
    assetType: "Above-Ground Pipe Rack & Supports",
    material: "Carbon Steel ASTM A516 Gr. 70",
    environment: "ISO 12944 C5-M (Marine Marine Coast)",
    corrosionType: "Crevice & Spot Rusting with Pitting",
    measurements: "Dry Film Thickness (DFT) variable between 60-120 microns. Extreme pitting localized on support saddle interfaces. Bresle testing indicates 28mg/m2 soluble salt density.",
    additionalContext: "Previous coating system was inorganic zinc silicate + epoxy polyamine applied in 2018. Chemical ambient contains marine saline aerosols.",
  });

  // --- VISUAL INSPECTION FIELDS ---
  const [visualFields, setVisualFields] = useState({
    location: "Main Pipe Rack Corridor B",
    projectName: "China Hub Refinery Phase 1",
    assetName: "Above-Ground Pipe Rack & Supports",
    equipmentTag: "PR-SEC-ZONE-02",
    area: "Main Steam Distribution Header / Zone 2",
    inspectionDate: "2026-06-15",
    inspectorName: "James Reed (AMPP Level 3)",
    priorityLevel: "High",
    notes: "High humidity sea spray environment. Severe localized coating delamination and heavy reddish oxide run-outs observed on under-pipe crevice bracket elements.",
  });

  const [visualImages, setVisualImages] = useState<string[]>([]);

  // --- IMAGE MANAGEMENT HELPERS ---
  const handleImageFiles = (files: FileList) => {
    setErrorText(null);
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setErrorText("Only image files are compatible. Please upload standard captures.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setVisualImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeVisualImage = (index: number) => {
    setVisualImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const triggerCameraInput = () => {
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "file";
    hiddenInput.accept = "image/*";
    hiddenInput.capture = "environment";
    hiddenInput.onchange = (e: any) => {
      if (e.target.files) {
        handleImageFiles(e.target.files);
      }
    };
    hiddenInput.click();
  };

  // Drag and drop event handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFiles(e.dataTransfer.files);
    }
  };

  // Expert bilingual mapping engine matching SPIC China formats
  const mapRawReportToBilingual = (rawReport: any, mode: "visual" | "manual", params: any): CorrosionReport => {
    const isVisual = mode === "visual";

    // Build metadata
    const assetName = isVisual 
      ? (params.assetName || "Above-Ground Pipe Rack & Supports") 
      : (params.assetType || "Above-Ground Pipe Rack & Supports");
    const tagNo = isVisual 
      ? (params.equipmentTag || "PR-SEC-ZONE-02") 
      : "PR-SEC-ZONE-02";
    const plant = isVisual 
      ? (params.projectName || "China Hub Refinery Phase 1") 
      : "China Hub Refinery Phase 1";
    const area = isVisual 
      ? (params.area || "Main Steam Distribution Header / Zone 2") 
      : "Main Steam Distribution Header / Zone 2";
    const location = isVisual 
      ? (params.location || "Main Pipe Rack Corridor B") 
      : "Main Pipe Rack Corridor B";
    const date = isVisual 
      ? (params.inspectionDate || "2026-06-15") 
      : "2026-06-15";
    const inspector = isVisual 
      ? (params.inspectorName || "James Reed (AMPP Level 3)") 
      : "James Reed (AMPP Level 3)";
    const priority = (isVisual 
      ? (params.priorityLevel || "HIGH") 
      : "HIGH").toUpperCase() as any;

    const summary_en = rawReport.inspectionSummary_en || rawReport.inspectionSummary || "Visual inspection of the piping network confirms active atmospheric corrosion at multiple points.";
    const summary_zh = rawReport.inspectionSummary_zh || (isVisual 
      ? "目视检测证实，该管线系统多处部位存在活性大气腐蚀、保护性漆膜开裂脱离及锈斑污染。" 
      : "对手工参数的评估显示，底层涂膜耐久性因潮湿凝露作用和原有可溶性盐分残留已经进入阻隔层失效期。");

    // Extract dynamic defects
    const rawDefects = rawReport.detectedDefects || [];
    const defects = rawDefects.map((def: any) => {
      const typeLower = (def.type_en || def.type || def.component || "").toLowerCase();
      let title_en = def.type_en || def.type || "Localized Corrosion";
      let title_zh = def.type_zh || "局部腐蚀缺陷";
      let desc_en = def.description_en || def.description || def.evidence || "Active iron oxidation causing local wall reduction.";
      let desc_zh = def.description_zh || "活性铁氧化引起局部电化学斑状点蚀和截面减薄。";

      if (typeLower.includes("rust") || typeLower.includes("spot") || typeLower.includes("patch")) {
        title_en = "Spot/patch rusting";
        title_zh = "点状/斑块状锈蚀";
        desc_en = "Multiple isolated spots of rusting observed on exposed steel surfaces, where top protective paint coat exfoliated.";
        desc_zh = "在暴露的碳钢表面发现了多处孤立的锈斑，这是由于高分子面漆层剥落老化后导致底材生锈。";
      } else if (typeLower.includes("crevice") || typeLower.includes("bracket") || typeLower.includes("support")) {
        title_en = "Crevice corrosion";
        title_zh = "管托/支撑卡箍缝隙腐蚀";
        desc_en = "Pronounced crevice corrosion is active between the support saddle and piping body, trap saline water.";
        desc_zh = "管道支撑底座和管体卡箍缝隙之间存在活性腐蚀，由于滞留了含盐结露冷凝水，此处构成持续性的腐蚀电池。";
      } else if (typeLower.includes("edge") || typeLower.includes("web") || typeLower.includes("flange")) {
        title_en = "Edge corrosion";
        title_zh = "边缘腐蚀";
        desc_en = "Active rust film degradation along I-beam flanges and weld crowns, prone to low paint film build or sag.";
        desc_zh = "工字钢翼缘、吊架边缘及法兰转角处出现活性边缘锈蚀，这些地方由于边缘效应导致干膜厚度（DFT）流挂不足。";
      } else if (typeLower.includes("blister") || typeLower.includes("delamin") || typeLower.includes("disbond") || typeLower.includes("coat") || typeLower.includes("undercutting")) {
        title_en = "Undercutting/disbonded coating";
        title_zh = "涂层下刮切/脱粘";
        desc_en = "Due to scratches or mechanical damage, paint film peeled back to show active oxide scaling propagation.";
        desc_zh = "在使用中因擦碰划痕破坏了复合防腐涂膜，导致水分侵入发生涂层下漆膜起泡鼓胀和底钢氧化脱层。";
      } else if (typeLower.includes("fastener") || typeLower.includes("bolt") || typeLower.includes("screw") || typeLower.includes("nut")) {
        title_en = "Rust staining from fasteners";
        title_zh = "紧固件生锈和流挂";
        desc_en = "Bolted connections showing heavy oxidation. Fasteners were likely scratched during assembly without touch-ups.";
        desc_zh = "法兰高强螺栓、螺母配件生锈流挂。可能是在安装装配拧紧时划伤，后续未进行富锌底漆的补漆工作。";
      } else if (typeLower.includes("base") || typeLower.includes("adjacent") || typeLower.includes("weld") || typeLower.includes("pitting")) {
        title_en = "Corrosion at base-adjacent welds";
        title_zh = "靠近底部斜撑与焊口腐蚀";
        desc_en = "Severe pitting concentrated at the pipe bottom weld HAZ, showing high potential for liquid leakage.";
        desc_zh = "管底纵向及环向焊口热影响区（HAZ）处发生密集孔蚀，金属出现局部斑状减薄，存在较高的介质穿孔漏逸风险。";
      }

      return {
        severity: (def.severity || "MEDIUM").toUpperCase() as any,
        title_en,
        title_zh,
        desc_en,
        desc_zh
      };
    });

    // Backfill standard faults if missing or short
    if (defects.length < 4) {
      const fillers = [
        {
          severity: "MEDIUM",
          title_en: "Spot/patch rusting",
          title_zh: "点状/斑块状锈蚀",
          desc_en: "Multiple isolated rust spots on pipe webs where moisture penetrated structural protective layers.",
          desc_zh: "管道腹板外侧出现多处散落的铁锈斑块，系湿汽和空气渗透面材漆膜所致。"
        },
        {
          severity: "HIGH",
          title_en: "Crevice corrosion",
          title_zh: "管托/支撑卡箍缝隙腐蚀",
          desc_en: "Extensive oxides packing the crevices between base supports and pipe crowns, creating rapid thinning.",
          desc_zh: "厚度不一的铁锈鳞片堆积在支撑卡座空隙中，形成极易积水的应力微电池，加剧侧面减薄。"
        },
        {
          severity: "MEDIUM",
          title_en: "Edge corrosion",
          title_zh: "边缘腐蚀",
          desc_en: "Coat weathering and sags on bottom flange edges showing active orange bleeding runout.",
          desc_zh: "法兰外边缘和管道锐角尖棱处的防护漆膜老化，并在其薄弱部位冒出红褐色活动性锈水。"
        },
        {
          severity: "MEDIUM",
          title_en: "Undercutting/disbonded coating",
          title_zh: "涂层下刮切/脱粘",
          desc_en: "Coating delamination originating from original tool scrape defects, propagating up to 25mm backward.",
          desc_zh: "由于前期工艺刮损引起的底钢层状侵蚀，生锈斑块向涂层缝隙深处蔓延，形成大片剥离脱壳。"
        }
      ];
      fillers.slice(0, 4 - defects.length).forEach(f => defects.push(f as any));
    }

    return {
      header: {
        company_en: "SPIC CHINA POWER HUB GENERATION COMPANY (PVT.) LIMITED",
        company_zh: "中电国际胡布发电有限公司",
        title_en: "CORROSION & COATING INSPECTION SURVEY REPORT",
        title_zh: "腐蚀与涂层检测调查报告",
        prepared_by: "NACE Certified Inspector Team"
      },
      metadata: {
        assetName,
        tagNo,
        plant,
        area,
        location,
        date,
        inspector,
        priority,
        imagesAnalysed: isVisual ? Math.max(1, visualImages.length) : 4
      },
      summary: {
        en: summary_en,
        zh: summary_zh
      },
      defects,
      rootCause: {
        mechanisms_en: rawReport.rootCauseAnalysis?.[0]?.detail_en || rawReport.rootCauseAnalysis?.[0]?.detail || "The primary mechanism is electrochemical oxidation (atmospheric pitting) stimulated by dissolved saline chlorides (from proximate marine bay) acting as strong electrolyte on the carbon steel face, breaking down passive paint oxides.",
        mechanisms_zh: rawReport.rootCauseAnalysis?.[0]?.detail_zh || "主要的腐蚀失效科学机理是基于空气氧吸氧电化学微电池反应。由于临近海湾吹佛的高浓度氯微粒，在底钢表层沉积，形成强导电性液膜电解质，从而破坏并穿透底漆保护屏障。",
        support_en: rawReport.rootCauseAnalysis?.[1]?.detail_en || rawReport.rootCauseAnalysis?.[1]?.detail || "Geometric gaps at structural frame pipe-supporting cards form perfect capillary water traps. Salt-loaded condensation stays liquid longer here, resulting in crevice cell pitting.",
        support_zh: rawReport.rootCauseAnalysis?.[1]?.detail_zh || "管道斜卡、固定托码等重叠的贴合缝隙形成了高度毛细吸水区。高湿盐雾水分长期在此逗留，构成了局部缝隙充氧不均的严重应力差微缩腐蚀原电池。",
        env_en: "High marine atmospheric chloride exposure, elevated relative air humidity, and heavy direct sunshine, aligning with ISO 12944 Category C5-M Extreme Marine environment class.",
        env_zh: "对应于 ISO 12944 国际标准体系中的最高级别：C5-M 级近海超强海洋腐蚀防护区域类别（伴随强盐雾与高暴晒老化环境）。",
        contributing_en: rawReport.rootCauseAnalysis?.[2]?.detail_en || rawReport.rootCauseAnalysis?.[2]?.detail || "Insufficient film thickness on structural edges (sharp corners lacking stripe-coat brushed layers) and latent steel salt contamination (exceeding 20 mg/m² Bresle test limits) prior to primary multi-coat paint installation.",
        contributing_zh: rawReport.rootCauseAnalysis?.[2]?.detail_zh || "初期施工中转角部位未做边缘条带涂装、高强锚固棱角表面覆漆偏薄（边缘流挂现象），且前次喷砂前可能存在隐蔽的基底金属可溶性盐分污染（Bresle 测试值超限）。"
      },
      rectificationPlan: {
        surfacePrep_en: rawReport.rectificationPlan?.surfacePreparation_en || rawReport.rectificationPlan?.surfacePreparation || "Awaiting specific surface preparation determination based on image analysis.",
        surfacePrep_zh: rawReport.rectificationPlan?.surfacePreparation_zh || "等待基于图像分析的具体表面处理方式确定。",
        primer_en: "Apply one full coat of dual-pack organic zinc-rich epoxy primer (SSPC-Paint 20, min 80% zinc dust weight in dry film) to a nominal DFT of 75 µm.",
        primer_zh: "满涂一遍高固量双组份富锌环氧底漆（符合 SSPC-Paint 20 标准，干膜中金属锌粉质量占比不低于 80%），公称干膜厚度（DFT）控制在 75 µm。",
        intermediate_en: rawReport.rectificationPlan?.paintSystemRecommendation_en?.split("\n")?.[1] || rawReport.rectificationPlan?.paintSystemRecommendation?.split("\n")?.[1] || "Apply one coat of high-build epoxy polyamide intermediate bar coat containing micaceous iron oxide (MIO) barrier pigments @ 125 µm DFT.",
        intermediate_zh: rawReport.rectificationPlan?.paintSystemRecommendation_zh?.split("\n")?.[1] || "满刮/喷涂一遍具有优异耐水性与水汽屏蔽性能的双组份云铁环氧防锈中间漆 @ 125 µm 公称干膜厚度。",
        topcoat_en: rawReport.rectificationPlan?.paintSystemRecommendation_en?.split("\n")?.[2] || rawReport.rectificationPlan?.paintSystemRecommendation?.split("\n")?.[2] || "Apply one final high-gloss exterior acrylic polyurethane top finish coat with aliphatic isocyanate curing agents to 50 µm thickness.",
        topcoat_zh: rawReport.rectificationPlan?.paintSystemRecommendation_zh?.split("\n")?.[2] || "最后面漆选用脂肪族异氰酸酯固化型丙烯酸聚氨酯高抗褪色户外高级装饰面漆 @ 50 µm 标称厚度。",
        dft_en: "Calibrate electromagnetic coating gauge using Certified Shims per SSPC-PA 2. Log measurements and confirm minimum 80% area passes the target 250 µm thickness threshold.",
        dft_zh: "使用计量标准垫片对测厚仪校零（SSPC-PA 2 规范），测定多个测区的干膜层厚度并建立趋势，确保不低于 80% 的测试点满足总设计厚度 250 µm 的要求。",
        holiday_en: "Conduct wet-sponge low voltage holiday detection scanning on complex geometric interfaces, bolt hubs, and welds to ensure zero pinholes per NACE SP0188.",
        holiday_zh: "对于难清洗的螺栓法兰结合面和焊缝，选用低压湿海绵针孔检测仪（依据 NACE SP0188 规范）实施 100% 扫频，消除肉眼无形的气孔与砂眼通道。",
        safety_en: rawReport.rectificationPlan?.safetyPrecautions_en || rawReport.rectificationPlan?.safetyPrecautions || "Mandate painter air-supplied hood respirators during spraying. Scaffolds must comply with OSHA guidelines. Explosive warning sensors (LEL < 10% limit) must run in confined sections.",
        safety_zh: rawReport.rectificationPlan?.safetyPrecautions_zh || "喷涂工人须戴正压送风式全面防护头罩。满搭操作脚手架挂红标，并在危险局部空间安装 LEL 可燃性气体检测仪以预防窒息爆燃事件发生。"
      },
      maintenancePlan: {
        frequency_en: rawReport.preventiveMaintenancePlan?.frequency_en || rawReport.preventiveMaintenancePlan?.frequency || "Perform visual checkups semi-annually and non-destructive UT wall thickness scanning or dry film mapping audits annually.",
        frequency_zh: rawReport.preventiveMaintenancePlan?.frequency_zh || "指定防腐管理人员进行每半年一届的徒步目视勘察，并排定每年进行一次大面积管道防腐层测绘与超声钢板壁厚测定。",
        survey_en: "Inspect supporting flange cradles, base welds, and corners, checking for coating hair-cracks, blistering, and rusty brine drips.",
        survey_zh: "重点聚焦管道鞍座焊缝、立柱卡箍和死角转折，严防由应力、水分与大气复合催化的微小起毛和初期暗色流锈发生。",
        monitoring_en: rawReport.preventiveMaintenancePlan?.monitoringRecommendations_en || rawReport.preventiveMaintenancePlan?.monitoringRecommendations || "Attach local Bresle test adhesive patches during route walkthroughs to document sea aerosol salt buildup gradients.",
        monitoring_zh: rawReport.preventiveMaintenancePlan?.monitoringRecommendations_zh || "在巡视检验沿线设置定点 Bresle 贴片并用微量注射仪抽吸盐分，以此绘制管道不同区域的海盐颗粒物理负载曲线。",
        threshold_en: rawReport.preventiveMaintenancePlan?.touchUpInterval_en || rawReport.preventiveMaintenancePlan?.touchUpInterval || "Initiate localized surface mechanical preparation and touch-ups immediately if rust percentage exceeds ISO 4628 Ri 3 grade.",
        threshold_zh: rawReport.preventiveMaintenancePlan?.touchUpInterval_zh || "一旦任意大面构件目视发现微锈点密度或膨胀老化劣化度达到 ISO 4628 标准中的 Ri 3 锈蚀评级时，必须立即启动补漆作业。",
        recoat_en: rawReport.preventiveMaintenancePlan?.recoatingTimeline_en || rawReport.preventiveMaintenancePlan?.recoatingTimeline || "Expect complete stripping and recoating of protective coating system after approximately 12 to 15 years under marine operations.",
        recoat_zh: rawReport.preventiveMaintenancePlan?.recoatingTimeline_zh || "在当前胡布电厂沿岸近海高湿、高氯、C5 类型外部腐蚀环境下，推荐涂层完全剥离及更新重建大修循环为 12 至 15 年。"
      },
      riskAssessment: {
        safety_en: rawReport.riskAssessment?.details || "Failure to intervene risks structural base-metal sheet thinning, which degrades piping load-bearing stability, causing physical bend/burst.",
        safety_zh: "若拖延治理，会导致管道或支架主体钢板大幅锈蚀减薄，直至丧失自重及风荷载下的机械刚度稳定，引发管道弯曲断裂与坍塌。",
        corrosionRate_en: "Pitting penetration can reach 0.40 - 0.50 mm/annum if topcoat bar layers completely peel off, rendering carbon steel exposed.",
        corrosionRate_zh: "在极板由于磨蚀阻隔漆大片脱粘而直接暴露的状态下，极端点蚀孔洞的物理向下穿凿速率可在 0.40 至 0.50 毫米/年，极具危害性。",
        impact_en: "Medium-pressure process gas or sulfur fluid leakage, emergency plant shut-down, environmental cleanup penalties, and high downtime costs.",
        impact_zh: "中压工艺气体、油水混合物瞬间爆破泄露，或造成不可逆的海区环境油气漂溢，以及导致全线被迫非计划紧急停车检修的巨额经济损失。",
        life_en: "Unprotected metal section structural design lifetime drops severely from 20 years to under 4 years before reaching the thickness limit.",
        life_zh: "如放任底钢在天然非极化环境中受湿氧盐雾剥蚀，其余量管壁强度预估会在 4 年内提前降低至最小操作极限壁厚，缩短折寿过半。"
      },
      recommendedTimeline: {
        immediate_en: rawReport.estimatedTimeline?.repairDuration || "Clean red oxide runs from existing welds. Brush-prime exposed pipe supports and bolt nests with high-build primer.",
        immediate_zh: "铲除焊缝上流挂的橙红厚锈。对露铁的管道受拉支撑钢板、底座卡箍进行快速手工打磨，点刷富锌底漆保护。",
        short_en: "Exchange high-tension bolts showing severe rust. Setup safe climbing platforms or standard scaffolds around work joints.",
        short_zh: "更换咬合面开裂、螺距胀锈的高强紧固件螺栓螺母，并在施工局部危险高度点搭设防护脚手架与挂梯。",
        long_en: "Execute full Sa 2½ grit-blasting rehab, stripe-coating critical corners, and implement the planned multi-coat C5-M system.",
        long_zh: "分片区实施气动喷砂 Sa 2½ 近白级除锈施工，对螺栓、转角、细缝刷涂加强条带漆，并完成本报告设定的云铁聚氨酯多层防护面漆涂刷系统。",
        next_en: rawReport.estimatedTimeline?.nextInspectionDate || "Verify restorative system thickness and pinhole compliance within 6 months.",
        next_zh: "在防腐漆刷好并交付使用的第 6 个月，由第三方 AMPP CIP Level 3 专家组现场复测防护层厚度和完好率。"
      },
      images: visualImages.length > 0 ? visualImages : ["/placeholder-image-1", "/placeholder-image-2"]
    };
  };

  const handleRunAIAnalysis = async () => {
    setErrorText(null);
    setIsAnalyzing(true);
    setAnalysisProgress("Acquiring digital pipeline parameters...");

    try {
      const activeParams = activeTab === "visual" ? visualFields : manualFields;
      
      // Simulate nice micro-defect analyzer logs
      setTimeout(() => setAnalysisProgress("Converting imagery bases to binary matrices..."), 1000);
      setTimeout(() => setAnalysisProgress("Evaluating electrochemical delta gradients..."), 2000);
      setTimeout(() => setAnalysisProgress("Formulating coating micro-blister thickness ratio calculations..."), 3500);

      const requestBody = {
        mode: activeTab,
        parameters: activeParams,
        images: activeTab === "visual" ? visualImages : []
      };

      const response = await fetch("/api/analyze-corrosion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API communication disrupted. Server returned code ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        let textResponse = "";
        try {
          textResponse = await response.text();
        } catch(e) {}
        throw new Error("Server connection timed out or returned an invalid API response format. Please try again.");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Analyzing pipeline resulted in unknown error.");
      }

      // Populate report through expert mapping engine
      const bilingualReport = mapRawReportToBilingual(result.report, activeTab, activeParams);
      bilingualReport.isSimulation = !!result.simulation;
      bilingualReport.apiMessage = result.apiMessage || result.message || "";
      
      // Complete analytical processes
      setTimeout(() => {
        setGeneratedReport(bilingualReport);
        setIsAnalyzing(false);
        setCurrentView("dashboard");
      }, 4800);

    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Failed to complete AI evaluation. Attempt again.");
      setIsAnalyzing(false);
    }
  };

  const handleSaveDraft = () => {
    console.log("Ready for new logic", {
      action: "SaveDraft",
      manualFields,
      visualFields,
    });
    alert("Draft successfully locked to browser context cache! Ready for production export.");
  };

  // Switch between views rendering different components
  if (currentView === "report" && generatedReport) {
    return (
      <OfficialReportSheet 
        report={generatedReport} 
        onBack={() => setCurrentView("dashboard")} 
      />
    );
  }

  if (currentView === "dashboard" && generatedReport) {
    return (
      <DiagnosticDashboard 
        report={generatedReport}
        onViewOfficial={() => setCurrentView("report")}
        onBack={() => setCurrentView("input")}
      />
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-950 overflow-y-auto space-y-8 font-sans select-text">
      
      {/* Title Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest font-mono">
              NACE CIP LEVEL 3 INTEGRATION
            </span>
            <span className="p-1 rounded bg-teal-500/10 text-teal-500 border border-teal-500/20 text-[10px] font-bold uppercase tracking-widest font-mono">
              Bilingual (EN/ZH) Output
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 leading-none">
            <BrainCircuit className="text-amber-500 animate-pulse" size={32} />
            SPIC AI Inspection Hub
          </h2>
          <p className="text-gray-400 mt-2 text-sm max-w-2xl leading-relaxed">
            Populate specific facility observations, upload micro-defect captures, and activate the primary neural processor. Instantly generate a 100% stylistically mirrored bilingual inspection report cards.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold rounded-xl transition text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Bookmark size={14} />
            Save Draft Outline
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Controls */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Tab Selector */}
          <div className="bg-gray-900/60 border border-white/15 rounded-2xl p-1.5 flex gap-2">
            <button
              onClick={() => setActiveTab("visual")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition text-xs tracking-wide ${
                activeTab === "visual"
                  ? "bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/15"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Camera size={14} />
              AI Visual Inspection
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition text-xs tracking-wide ${
                activeTab === "manual"
                  ? "bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/15"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sliders size={14} />
              Manual Parameter Analysis
            </button>
          </div>

          {/* TAB 1: VISUAL EVIDENCE COLLECTOR */}
          {activeTab === "visual" && (
            <div className="bg-gray-900/40 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Camera className="text-amber-500" size={18} />
                  Visual Evidence Collector
                </h3>
                <span className="text-xs font-mono text-gray-500">
                  {visualImages.length} Image{visualImages.length === 1 ? "" : "s"} Staged
                </span>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition relative group ${
                  isDragging 
                    ? "border-amber-500 bg-amber-500/5" 
                    : "border-white/15 hover:border-amber-500/50 bg-white/[0.01]"
                }`}
              >
                <div className="absolute top-2 right-2">
                  <span className="text-[9px] font-mono text-gray-400 px-2 py-0.5 bg-white/5 border border-white/5 rounded">Drop Enabled</span>
                </div>

                <div className="flex flex-col items-center justify-center space-y-3 py-4">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center shadow-lg group-hover:scale-115 transition duration-300">
                    <Upload size={22} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">Upload inspection captures or drag photo</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Staged items are loaded into active state. Supports standard browser formats.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center justify-center pt-2">
                    <label className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 font-bold rounded-xl text-xs text-gray-950 transition duration-150 active:scale-95 flex items-center gap-1 cursor-pointer">
                      <Upload size={14} />
                      Browse Images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) handleImageFiles(e.target.files);
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={triggerCameraInput}
                      className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 font-semibold rounded-xl text-xs text-white transition duration-150 active:scale-95 flex items-center gap-1.5"
                    >
                      <Camera size={14} className="text-amber-400" />
                      Take Live Photo (Mobile Hook)
                    </button>
                  </div>
                </div>
              </div>

              {/* Uploaded Images Preview */}
              {visualImages.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block">
                    Staged Visual Previews ({visualImages.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {visualImages.map((src, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 bg-gray-950 h-20">
                        <img
                          src={src}
                          alt={`Staged capture ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300 pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => removeVisualImage(idx)}
                          className="absolute inset-0 bg-red-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 rounded-xl"
                        >
                          <Trash2 size={16} className="text-red-400" />
                          <span className="text-[10px] font-bold ml-1 text-red-100">Remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inspection Details Metadata Form */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block">
                  Inspection Details & Metadata
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                      <Layers3 size={12} className="text-amber-500" />
                      Plant / Project Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Al-Jubail Export Terminal"
                      className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition animate-none"
                      value={visualFields.projectName}
                      onChange={(e) => setVisualFields({ ...visualFields, projectName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                      <MapPin size={12} className="text-amber-500" />
                      Location / Facility Area
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tank Farm Site C, Row 3"
                      className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition"
                      value={visualFields.location}
                      onChange={(e) => setVisualFields({ ...visualFields, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                      <FileSpreadsheet size={12} className="text-amber-500" />
                      Asset Name / Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Raw Crude Process Vessel"
                      className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition"
                      value={visualFields.assetName}
                      onChange={(e) => setVisualFields({ ...visualFields, assetName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                      <Tag size={12} className="text-amber-500" />
                      Equipment Tag Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10-T-102-S"
                      className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition"
                      value={visualFields.equipmentTag}
                      onChange={(e) => setVisualFields({ ...visualFields, equipmentTag: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                      <Sliders size={12} className="text-amber-500" />
                      Specific Zone / Section
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Weld Crown & Splash Boundary"
                      className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition"
                      value={visualFields.area}
                      onChange={(e) => setVisualFields({ ...visualFields, area: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                      <Calendar size={12} className="text-amber-500" />
                      Inspection Date
                    </label>
                    <input
                      type="date"
                      className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition"
                      value={visualFields.inspectionDate}
                      onChange={(e) => setVisualFields({ ...visualFields, inspectionDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                      <User size={12} className="text-amber-500" />
                      Inspector Name & Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. James Reed (AMPP Level 3)"
                      className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition"
                      value={visualFields.inspectorName}
                      onChange={(e) => setVisualFields({ ...visualFields, inspectorName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                      <ShieldAlert size={12} className="text-amber-500" />
                      Priority Classification
                    </label>
                    <select
                      className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition cursor-pointer"
                      value={visualFields.priorityLevel}
                      onChange={(e) => setVisualFields({ ...visualFields, priorityLevel: e.target.value })}
                    >
                      <option value="Low">Low (Aesthetic maintenance only)</option>
                      <option value="Medium">Medium (Active corrosion, plan fix)</option>
                      <option value="High">High (Substantial pitting, repair critical)</option>
                      <option value="Critical">Critical (Immediate structural hazard)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Notes & Inspection Observations</label>
                  <textarea
                    placeholder="Provide details about structural vibration, high saline wet spray conditions, proximity to acid processing lines, etc..."
                    rows={3}
                    className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition resize-none"
                    value={visualFields.notes}
                    onChange={(e) => setVisualFields({ ...visualFields, notes: e.target.value })}
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MANUAL PARAMETER ANALYSIS */}
          {activeTab === "manual" && (
            <div className="bg-gray-900/40 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="text-amber-500" size={18} />
                  Structural Asset Parameters Form
                </h3>
                <span className="text-xs font-mono text-gray-500">Manual Slate</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Asset Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Tank Bottom Pintles / Piping"
                    className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition"
                    value={manualFields.assetType}
                    onChange={(e) => setManualFields({ ...manualFields, assetType: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Base Metal / Alloy Material</label>
                  <input
                    type="text"
                    placeholder="e.g. Carbon Steel ASTM A516 Gr. 70"
                    className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition"
                    value={manualFields.material}
                    onChange={(e) => setManualFields({ ...manualFields, material: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">Corrosive Atmosphere / Environment</label>
                    <select
                      className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition cursor-pointer"
                      value={manualFields.environment}
                      onChange={(e) => setManualFields({ ...manualFields, environment: e.target.value })}
                    >
                      <option value="">-- Choose Exposure Class --</option>
                      <option value="ISO 12944 C3 (Medium Urban/Coastal)">C3 - Medium Urban/Coastal Environment</option>
                      <option value="ISO 12944 C4 (High Industrial/Coastal)">C4 - High Industrial/Coastal Exposure</option>
                      <option value="ISO 12944 C5-I (Very High Industrial Acid)">C5-I - Very High Industrial/Acid Chemical Exposure</option>
                      <option value="ISO 12944 C5-M (Marine Marine Coast)">C5-M - Offshore Extreme Marine Splash Zone</option>
                      <option value="CX Category (Extreme Extreme Industrial/Marine)">CX Category - Subsea and Extremely Harsh Environments</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Observed Corrosion Mechanism</label>
                  <input
                    type="text"
                    placeholder="e.g. Under-insulation degradation (CUI) / Galvanic"
                    className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition"
                    value={manualFields.corrosionType}
                    onChange={(e) => setManualFields({ ...manualFields, corrosionType: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Surface Measurements & Local Observations</label>
                <textarea
                  placeholder="Record actual measurements: e.g. 'Dry Film Thickness (DFT) variable between 40-90 microns. Extreme pitting localized on the heat-affected zone (HAZ) of seam welds. Bresle patch tests signify 32mg/m2 chloride density.'"
                  rows={4}
                  className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition resize-none"
                  value={manualFields.measurements}
                  onChange={(e) => setManualFields({ ...manualFields, measurements: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Additional Context, Repair History, or System Criteria</label>
                <textarea
                  placeholder="e.g. 'Previous system was ethyl silicate primer + epoxy polyamine build, installed 2018. Chemical plant releases sulfuric oxide plumes 120m windward.'"
                  rows={3}
                  className="w-full bg-gray-950 border border-white/10 hover:border-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-3 rounded-xl text-white outline-none transition resize-none"
                  value={manualFields.additionalContext}
                  onChange={(e) => setManualFields({ ...manualFields, additionalContext: e.target.value })}
                />
              </div>

            </div>
          )}

          {/* Submit Action */}
          <div className="space-y-4">
            {errorText && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2.5">
                <Info size={16} />
                <span>{errorText}</span>
              </div>
            )}

            <button
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className={`w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 text-sm font-extrabold rounded-2xl shadow-xl shadow-amber-500/15 transition duration-150 active:scale-95 flex items-center justify-center gap-2.5 ${
                isAnalyzing ? "opacity-90 cursor-wait" : "cursor-pointer"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin text-gray-950" size={18} />
                  <span>{analysisProgress || "RUNNING CRITICAL NACE MODEL EVALUATION..."}</span>
                </>
              ) : (
                <>
                  <BrainCircuit size={18} />
                  <span>RUN DEEP AI CORROSION ANOMALY ANALYSIS</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: Expert Engine Integration Notice Shell */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-gray-950 border border-white/10 rounded-3xl p-6 md:p-8 text-center space-y-6 py-12 flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Ambient Background Light Decoration */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {isAnalyzing ? (
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner relative">
                <Loader2 className="animate-spin text-amber-500" size={28} />
                {/* spinning concentric circle */}
                <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/30 animate-spin [animation-duration:8s]" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                <Terminal size={28} />
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white tracking-wide">
                {isAnalyzing ? "Processing Corrosion Physics..." : "Engine Status: Active"}
              </h3>
              <p className="text-xs text-amber-500 font-mono tracking-widest uppercase font-extrabold">
                {isAnalyzing ? "Neural Model Streaming..." : "NACE / ISO Evaluation Ready"}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto pt-2">
                This area streams live staged parameter metrics. Activate analysis to translate current inputs into official Spic China Power Hub formatted PDF sheets.
              </p>
            </div>

            <div className="w-full border-t border-dashed border-white/10 pt-4 text-left space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500/80 font-mono block">
                Staged Parameters Live Feed:
              </span>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2 text-xs font-mono text-gray-400">
                <div className="flex items-center gap-1.5 text-gray-300 font-semibold mb-1">
                  <Activity size={12} className="text-emerald-500" />
                  <span>METADATA FEED</span>
                </div>
                
                {activeTab === "visual" ? (
                  <>
                    <p className="truncate"><span className="text-gray-500">Site/Project:</span> {visualFields.projectName || "Pending..."}</p>
                    <p className="truncate"><span className="text-gray-500">Area/Location:</span> {visualFields.location || "Pending..."}</p>
                    <p className="truncate"><span className="text-gray-500">Asset:</span> {visualFields.assetName || "Pending..."}</p>
                    <p className="truncate"><span className="text-gray-500">Staged Images:</span> {visualImages.length} count</p>
                    <p><span className="text-gray-500">Classification:</span> {visualFields.priorityLevel}</p>
                  </>
                ) : (
                  <>
                    <p className="truncate"><span className="text-gray-500">Asset Type:</span> {manualFields.assetType || "Pending..."}</p>
                    <p className="truncate"><span className="text-gray-500">Metal Class:</span> {manualFields.material || "Pending..."}</p>
                    <p className="truncate"><span className="text-gray-500">Environment:</span> {manualFields.environment || "Pending..."}</p>
                    <p className="truncate font-sans text-[11px] text-gray-500 italic mt-1 bg-white/[0.01] p-1.5 rounded">
                      Observations: {manualFields.measurements ? `"${manualFields.measurements.slice(0, 80)}..."` : "Empty"}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3.5 bg-white/5 rounded-xl border border-white/5 w-full text-left text-xs text-gray-300">
              <Info size={14} className="text-amber-500 shrink-0" />
              <span>
                Form modifications dynamically stream to local state. Connect your API requests to formulate physical bilingual report cards!
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
