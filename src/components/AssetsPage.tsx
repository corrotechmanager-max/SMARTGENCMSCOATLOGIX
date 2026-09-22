import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { 
  Box, Plus, Pencil, Trash2, Clock, MapPin, AlertCircle, FileSpreadsheet, X, Search, FileUp, Filter 
} from "lucide-react";
import { Asset } from "../types";
import { subscribeToStore, saveToStore } from "../lib/firebase";

// Default pre-seeded assets matching the dashboard counts: GOOD 3, FAIR 0, POOR 1, CRITICAL 0
export const ASSET_TYPE_OPTIONS = [
  "Pipeline",
  "Tank",
  "Structure",
  "Vessel",
  "Marine",
  "Heavy duty Vehicle/equipment",
  "Stacker / Reclaimer & Bulk Handling",
  "Crane & Lifting Equipment",
  "Rotating Equipment (Pump / Compressor)",
  "Heat Exchanger / Boiler",
  "Piping & Valve Skid",
  "Electrical & Instrumentation",
  "Other"
];

const DEFAULT_ASSETS: Asset[] = [
  {
    id: "asset-1",
    name: "North Pipeline Segment A",
    type: "Pipeline",
    condition: "Good",
    location: "Plant Area 3, Grid B-7",
    lastInspected: "2026-05-12",
    notes: "Continuous acoustic emission monitoring enabled. Exterior coating is in robust state."
  },
  {
    id: "asset-2",
    name: "Storage Tank T-102",
    type: "Tank",
    condition: "Good",
    location: "Tank Farm West, Bay 2",
    lastInspected: "2026-04-10",
    notes: "Clean internal floor scan. Anode replacement completed during Q1 maintenance turnaround."
  },
  {
    id: "asset-3",
    name: "Sea Wall Barrier Section C",
    type: "Structure",
    condition: "Good",
    location: "Marine Intake Channel",
    lastInspected: "2026-06-01",
    notes: "Reinforced concrete barrier showing zero structural cracking. Splaszone recoated."
  },
  {
    id: "asset-4",
    name: "Offshore Riser R-4",
    type: "Other",
    condition: "Poor",
    location: "Platform Alpha, Sector 4",
    lastInspected: "2026-03-22",
    notes: "Localized galvanic pitting at splash zone. Coating degradation of 15% observed."
  }
];

interface LocationRecord {
  id: string;
  name: string;
}

const DEFAULT_LOCATIONS: LocationRecord[] = [
  { id: "loc-1", name: "Plant Area 3, Grid B-7" },
  { id: "loc-2", name: "Tank Farm West, Bay 2" },
  { id: "loc-3", name: "Marine Intake Channel" },
  { id: "loc-4", name: "Platform Alpha, Sector 4" }
];

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [filter, setFilter] = useState<"All" | "Good" | "Fair" | "Poor" | "Critical">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);

  // Location management states
  const [newLocName, setNewLocName] = useState("");
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [editingLocName, setEditingLocName] = useState("");
  const [locationError, setLocationError] = useState("");

  // Form State
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("Heavy duty Vehicle/equipment");
  const [formCondition, setFormCondition] = useState<"Good" | "Fair" | "Poor" | "Critical">("Good");
  const [formLocation, setFormLocation] = useState("");
  const [formLastInspected, setFormLastInspected] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Live Firebase cloud sync for assets and locations
  useEffect(() => {
    const unsubAssets = subscribeToStore<Asset>("corrotech_assets", DEFAULT_ASSETS, (cloudAssets) => {
      setAssets(cloudAssets);
    });

    const unsubLocs = subscribeToStore<LocationRecord>("corrotech_locations", DEFAULT_LOCATIONS, (cloudLocs) => {
      setLocations(cloudLocs);
    });

    return () => {
      unsubAssets();
      unsubLocs();
    };
  }, []);

  // Save helpers syncing to LocalStorage and Cloud Firestore
  const saveAssets = (updatedAssets: Asset[]) => {
    setAssets(updatedAssets);
    saveToStore("corrotech_assets", updatedAssets);
  };

  const saveLocations = (updatedLocs: LocationRecord[]) => {
    setLocations(updatedLocs);
    saveToStore("corrotech_locations", updatedLocs);
  };

  const showLocationError = (msg: string) => {
    setLocationError(msg);
    setTimeout(() => setLocationError(""), 3000);
  };

  // Location creation
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    if (locations.some(l => l.name.toLowerCase() === newLocName.trim().toLowerCase())) {
      showLocationError("This location is already registered.");
      return;
    }

    const newLoc: LocationRecord = {
      id: "loc-" + Date.now(),
      name: newLocName.trim()
    };
    const updated = [...locations, newLoc];
    saveLocations(updated);
    setNewLocName("");
  };

  // Location updating
  const handleStartEditLoc = (loc: LocationRecord) => {
    setEditingLocId(loc.id);
    setEditingLocName(loc.name);
  };

  const handleSaveEditLoc = () => {
    if (!editingLocName.trim()) return;

    if (locations.some(l => l.id !== editingLocId && l.name.toLowerCase() === editingLocName.trim().toLowerCase())) {
      showLocationError("This location name already exists.");
      return;
    }

    const oldLoc = locations.find(l => l.id === editingLocId);
    const updated = locations.map(l => l.id === editingLocId ? { ...l, name: editingLocName.trim() } : l);
    saveLocations(updated);

    if (oldLoc) {
      const updatedAssets = assets.map(a => 
        a.location === oldLoc.name ? { ...a, location: editingLocName.trim() } : a
      );
      saveAssets(updatedAssets);
    }

    setEditingLocId(null);
    setEditingLocName("");
  };

  // Location deletion
  const handleDeleteLoc = (locId: string) => {
    const locToDelete = locations.find(l => l.id === locId);
    if (!locToDelete) return;

    const countInLoc = assets.filter(a => a.location === locToDelete.name).length;
    if (countInLoc > 0) {
      showLocationError(`Cannot delete: ${countInLoc} active asset(s) are assigned to this location.`);
      return;
    }

    const updated = locations.filter(l => l.id !== locId);
    saveLocations(updated);
  };

  // KPI Calculations
  const counts = useMemo(() => {
    return {
      Good: assets.filter(a => a.condition === "Good").length,
      Fair: assets.filter(a => a.condition === "Fair").length,
      Poor: assets.filter(a => a.condition === "Poor").length,
      Critical: assets.filter(a => a.condition === "Critical").length,
    };
  }, [assets]);

  // Open modal for creation
  const handleOpenAddModal = () => {
    setEditingAsset(null);
    setFormName("");
    setFormType("Heavy duty Vehicle/equipment");
    setFormCondition("Good");
    setFormLocation(locations.length > 0 ? locations[0].name : "");
    setFormLastInspected(new Date().toISOString().split("T")[0]);
    setFormNotes("");
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormName(asset.name);
    setFormType(asset.type);
    setFormCondition(asset.condition);
    setFormLocation(asset.location);
    setFormLastInspected(asset.lastInspected);
    setFormNotes(asset.notes || "");
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingAsset) {
      // Update
      const updated = assets.map(a => 
        a.id === editingAsset.id 
          ? { 
              ...a, 
              name: formName, 
              type: formType, 
              condition: formCondition, 
              location: formLocation, 
              lastInspected: formLastInspected, 
              notes: formNotes 
            } 
          : a
      );
      saveAssets(updated);
    } else {
      // Create
      const newAsset: Asset = {
        id: "asset-" + Date.now(),
        name: formName,
        type: formType,
        condition: formCondition,
        location: formLocation,
        lastInspected: formLastInspected,
        notes: formNotes
      };
      saveAssets([...assets, newAsset]);
    }
    setIsModalOpen(false);
  };

  // Delete Handler
  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteAsset = () => {
    if (deleteConfirmId) {
      const updated = assets.filter(a => a.id !== deleteConfirmId);
      saveAssets(updated);
      setDeleteConfirmId(null);
    }
  };

  // Import mock assets handler
  const handleImport = () => {
    setImportConfirmOpen(true);
  };

  const confirmImportAssets = () => {
    saveAssets(DEFAULT_ASSETS);
    saveLocations(DEFAULT_LOCATIONS);
    setImportConfirmOpen(false);
  };

  // Filtered Assets list
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesFilter = filter === "All" || asset.condition === filter;
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            asset.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            asset.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [assets, filter, searchQuery]);

  return (
    <div className="flex-1 p-6 md:p-8 bg-[#171513] text-gray-200 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Box className="text-amber-500" />
              Assets
            </h1>
            <p className="text-xs text-gray-400 mt-1">Industrial infrastructure inventory and corrosion tracking logs</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleImport}
              className="bg-gray-800 hover:bg-gray-750 text-gray-300 font-bold py-2.5 px-4 rounded-xl text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer border border-white/5"
            >
              <FileUp size={16} />
              Import
            </button>
            <button 
              onClick={handleOpenAddModal}
              className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2.5 px-4 rounded-xl text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <Plus size={16} />
              Add Asset
            </button>
          </div>
        </header>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search assets by name, location, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1f1d1b] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all"
          />
        </div>

        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1f1d1b] border border-gray-800 p-5 rounded-2xl relative overflow-hidden group">
            <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">GOOD</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{counts.Good}</span>
              <span className="text-xs text-green-500 font-semibold">Active</span>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-green-500/25"></div>
          </div>

          <div className="bg-[#1f1d1b] border border-gray-800 p-5 rounded-2xl relative overflow-hidden group">
            <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">FAIR</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{counts.Fair}</span>
              <span className="text-xs text-yellow-500 font-semibold">Monitor</span>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-yellow-500/25"></div>
          </div>

          <div className="bg-[#1f1d1b] border border-gray-800 p-5 rounded-2xl relative overflow-hidden group">
            <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">POOR</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{counts.Poor}</span>
              <span className="text-xs text-orange-500 font-semibold">Degrading</span>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-orange-500/25"></div>
          </div>

          <div className="bg-[#1f1d1b] border border-gray-800 p-5 rounded-2xl relative overflow-hidden group">
            <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">CRITICAL</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{counts.Critical}</span>
              <span className="text-xs text-red-500 font-semibold">Immediate</span>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-red-500/25"></div>
          </div>
        </div>

        {/* Layout Split: Location Registry on Left, Assets list on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Column: Location Registry */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#1f1d1b] border border-gray-800 rounded-2xl p-5 shadow-xl">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-amber-500" />
                Location Registry
              </h2>
              <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                Define your physical plant locations first. Asset forms will automatically provide inline drop-down selection of these locations.
              </p>

              {/* Error Message */}
              {locationError && (
                <div className="p-2.5 mb-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-400 font-medium">
                  {locationError}
                </div>
              )}

              {/* Add Location Form */}
              <form onSubmit={handleAddLocation} className="space-y-2 mb-4">
                <input
                  type="text"
                  placeholder="New location name..."
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full bg-[#171513] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2 rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-md shadow-amber-500/10"
                >
                  + Add Location
                </button>
              </form>

              {/* Locations List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {locations.map((loc) => {
                  const assetCount = assets.filter(a => a.location === loc.name).length;
                  const isEditing = editingLocId === loc.id;

                  return (
                    <div 
                      key={loc.id} 
                      className="p-2.5 rounded-xl bg-gray-950/20 border border-gray-900 flex flex-col gap-2 group/loc transition-all hover:bg-gray-950/40"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingLocName}
                            onChange={(e) => setEditingLocName(e.target.value)}
                            className="w-full bg-[#171513] border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                            autoFocus
                          />
                          <div className="flex gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditingLocId(null)}
                              className="px-2.5 py-1 rounded bg-gray-850 hover:bg-gray-800 text-gray-400 hover:text-white text-[10px] font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveEditLoc}
                              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-gray-950 text-[10px] font-bold"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-200 font-medium truncate" title={loc.name}>
                              {loc.name}
                            </p>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {assetCount} {assetCount === 1 ? "asset" : "assets"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover/loc:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleStartEditLoc(loc)}
                              className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded transition"
                              title="Edit Location"
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLoc(loc.id)}
                              className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded transition"
                              title="Delete Location"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {locations.length === 0 && (
                  <p className="text-xs text-gray-600 italic text-center py-4">No locations registered.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Filters and Assets List */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500 font-bold uppercase tracking-wider mr-2 flex items-center gap-1">
                <Filter size={14} /> Filter:
              </span>
              {(["All", "Good", "Fair", "Poor", "Critical"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                    filter === opt 
                      ? "bg-amber-500 text-gray-950 shadow-md shadow-amber-500/10" 
                      : "bg-gray-800/40 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700"
                  }`}
                >
                  {opt} {opt === "All" ? `(${assets.length})` : `(${assets.filter(a => a.condition === opt).length})`}
                </button>
              ))}
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <div 
                    key={asset.id} 
                    className="bg-[#1f1d1b] border border-gray-800/80 hover:border-gray-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group"
                  >
                    <div>
                      {/* Top line with Condition Badge */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase bg-amber-500/10 px-2.5 py-1 rounded-md">
                            {asset.type}
                          </span>
                          <h3 className="font-bold text-white text-base mt-2 tracking-tight group-hover:text-amber-400 transition-colors">
                            {asset.name}
                          </h3>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          asset.condition === "Good" ? "bg-green-500/10 text-green-400" :
                          asset.condition === "Fair" ? "bg-yellow-500/10 text-yellow-400" :
                          asset.condition === "Poor" ? "bg-orange-500/10 text-orange-400" :
                          "bg-red-500/10 text-red-400"
                        }`}>
                          {asset.condition}
                        </span>
                      </div>

                      {/* Metadata and Notes */}
                      <div className="space-y-2.5 my-4 text-xs text-gray-400 border-t border-b border-gray-800/50 py-3.5">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-amber-500 shrink-0" />
                          <span className="text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20 text-[11px] uppercase tracking-wide">
                            {asset.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-500 shrink-0" />
                          <span>Last Inspected: <strong className="text-gray-300">{asset.lastInspected}</strong></span>
                        </div>
                        {asset.notes && (
                          <p className="text-gray-500 italic leading-relaxed mt-2 pl-2 border-l-2 border-amber-500/20">
                            "{asset.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button 
                        onClick={() => handleOpenEditModal(asset)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition active:scale-95 text-xs flex items-center gap-1"
                        title="Edit Asset"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(asset.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 transition active:scale-95 text-xs flex items-center gap-1"
                        title="Delete Asset"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-2 bg-[#1f1d1b] border border-dashed border-gray-800 rounded-2xl p-12 text-center text-gray-500">
                  <Box className="mx-auto text-gray-600 mb-3" size={32} />
                  <p className="text-sm font-semibold">No assets found matching the filter</p>
                  <button 
                    onClick={handleOpenAddModal}
                    className="mt-4 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2 rounded-lg text-xs transition active:scale-95"
                  >
                    Create Asset
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modals - Create / Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#1f1d1b] border border-gray-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
              
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold text-white mb-1">
                {editingAsset ? "Edit Asset" : "Add Asset"}
              </h2>
              <p className="text-amber-500 text-xs mb-6 font-semibold">
                {editingAsset ? "Modify asset record parameters" : "Create new industrial infrastructure entry"}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Asset Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. North Pipeline Segment A"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Type & Condition */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    >
                      {ASSET_TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                      {/* Allow any existing custom type if not present in defaults */}
                      {formType && !ASSET_TYPE_OPTIONS.includes(formType as any) && (
                        <option value={formType}>{formType}</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Condition</label>
                    <select
                      value={formCondition}
                      onChange={(e) => setFormCondition(e.target.value as any)}
                      className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Location Dropdown selection */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Location *</label>
                  {locations.length > 0 ? (
                    <select
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      required
                      className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 leading-relaxed">
                      No locations registered. Please add a location to the Location Registry first.
                    </div>
                  )}
                </div>

                {/* Last Inspected */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Last Inspected</label>
                  <input 
                    type="date"
                    value={formLastInspected}
                    onChange={(e) => setFormLastInspected(e.target.value)}
                    className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Notes</label>
                  <textarea 
                    rows={3}
                    placeholder="Observations, corrosion history, access notes..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-bold py-3 rounded-xl text-sm transition border border-gray-800"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-3 rounded-xl text-sm transition active:scale-95 shadow-lg shadow-amber-500/10"
                  >
                    {editingAsset ? "Save Changes" : "Add Asset"}
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
              <h3 className="text-lg font-bold text-white tracking-tight">Delete Asset?</h3>
              <p className="text-xs text-gray-400">
                Are you sure you want to delete this asset? This action will remove its historical references.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAsset}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {importConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setImportConfirmOpen(false)} />
            <div className="relative w-full max-w-sm bg-[#1a1c23] border border-gray-800 rounded-2xl p-6 shadow-2xl z-10 flex flex-col gap-4 text-gray-300">
              <h3 className="text-lg font-bold text-white tracking-tight">Re-import Standard Templates?</h3>
              <p className="text-xs text-gray-400">
                Would you like to re-import standard template Assets? This will reset your asset list to default template configurations.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setImportConfirmOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmImportAssets}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 text-xs font-bold rounded-lg transition active:scale-95"
                >
                  Confirm Re-import
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
