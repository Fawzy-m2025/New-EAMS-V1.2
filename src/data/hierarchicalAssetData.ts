import type { Zone, Station, Line, System, Equipment, HierarchyTreeNode, BreadcrumbItem } from "@/types/eams";

// Helper function to create breadcrumbs
const createBreadcrumbs = (path: string): BreadcrumbItem[] => {
  const parts = path.split('/');
  const breadcrumbs: BreadcrumbItem[] = [];

  parts.forEach((part, index) => {
    const currentPath = parts.slice(0, index + 1).join('/');
    const level = index === 0 ? 'zone' : index === 1 ? 'station' : index === 2 ? 'line' : 'equipment';
    breadcrumbs.push({
      id: `${level}-${index}`,
      name: part,
      level: level as any,
      path: currentPath
    });
  });

  return breadcrumbs;
};

// Real equipment data from spreadsheet
interface RealEquipmentData {
  sn: number;
  zone: string;
  pumpStation: string;
  pumpNo: string;
  flowRate: number; // Q (L/sec)
  head: number; // H (m)
  pumpBrand: string;
  pumpModel: string;
  pumpSerial: string;
  sealType: string;
  pumpDEBearing: string;
  pumpNDEBearing: string;
  pumpWeight: number;
  motorBrand: string;
  motorModel: string;
  motorProductCode: string;
  motorPower: number; // KW
  motorRPM: number;
  motorSerial: string;
  motorDEBearing: string;
  motorNDEBearing: string;
}

// Valve and strainer data structure
interface ValveStrainerData {
  zone: string;
  pumpStation: string;
  category: string; // suction line, discharge line, main header, etc.
  lineNo: string;
  description: string;
  dn: string; // Diameter nominal
  pn: string; // Pressure nominal
  brand: string;
  model: string;
}

// Water hammer tanks and compressors data structure
interface WaterHammerData {
  pumpStation: string;
  tank: {
    brand: string;
    capacity: number; // m3
    nozzle: number; // mm
    qty: number;
  };
  compressor: {
    brand: string;
    model: string;
    qty: number;
  };
}

// Priming pumps data structure
interface PrimingPumpData {
  zone: string;
  pumpStation: string;
  vendor: string;
  brand: string;
  model: string;
  flowRate: string; // m3/Hr
  vacuum: number; // m.bar
  serialNo: string;
}

// Real valve and strainer data from the spreadsheet
const realValveStrainerData: ValveStrainerData[] = [
  // Station A01 - P1
  { zone: "A", pumpStation: "A01", category: "suction line", lineNo: "P1", description: "s.s strainer", dn: "500/400", pn: "16", brand: "AMA", model: "AMA" },
  { zone: "A", pumpStation: "A01", category: "suction line", lineNo: "P1", description: "DCI dismantling joint", dn: "400", pn: "16", brand: "TVN", model: "V251" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P1", description: "DCI gate valve (non rising type)", dn: "100", pn: "16", brand: "McWANE", model: "314" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P1", description: "pneumatic butterfly valve (wafer type)", dn: "100", pn: "16", brand: "AOM/Proval", model: "AOM/Proval" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P1", description: "air valve (air release/air vacuum)", dn: "100", pn: "16", brand: "CSA", model: "LYNX 3F-RFP" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P1", description: "DCI tilting check valve with counter weight and hydraulic damper", dn: "300", pn: "16", brand: "TVN", model: "V203" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P1", description: "DCI dismantling joint", dn: "300", pn: "16", brand: "McWANE", model: "7SV" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P1", description: "DCI electrical double flanged butterfly valve suitable for actuator installation", dn: "300", pn: "16", brand: "TVN", model: "V106" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P1", description: "electrical actuator modulating type", dn: "", pn: "", brand: "BERNARD", model: "AT6L" },

  // Station A01 - P2
  { zone: "A", pumpStation: "A01", category: "suction line", lineNo: "P2", description: "s.s strainer", dn: "500/400", pn: "16", brand: "AMA", model: "AMA" },
  { zone: "A", pumpStation: "A01", category: "suction line", lineNo: "P2", description: "DCI dismantling joint", dn: "400", pn: "16", brand: "McWANE", model: "7SV" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P2", description: "DCI gate valve (non rising type)", dn: "100", pn: "16", brand: "McWANE", model: "314" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P2", description: "pneumatic butterfly valve (wafer type)", dn: "100", pn: "16", brand: "AOM/Proval", model: "AOM/Proval" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P2", description: "air valve (air release/air vacuum)", dn: "100", pn: "16", brand: "CSA", model: "LYNX 3F-RFP" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P2", description: "DCI tilting check valve with counter weight and hydraulic damper", dn: "300", pn: "16", brand: "TVN", model: "V203" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P2", description: "DCI dismantling joint", dn: "300", pn: "16", brand: "McWANE", model: "7SV" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P2", description: "DCI electrical double flanged butterfly valve suitable for actuator installation", dn: "300", pn: "16", brand: "TVN", model: "V106" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P2", description: "electrical actuator modulating type", dn: "", pn: "", brand: "BERNARD", model: "AT6L" },

  // Station A01 - P3
  { zone: "A", pumpStation: "A01", category: "suction line", lineNo: "P3", description: "s.s strainer", dn: "500/400", pn: "16", brand: "AMA", model: "AMA" },
  { zone: "A", pumpStation: "A01", category: "suction line", lineNo: "P3", description: "DCI dismantling joint", dn: "400", pn: "16", brand: "TVN", model: "V251" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P3", description: "DCI gate valve (non rising type)", dn: "100", pn: "16", brand: "McWANE", model: "314" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P3", description: "pneumatic butterfly valve (wafer type)", dn: "100", pn: "16", brand: "AOM/Proval", model: "AOM/Proval" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P3", description: "air valve (air release/air vacuum)", dn: "100", pn: "16", brand: "CSA", model: "LYNX 3F-RFP" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P3", description: "DCI tilting check valve with counter weight and hydraulic damper", dn: "300", pn: "16", brand: "TVN", model: "V203" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P3", description: "DCI dismantling joint", dn: "300", pn: "16", brand: "McWANE", model: "7SV" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P3", description: "DCI electrical double flanged butterfly valve suitable for actuator installation", dn: "300", pn: "16", brand: "TVN", model: "V106" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P3", description: "electrical actuator modulating type", dn: "", pn: "", brand: "BERNARD", model: "AT6L" },

  // Station A01 - P4
  { zone: "A", pumpStation: "A01", category: "suction line", lineNo: "P4", description: "s.s strainer", dn: "500/400", pn: "16", brand: "AMA", model: "AMA" },
  { zone: "A", pumpStation: "A01", category: "suction line", lineNo: "P4", description: "DCI dismantling joint", dn: "400", pn: "16", brand: "TVN", model: "V251" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P4", description: "DCI gate valve (non rising type)", dn: "100", pn: "16", brand: "McWANE", model: "314" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P4", description: "pneumatic butterfly valve (wafer type)", dn: "100", pn: "16", brand: "AOM/Proval", model: "AOM/Proval" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P4", description: "air valve (air release/air vacuum)", dn: "100", pn: "16", brand: "CSA", model: "LYNX 3F-RFP" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P4", description: "DCI tilting check valve with counter weight and hydraulic damper", dn: "300", pn: "16", brand: "TVN", model: "V203" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P4", description: "DCI dismantling joint", dn: "300", pn: "16", brand: "McWANE", model: "7SV" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P4", description: "DCI electrical double flanged butterfly valve suitable for actuator installation", dn: "300", pn: "16", brand: "TVN", model: "V106" },
  { zone: "A", pumpStation: "A01", category: "discharge line", lineNo: "P4", description: "electrical actuator modulating type", dn: "", pn: "", brand: "BERNARD", model: "AT6L" },

  // Station A01 - Main Header
  { zone: "A", pumpStation: "A01", category: "main header", lineNo: "", description: "DCI dismantling joint", dn: "700", pn: "16", brand: "TVN", model: "V251" },
  { zone: "A", pumpStation: "A01", category: "main header", lineNo: "", description: "DCI dismantling joint", dn: "700", pn: "16", brand: "TVN", model: "V251" },
  { zone: "A", pumpStation: "A01", category: "main header", lineNo: "", description: "electromagnetic flow meter", dn: "700", pn: "16", brand: "ABB Procees Master 630", model: "FEB632" },
  { zone: "A", pumpStation: "A01", category: "main header", lineNo: "", description: "DCI gate valve (non rising type)", dn: "150", pn: "16", brand: "McWANE", model: "314" },
  { zone: "A", pumpStation: "A01", category: "main header", lineNo: "", description: "air valve (air release/air vacuum)", dn: "150", pn: "16", brand: "CSA", model: "LYNX 3F-RFP" },
  { zone: "A", pumpStation: "A01", category: "main header", lineNo: "", description: "DCI tilting check valve with counter weight and hydraulic damper", dn: "700", pn: "16", brand: "TVN", model: "V203" },
  { zone: "A", pumpStation: "A01", category: "main header", lineNo: "", description: "DCI dismantling joint", dn: "700", pn: "16", brand: "TVN", model: "V251" },
  { zone: "A", pumpStation: "A01", category: "main header", lineNo: "", description: "DCI dismantling joint", dn: "700", pn: "16", brand: "TVN", model: "V251" },
  { zone: "A", pumpStation: "A01", category: "main header", lineNo: "", description: "DCI manual double flanged butterfly valve", dn: "700", pn: "16", brand: "TVN", model: "V106" },

  // Station A01 - Water Hammer Connection
  { zone: "A", pumpStation: "A01", category: "water hammer connection", lineNo: "", description: "DCI manual double flanged butterfly valve", dn: "400", pn: "16", brand: "McWANE", model: "KENNEDY SERIES 614" },
  { zone: "A", pumpStation: "A01", category: "water hammer connection", lineNo: "", description: "DCI dismantling joint", dn: "400", pn: "16", brand: "TVN", model: "V251" },
  { zone: "A", pumpStation: "A01", category: "water hammer connection", lineNo: "", description: "DCI manual double flanged butterfly valve", dn: "400", pn: "16", brand: "McWANE", model: "KENNEDY SERIES 614" },
  { zone: "A", pumpStation: "A01", category: "water hammer connection", lineNo: "", description: "DCI dismantling joint", dn: "400", pn: "16", brand: "TVN", model: "V251" },

  // Station A01 - Main Drain
  { zone: "A", pumpStation: "A01", category: "main drain", lineNo: "", description: "DCI gate valve (non rising type)", dn: "200", pn: "16", brand: "McWANE", model: "314" },
  { zone: "A", pumpStation: "A01", category: "main drain", lineNo: "", description: "DCI dismantling joint", dn: "200", pn: "16", brand: "McWANE", model: "7SV" },

  // Station A02 - P1 (Sample data for demonstration)
  { zone: "A", pumpStation: "A02", category: "suction line", lineNo: "P1", description: "s.s strainer", dn: "400/300", pn: "16", brand: "AMA", model: "AMA" },
  { zone: "A", pumpStation: "A02", category: "suction line", lineNo: "P1", description: "DCI dismantling joint", dn: "300", pn: "16", brand: "McWANE", model: "7SV" },
  { zone: "A", pumpStation: "A02", category: "discharge line", lineNo: "P1", description: "DCI gate valve (non rising type)", dn: "100", pn: "16", brand: "McWANE", model: "314" },
  { zone: "A", pumpStation: "A02", category: "discharge line", lineNo: "P1", description: "pneumatic butterfly valve (wafer type)", dn: "100", pn: "16", brand: "AOM/Proval", model: "AOM/Proval" },
  { zone: "A", pumpStation: "A02", category: "discharge line", lineNo: "P1", description: "DCI tilting check valve with counter weight and hydraulic damper", dn: "300", pn: "16", brand: "TVN", model: "V203" },

  // Station A06 - P1 (Sample data for demonstration)
  { zone: "A", pumpStation: "A06", category: "suction line", lineNo: "P1", description: "s.s strainer", dn: "600/500", pn: "16", brand: "AMA", model: "AMA" },
  { zone: "A", pumpStation: "A06", category: "suction line", lineNo: "P1", description: "DCI dismantling joint", dn: "500", pn: "16", brand: "TVN", model: "V251" },
  { zone: "A", pumpStation: "A06", category: "discharge line", lineNo: "P1", description: "DCI gate valve (non rising type)", dn: "100", pn: "16", brand: "TECFLOW", model: "TF-RSGV-F" },
  { zone: "A", pumpStation: "A06", category: "discharge line", lineNo: "P1", description: "pneumatic butterfly valve (wafer type)", dn: "100", pn: "16", brand: "AOM/Proval", model: "AOM/Proval" },
  { zone: "A", pumpStation: "A06", category: "discharge line", lineNo: "P1", description: "DCI tilting check valve with counter weight and hydraulic damper", dn: "400", pn: "16", brand: "TVN", model: "V203" }
];

// Real water hammer tanks and compressors data from the spreadsheet
const realWaterHammerData: WaterHammerData[] = [
  { pumpStation: "A01", tank: { brand: "HC", capacity: 35, nozzle: 400, qty: 2 }, compressor: { brand: "El Haggar Misr", model: "HGF 500/580", qty: 3 } },
  { pumpStation: "A02", tank: { brand: "EEC", capacity: 45, nozzle: 400, qty: 1 }, compressor: { brand: "El Haggar Misr", model: "HGF 500/580", qty: 2 } },
  { pumpStation: "A04", tank: { brand: "HC", capacity: 14, nozzle: 250, qty: 1 }, compressor: { brand: "El Haggar Misr", model: "HAC 300/380", qty: 2 } },
  { pumpStation: "A06", tank: { brand: "EEC", capacity: 48, nozzle: 600, qty: 2 }, compressor: { brand: "El Haggar Misr", model: "HGF 500/580", qty: 3 } },
  { pumpStation: "A07", tank: { brand: "HC", capacity: 35, nozzle: 400, qty: 1 }, compressor: { brand: "El Haggar Misr", model: "HGF 500/580", qty: 2 } },
  { pumpStation: "A08", tank: { brand: "HC", capacity: 35, nozzle: 400, qty: 1 }, compressor: { brand: "El Haggar Misr", model: "HGF 500/580", qty: 2 } },
  { pumpStation: "A09", tank: { brand: "EEC", capacity: 48, nozzle: 400, qty: 1 }, compressor: { brand: "El Haggar Misr", model: "HGF 500/580", qty: 2 } },
  { pumpStation: "A10", tank: { brand: "EEC", capacity: 42, nozzle: 400, qty: 1 }, compressor: { brand: "El Haggar Misr", model: "HGF 500/580", qty: 2 } },
  { pumpStation: "A11", tank: { brand: "HC", capacity: 30, nozzle: 400, qty: 1 }, compressor: { brand: "El Haggar Misr", model: "HGF 500/580", qty: 2 } },
  { pumpStation: "A12", tank: { brand: "EEC", capacity: 38, nozzle: 400, qty: 2 }, compressor: { brand: "El Haggar Misr", model: "HGF 500/580", qty: 3 } },
  { pumpStation: "A13", tank: { brand: "HC", capacity: 30, nozzle: 400, qty: 1 }, compressor: { brand: "El Haggar Misr", model: "HGF 500/580", qty: 2 } },
  { pumpStation: "A14", tank: { brand: "HC", capacity: 30, nozzle: 400, qty: 2 }, compressor: { brand: "El Haggar Misr", model: "HGF 500/580", qty: 3 } },
  { pumpStation: "A15", tank: { brand: "HC", capacity: 30, nozzle: 400, qty: 1 }, compressor: { brand: "El Haggar Misr", model: "HGF 500/580", qty: 2 } }
];

// Real priming pumps data from the spreadsheet
const realPrimingPumpData: PrimingPumpData[] = [
  { zone: "A", pumpStation: "A01", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS14/M", flowRate: "58-109", vacuum: 33, serialNo: "2008705" },
  { zone: "A", pumpStation: "A01", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS14/M", flowRate: "58-109", vacuum: 33, serialNo: "2008717" },
  { zone: "A", pumpStation: "A02", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2001360" },
  { zone: "A", pumpStation: "A02", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2011736" },
  { zone: "A", pumpStation: "A04", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2001364" },
  { zone: "A", pumpStation: "A04", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2011737" },
  { zone: "A", pumpStation: "A06", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS16/M", flowRate: "94-184", vacuum: 33, serialNo: "2000492" },
  { zone: "A", pumpStation: "A06", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS16/M", flowRate: "94-184", vacuum: 33, serialNo: "2011784" },
  { zone: "A", pumpStation: "A07", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2007355" },
  { zone: "A", pumpStation: "A07", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2011736" },
  { zone: "A", pumpStation: "A08", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS14/M", flowRate: "58-109", vacuum: 33, serialNo: "2008711" },
  { zone: "A", pumpStation: "A08", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS14/M", flowRate: "58-109", vacuum: 33, serialNo: "2009811" },
  { zone: "A", pumpStation: "A09", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2001361" },
  { zone: "A", pumpStation: "A09", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2011740" },
  { zone: "A", pumpStation: "A10", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2001362" },
  { zone: "A", pumpStation: "A10", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2009085" },
  { zone: "A", pumpStation: "A11", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2007356" },
  { zone: "A", pumpStation: "A11", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2011741" },
  { zone: "A", pumpStation: "A12", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS14/M", flowRate: "58-109", vacuum: 33, serialNo: "2008708" },
  { zone: "A", pumpStation: "A12", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS14/M", flowRate: "58-109", vacuum: 33, serialNo: "2008709" },
  { zone: "A", pumpStation: "A13", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2009084" },
  { zone: "A", pumpStation: "A13", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2011739" },
  { zone: "A", pumpStation: "A14", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2007357" },
  { zone: "A", pumpStation: "A14", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS7/M", flowRate: "40-77", vacuum: 33, serialNo: "2011738" },
  { zone: "A", pumpStation: "A15", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS16/M", flowRate: "94-184", vacuum: 33, serialNo: "2000491" },
  { zone: "A", pumpStation: "A15", vendor: "Helio Power", brand: "ROBUSCHI/Italy", model: "RVS16/M", flowRate: "94-184", vacuum: 33, serialNo: "2011782" }
];

// Real equipment data from the spreadsheet
const realEquipmentData: RealEquipmentData[] = [
  { sn: 1, zone: "A", pumpStation: "A01", pumpNo: "P1", flowRate: 172, head: 80, pumpBrand: "HMS", pumpModel: "D200-500A-GGG(485)", pumpSerial: "9û6", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.750, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900079", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 2, zone: "A", pumpStation: "A01", pumpNo: "P2", flowRate: 172, head: 80, pumpBrand: "HMS", pumpModel: "D200-500A-GGG(485)", pumpSerial: "9û14", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.750, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900065", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 3, zone: "A", pumpStation: "A01", pumpNo: "P3", flowRate: 172, head: 80, pumpBrand: "HMS", pumpModel: "D200-500A-GGG(485)", pumpSerial: "9û3", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.750, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900075", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 4, zone: "A", pumpStation: "A01", pumpNo: "P4", flowRate: 172, head: 80, pumpBrand: "HMS", pumpModel: "D200-500A-GGG(485)", pumpSerial: "9û11", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.750, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900068", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 5, zone: "A", pumpStation: "A02", pumpNo: "P1", flowRate: 110, head: 80, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(500)", pumpSerial: "10û2", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А315M4FБT2", motorProductCode: "", motorPower: 200, motorRPM: 1485, motorSerial: "200802631", motorDEBearing: "6319/C3", motorNDEBearing: "6316/C3" },
  { sn: 6, zone: "A", pumpStation: "A02", pumpNo: "P2", flowRate: 110, head: 80, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(500)", pumpSerial: "10û9", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А315M4FБT2", motorProductCode: "", motorPower: 200, motorRPM: 1485, motorSerial: "200802632", motorDEBearing: "6319/C3", motorNDEBearing: "6316/C3" },
  { sn: 7, zone: "A", pumpStation: "A02", pumpNo: "P3", flowRate: 110, head: 80, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(500)", pumpSerial: "10û4", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А315M4FБT2", motorProductCode: "", motorPower: 200, motorRPM: 1485, motorSerial: "200802642", motorDEBearing: "6319/C3", motorNDEBearing: "6316/C3" },
  { sn: 8, zone: "A", pumpStation: "A02", pumpNo: "P4", flowRate: 110, head: 80, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(500)", pumpSerial: "10û1", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А315M4FБT2", motorProductCode: "", motorPower: 200, motorRPM: 1485, motorSerial: "200802640", motorDEBearing: "6319/C3", motorNDEBearing: "6316/C3" },
  { sn: 9, zone: "A", pumpStation: "A04", pumpNo: "P1", flowRate: 80, head: 80, pumpBrand: "HMS", pumpModel: "D125-480А-GGG(495)", pumpSerial: "9û6", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU309", pumpNDEBearing: "6309", pumpWeight: 0.475, motorBrand: "ELDIN", motorModel: "А315S4FБT2", motorProductCode: "", motorPower: 160, motorRPM: 1484, motorSerial: "200802627", motorDEBearing: "6319/C3", motorNDEBearing: "6316/C3" },
  { sn: 10, zone: "A", pumpStation: "A04", pumpNo: "P2", flowRate: 80, head: 80, pumpBrand: "HMS", pumpModel: "D125-480А-GGG(495)", pumpSerial: "9û5", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU309", pumpNDEBearing: "6309", pumpWeight: 0.475, motorBrand: "ELDIN", motorModel: "А315S4FБT2", motorProductCode: "", motorPower: 160, motorRPM: 1484, motorSerial: "200802626", motorDEBearing: "6319/C3", motorNDEBearing: "6316/C3" },
  { sn: 11, zone: "A", pumpStation: "A06", pumpNo: "P1", flowRate: 265, head: 90, pumpBrand: "SAER", pumpModel: "SKD-4P-250-560-Ø525", pumpSerial: "3921929", sealType: "soft packing thickness 16mm", pumpDEBearing: "6315 C3", pumpNDEBearing: "6315 C3", pumpWeight: 1.095, motorBrand: "ABB", motorModel: "M3BP355MLB4", motorProductCode: "3GBP352420-ADG", motorPower: 400, motorRPM: 1492, motorSerial: "3G1F2033701810", motorDEBearing: "6322/C3", motorNDEBearing: "6316/C3" },
  { sn: 12, zone: "A", pumpStation: "A06", pumpNo: "P2", flowRate: 265, head: 90, pumpBrand: "SAER", pumpModel: "SKD-4P-250-560-Ø525", pumpSerial: "3921926", sealType: "soft packing thickness 16mm", pumpDEBearing: "6315 C3", pumpNDEBearing: "6315 C3", pumpWeight: 1.095, motorBrand: "ABB", motorModel: "M3BP355MLB4", motorProductCode: "3GBP352420-ADG", motorPower: 400, motorRPM: 1492, motorSerial: "3G1F2033701687", motorDEBearing: "6322/C3", motorNDEBearing: "6316/C3" },
  { sn: 13, zone: "A", pumpStation: "A06", pumpNo: "P3", flowRate: 265, head: 90, pumpBrand: "SAER", pumpModel: "SKD-4P-250-560-Ø525", pumpSerial: "3921927", sealType: "soft packing thickness 16mm", pumpDEBearing: "6315 C3", pumpNDEBearing: "6315 C3", pumpWeight: 1.095, motorBrand: "ABB", motorModel: "M3BP355MLB4", motorProductCode: "3GBP352420-ADG", motorPower: 400, motorRPM: 1492, motorSerial: "3G1F2033701610", motorDEBearing: "6322/C3", motorNDEBearing: "6316/C3" },
  { sn: 14, zone: "A", pumpStation: "A06", pumpNo: "P4", flowRate: 265, head: 90, pumpBrand: "SAER", pumpModel: "SKD-4P-250-560-Ø525", pumpSerial: "3921928", sealType: "soft packing thickness 16mm", pumpDEBearing: "6315 C3", pumpNDEBearing: "6315 C3", pumpWeight: 1.095, motorBrand: "ABB", motorModel: "M3BP355MLB4", motorProductCode: "3GBP352420-ADG", motorPower: 400, motorRPM: 1492, motorSerial: "3G1F2033701812", motorDEBearing: "6322/C3", motorNDEBearing: "6316/C3" },
  { sn: 15, zone: "A", pumpStation: "A06", pumpNo: "P5", flowRate: 265, head: 90, pumpBrand: "SAER", pumpModel: "SKD-4P-250-560-Ø525", pumpSerial: "3921925", sealType: "soft packing thickness 16mm", pumpDEBearing: "6315 C3", pumpNDEBearing: "6315 C3", pumpWeight: 1.095, motorBrand: "ABB", motorModel: "M3BP355MLB4", motorProductCode: "3GBP352420-ADG", motorPower: 400, motorRPM: 1492, motorSerial: "3G1F2033701688", motorDEBearing: "6322/C3", motorNDEBearing: "6316/C3" },
  { sn: 16, zone: "A", pumpStation: "A07", pumpNo: "P1", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û15", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "20090084", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 17, zone: "A", pumpStation: "A07", pumpNo: "P2", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û14", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "20090096", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 18, zone: "A", pumpStation: "A07", pumpNo: "P3", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û13", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "20090069", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 19, zone: "A", pumpStation: "A07", pumpNo: "P4", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "11û2", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "201000022", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 20, zone: "A", pumpStation: "A07", pumpNo: "P5", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "11û8", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "201000038", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 21, zone: "A", pumpStation: "A08", pumpNo: "P1", flowRate: 172, head: 80, pumpBrand: "HMS", pumpModel: "D200-500A-GGG(485)", pumpSerial: "9û12", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.750, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900082", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 22, zone: "A", pumpStation: "A08", pumpNo: "P2", flowRate: 172, head: 80, pumpBrand: "HMS", pumpModel: "D200-500A-GGG(485)", pumpSerial: "9û4", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.750, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900080", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 23, zone: "A", pumpStation: "A08", pumpNo: "P3", flowRate: 172, head: 80, pumpBrand: "HMS", pumpModel: "D200-500A-GGG(485)", pumpSerial: "9û15", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.750, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900067", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 24, zone: "A", pumpStation: "A08", pumpNo: "P4", flowRate: 172, head: 80, pumpBrand: "HMS", pumpModel: "D200-500A-GGG(485)", pumpSerial: "9û1", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.750, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900077", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 25, zone: "A", pumpStation: "A09", pumpNo: "P1", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û27", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "201000039", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 26, zone: "A", pumpStation: "A09", pumpNo: "P2", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û21", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900078", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 27, zone: "A", pumpStation: "A09", pumpNo: "P3", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û20", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200802649", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 28, zone: "A", pumpStation: "A09", pumpNo: "P4", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û30", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "201000021", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 29, zone: "A", pumpStation: "A09", pumpNo: "P5", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "11û5", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200802651", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 30, zone: "A", pumpStation: "A10", pumpNo: "P1", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û23", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "201000041", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 31, zone: "A", pumpStation: "A10", pumpNo: "P2", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û19", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "201000030", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 32, zone: "A", pumpStation: "A10", pumpNo: "P3", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û24", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "201000020", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 33, zone: "A", pumpStation: "A10", pumpNo: "P4", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "11û9", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900074", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 34, zone: "A", pumpStation: "A10", pumpNo: "P5", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "11û10", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900086", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 35, zone: "A", pumpStation: "A11", pumpNo: "P1", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û18", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900081", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 36, zone: "A", pumpStation: "A11", pumpNo: "P2", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û16", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900083", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 37, zone: "A", pumpStation: "A11", pumpNo: "P3", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û22", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "201000037", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 38, zone: "A", pumpStation: "A11", pumpNo: "P4", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "11û1", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900094", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 39, zone: "A", pumpStation: "A11", pumpNo: "P5", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "11û7", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900073", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 40, zone: "A", pumpStation: "A12", pumpNo: "P1", flowRate: 150, head: 90, pumpBrand: "SAER", pumpModel: "SKD-4P-200-630-Ø510", pumpSerial: "3920848", sealType: "soft packing thickness 16mm", pumpDEBearing: "6315 C3", pumpNDEBearing: "6315 C3", pumpWeight: 1.050, motorBrand: "ABB", motorModel: "M2BAX355SMB4", motorProductCode: "3GBA352220-ADM", motorPower: 315, motorRPM: 1491, motorSerial: "3G1P203401763", motorDEBearing: "6222/C3", motorNDEBearing: "6219/C3" },
  { sn: 41, zone: "A", pumpStation: "A12", pumpNo: "P2", flowRate: 150, head: 90, pumpBrand: "SAER", pumpModel: "SKD-4P-200-630-Ø510", pumpSerial: "3920855", sealType: "soft packing thickness 16mm", pumpDEBearing: "6315 C3", pumpNDEBearing: "6315 C3", pumpWeight: 1.050, motorBrand: "ABB", motorModel: "M2BAX355SMB4", motorProductCode: "3GBA352220-ADM", motorPower: 315, motorRPM: 1491, motorSerial: "3G1P203401760", motorDEBearing: "6222/C3", motorNDEBearing: "6219/C3" },
  { sn: 42, zone: "A", pumpStation: "A12", pumpNo: "P3", flowRate: 150, head: 90, pumpBrand: "SAER", pumpModel: "SKD-4P-200-630-Ø510", pumpSerial: "3920861", sealType: "soft packing thickness 16mm", pumpDEBearing: "6315 C3", pumpNDEBearing: "6315 C3", pumpWeight: 1.050, motorBrand: "ABB", motorModel: "M2BAX355SMB4", motorProductCode: "3GBA352220-ADM", motorPower: 315, motorRPM: 1491, motorSerial: "3G1P203401764", motorDEBearing: "6222/C3", motorNDEBearing: "6219/C3" },
  { sn: 43, zone: "A", pumpStation: "A12", pumpNo: "P4", flowRate: 150, head: 90, pumpBrand: "SAER", pumpModel: "SKD-4P-200-630-Ø510", pumpSerial: "3920859", sealType: "soft packing thickness 16mm", pumpDEBearing: "6315 C3", pumpNDEBearing: "6315 C3", pumpWeight: 1.050, motorBrand: "ABB", motorModel: "M2BAX355SMB4", motorProductCode: "3GBA352220-ADM", motorPower: 315, motorRPM: 1491, motorSerial: "3G1P203401767", motorDEBearing: "6222/C3", motorNDEBearing: "6219/C3" },
  { sn: 44, zone: "A", pumpStation: "A12", pumpNo: "P5", flowRate: 150, head: 90, pumpBrand: "SAER", pumpModel: "SKD-4P-200-630-Ø510", pumpSerial: "3920857", sealType: "soft packing thickness 16mm", pumpDEBearing: "6315 C3", pumpNDEBearing: "6315 C3", pumpWeight: 1.050, motorBrand: "ABB", motorModel: "M2BAX355SMB4", motorProductCode: "3GBA352220-ADM", motorPower: 315, motorRPM: 1491, motorSerial: "3G1P203401769", motorDEBearing: "6222/C3", motorNDEBearing: "6219/C3" },
  { sn: 45, zone: "A", pumpStation: "A13", pumpNo: "P1", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û17", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "200900090", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 46, zone: "A", pumpStation: "A13", pumpNo: "P2", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û26", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "201000031", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 47, zone: "A", pumpStation: "A13", pumpNo: "P3", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û25", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "201000024", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" },
  { sn: 48, zone: "A", pumpStation: "A13", pumpNo: "P4", flowRate: 110, head: 90, pumpBrand: "HMS", pumpModel: "D150-560A-GGG(530)", pumpSerial: "10û31", sealType: "soft packing thickness 13mm", pumpDEBearing: "NU311", pumpNDEBearing: "6311", pumpWeight: 0.735, motorBrand: "ELDIN", motorModel: "А355SMA4FБT2", motorProductCode: "", motorPower: 250, motorRPM: 1487, motorSerial: "201000019", motorDEBearing: "6322/C3", motorNDEBearing: "6319/C3" }
];

// Helper function to generate Equipment objects from real data
const createEquipmentFromRealData = (data: RealEquipmentData): Equipment[] => {
  const stationPath = `Zone ${data.zone}/Pump Station ${data.pumpStation}`;
  const pumpPath = `${stationPath}/${data.pumpNo}`;
  const motorPath = `${stationPath}/${data.pumpNo} Motor`;

  // Generate realistic vibration data based on equipment type and age
  const generateVibrationData = (equipmentType: 'pump' | 'motor', power: number) => {
    const baseRMS = equipmentType === 'pump' ? 2.0 : 1.8;
    const powerFactor = Math.sqrt(power / 250); // Normalize to 250kW
    const randomVariation = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2

    return {
      rmsVelocity: baseRMS * powerFactor * randomVariation,
      peakVelocity: baseRMS * powerFactor * randomVariation * 1.8,
      displacement: 0.02 * powerFactor * randomVariation,
      frequency: [30, 60, 90, 120],
      spectrum: [baseRMS * powerFactor, baseRMS * powerFactor * 0.7, baseRMS * powerFactor * 0.5, baseRMS * powerFactor * 0.3],
      iso10816Zone: baseRMS * powerFactor < 2.3 ? "A" : baseRMS * powerFactor < 4.5 ? "B" : "C",
      measurementDate: "2024-12-15",
      measuredBy: "Technician Ahmed"
    };
  };

  const pump: Equipment = {
    id: `EQ-${data.pumpStation}-${data.pumpNo}`,
    name: `${data.pumpNo}`,
    level: "equipment",
    parentId: `STATION-${data.pumpStation}`,
    zoneId: `ZONE-${data.zone}`,
    stationId: `STATION-${data.pumpStation}`,
    lineId: `LINE-${data.pumpStation}-${data.pumpNo}`,
    path: pumpPath,
    breadcrumbs: createBreadcrumbs(pumpPath),
    type: "mechanical",
    category: "pump",
    manufacturer: data.pumpBrand,
    model: data.pumpModel,
    serialNumber: data.pumpSerial,
    assetTag: `${data.pumpNo}-${data.pumpStation}`,
    location: {
      zone: `Zone ${data.zone}`,
      station: `Pump Station ${data.pumpStation}`,
      line: data.pumpNo,
      building: "Pump House",
      floor: "Ground Floor",
      room: `Pump Room ${data.pumpNo}`
    },
    specifications: {
      flowRate: data.flowRate,
      pressure: data.head,
      ratedPower: data.motorPower, // Use motor power for pump power rating
      efficiency: 85,
      weight: data.pumpWeight * 1000 // Convert tons to kg
    },
    status: "operational",
    condition: "good",
    installationDate: "2020-01-15",
    operatingHours: 35040, // 4 years × 8760 hours
    notes: `Seal: ${data.sealType}, DE Bearing: ${data.pumpDEBearing}, NDE Bearing: ${data.pumpNDEBearing}`,
    conditionMonitoring: {
      vibration: generateVibrationData('pump', data.motorPower),
      lastUpdated: "2024-12-15",
      overallCondition: "good",
      alerts: []
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2020-01-15T00:00:00Z",
    updatedAt: "2024-12-15T00:00:00Z"
  };

  const motor: Equipment = {
    id: `EQ-${data.pumpStation}-${data.pumpNo}-M`,
    name: `${data.pumpNo} Motor`,
    level: "equipment",
    parentId: `STATION-${data.pumpStation}`,
    zoneId: `ZONE-${data.zone}`,
    stationId: `STATION-${data.pumpStation}`,
    lineId: `LINE-${data.pumpStation}-${data.pumpNo}`,
    path: motorPath,
    breadcrumbs: createBreadcrumbs(motorPath),
    type: "electrical",
    category: "motor",
    manufacturer: data.motorBrand,
    model: data.motorModel,
    serialNumber: data.motorSerial,
    assetTag: `${data.pumpNo}M-${data.pumpStation}`,
    location: {
      zone: `Zone ${data.zone}`,
      station: `Pump Station ${data.pumpStation}`,
      line: data.pumpNo,
      building: "Motor House",
      floor: "Ground Floor",
      room: `Motor Room ${data.pumpNo}`
    },
    specifications: {
      ratedPower: data.motorPower,
      ratedVoltage: 415,
      speed: data.motorRPM,
      efficiency: 92
    },
    status: "operational",
    condition: "excellent",
    installationDate: "2020-01-15",
    operatingHours: 35040,
    notes: `Product Code: ${data.motorProductCode}, DE Bearing: ${data.motorDEBearing}, NDE Bearing: ${data.motorNDEBearing}`,
    conditionMonitoring: {
      vibration: generateVibrationData('motor', data.motorPower),
      thermography: {
        maxTemperature: 65 + Math.random() * 10,
        avgTemperature: 60 + Math.random() * 5,
        hotSpots: [],
        baseline: 60,
        deltaT: 8,
        measurementDate: "2024-12-15"
      },
      lastUpdated: "2024-12-15",
      overallCondition: "excellent",
      alerts: []
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2020-01-15T00:00:00Z",
    updatedAt: "2024-12-15T00:00:00Z"
  };

  return [pump, motor];
};

// Helper function to create valve/strainer equipment from real data
const createValveStrainerEquipmentFromRealData = (data: ValveStrainerData, sequenceNumber: number): Equipment => {
  const stationPath = `Zone ${data.zone}/Pump Station ${data.pumpStation}`;
  const linePath = data.lineNo ? `${stationPath}/${data.lineNo}` : stationPath;
  const equipmentPath = `${linePath}/${data.description}`;

  // Determine equipment category based on description
  let category: string = 'valve';
  let type: string = 'mechanical';

  if (data.description.toLowerCase().includes('strainer')) {
    category = 'strainer';
  } else if (data.description.toLowerCase().includes('flow meter')) {
    category = 'sensor';
    type = 'instrumentation';
  } else if (data.description.toLowerCase().includes('actuator')) {
    category = 'actuator';
    type = 'electrical';
  } else if (data.description.toLowerCase().includes('valve')) {
    category = 'valve';
  }

  // Generate asset tag
  const categoryCode = category.charAt(0).toUpperCase();
  const stationCode = data.pumpStation;
  const lineCode = data.lineNo || 'SYS';
  const assetTag = `${categoryCode}-${stationCode}-${lineCode}-${sequenceNumber.toString().padStart(3, '0')}`;

  // Generate serial number
  const serialNumber = `${data.brand.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}-${sequenceNumber}`;

  const equipment: Equipment = {
    id: `EQ-${data.pumpStation}-${data.lineNo || 'SYS'}-${categoryCode}-${sequenceNumber}`,
    name: data.description,
    level: "equipment",
    parentId: data.lineNo ? `LINE-${data.pumpStation}-${data.lineNo}` : `STATION-${data.pumpStation}`,
    zoneId: `ZONE-${data.zone}`,
    stationId: `STATION-${data.pumpStation}`,
    lineId: data.lineNo ? `LINE-${data.pumpStation}-${data.lineNo}` : undefined,
    path: equipmentPath,
    breadcrumbs: createBreadcrumbs(equipmentPath),
    type: type as any,
    category: category as any,
    manufacturer: data.brand,
    model: data.model,
    serialNumber: serialNumber,
    assetTag: assetTag,
    location: {
      zone: `Zone ${data.zone}`,
      station: `Pump Station ${data.pumpStation}`,
      line: data.lineNo || undefined,
      system: data.category,
      building: "Valve House",
      floor: "Ground Floor",
      room: `${data.category} Room`
    },
    specifications: {
      diameter: data.dn,
      pressure: data.pn ? parseInt(data.pn) : undefined,
      material: data.description.includes('s.s') ? 'Stainless Steel' : 'Cast Iron',
      connectionType: data.description.includes('flanged') ? 'Flanged' : 'Threaded'
    },
    status: "operational",
    condition: "good",
    installationDate: "2020-01-15",
    operatingHours: 35040,
    notes: `${data.category} - DN: ${data.dn}, PN: ${data.pn}`,
    conditionMonitoring: {
      lastUpdated: "2024-12-15",
      overallCondition: "good",
      alerts: []
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2020-01-15T00:00:00Z",
    updatedAt: "2024-12-15T00:00:00Z"
  };

  return equipment;
};

// Helper function to create water hammer system equipment from real data
const createWaterHammerEquipmentFromRealData = (data: WaterHammerData): Equipment[] => {
  const stationPath = `Zone A/Pump Station ${data.pumpStation}`;
  const systemPath = `${stationPath}/Water Hammer System`;
  const equipment: Equipment[] = [];

  // Create tanks
  for (let i = 1; i <= data.tank.qty; i++) {
    const tankEquipment: Equipment = {
      id: `EQ-${data.pumpStation}-WH-TANK-${i}`,
      name: `Water Hammer Tank ${i}`,
      level: "equipment",
      parentId: `SYSTEM-${data.pumpStation}-WH`,
      zoneId: `ZONE-A`,
      stationId: `STATION-${data.pumpStation}`,
      systemId: `SYSTEM-${data.pumpStation}-WH`,
      path: `${systemPath}/Tank ${i}`,
      breadcrumbs: createBreadcrumbs(`${systemPath}/Tank ${i}`),
      type: "mechanical",
      category: "tank",
      manufacturer: data.tank.brand,
      model: `${data.tank.capacity}m³ Tank`,
      serialNumber: `${data.tank.brand}-${Date.now().toString().slice(-6)}-T${i}`,
      assetTag: `T-${data.pumpStation}-WH-${i.toString().padStart(3, '0')}`,
      location: {
        zone: "Zone A",
        station: `Pump Station ${data.pumpStation}`,
        system: "Water Hammer System",
        building: "Water Hammer Building",
        floor: "Ground Floor",
        room: "Tank Room"
      },
      specifications: {
        capacity: data.tank.capacity,
        nozzleSize: data.tank.nozzle,
        material: "Steel",
        pressure: 16,
        volume: data.tank.capacity
      },
      status: "operational",
      condition: "good",
      installationDate: "2020-01-15",
      operatingHours: 35040,
      notes: `Water hammer tank - Capacity: ${data.tank.capacity}m³, Nozzle: ${data.tank.nozzle}mm`,
      conditionMonitoring: {
        lastUpdated: "2024-12-15",
        overallCondition: "good",
        alerts: []
      },
      failureHistory: [],
      maintenanceHistory: [],
      history: [],
      createdAt: "2020-01-15T00:00:00Z",
      updatedAt: "2024-12-15T00:00:00Z"
    };
    equipment.push(tankEquipment);
  }

  // Create compressors
  for (let i = 1; i <= data.compressor.qty; i++) {
    const compressorEquipment: Equipment = {
      id: `EQ-${data.pumpStation}-WH-COMP-${i}`,
      name: `Water Hammer Compressor ${i}`,
      level: "equipment",
      parentId: `SYSTEM-${data.pumpStation}-WH`,
      zoneId: `ZONE-A`,
      stationId: `STATION-${data.pumpStation}`,
      systemId: `SYSTEM-${data.pumpStation}-WH`,
      path: `${systemPath}/Compressor ${i}`,
      breadcrumbs: createBreadcrumbs(`${systemPath}/Compressor ${i}`),
      type: "mechanical",
      category: "compressor",
      manufacturer: data.compressor.brand,
      model: data.compressor.model,
      serialNumber: `EHM-${Date.now().toString().slice(-6)}-C${i}`,
      assetTag: `C-${data.pumpStation}-WH-${i.toString().padStart(3, '0')}`,
      location: {
        zone: "Zone A",
        station: `Pump Station ${data.pumpStation}`,
        system: "Water Hammer System",
        building: "Water Hammer Building",
        floor: "Ground Floor",
        room: "Compressor Room"
      },
      specifications: {
        model: data.compressor.model,
        manufacturer: data.compressor.brand,
        type: "Air Compressor"
      },
      status: "operational",
      condition: "good",
      installationDate: "2020-01-15",
      operatingHours: 35040,
      notes: `Water hammer compressor - Model: ${data.compressor.model}`,
      conditionMonitoring: {
        lastUpdated: "2024-12-15",
        overallCondition: "good",
        alerts: []
      },
      failureHistory: [],
      maintenanceHistory: [],
      history: [],
      createdAt: "2020-01-15T00:00:00Z",
      updatedAt: "2024-12-15T00:00:00Z"
    };
    equipment.push(compressorEquipment);
  }

  return equipment;
};

// Helper function to create priming pump equipment from real data
const createPrimingPumpEquipmentFromRealData = (data: PrimingPumpData[]): Equipment[] => {
  const stationCode = data[0].pumpStation;
  const stationPath = `Zone ${data[0].zone}/Pump Station ${stationCode}`;
  const systemPath = `${stationPath}/Priming System`;
  const equipment: Equipment[] = [];

  // Create priming pumps
  data.forEach((pumpData, index) => {
    const pumpNumber = index + 1;
    const primingPumpEquipment: Equipment = {
      id: `EQ-${stationCode}-PR-PUMP-${pumpNumber}`,
      name: `Priming Pump ${pumpNumber}`,
      level: "equipment",
      parentId: `SYSTEM-${stationCode}-PR`,
      zoneId: `ZONE-${data[0].zone}`,
      stationId: `STATION-${stationCode}`,
      systemId: `SYSTEM-${stationCode}-PR`,
      path: `${systemPath}/Priming Pump ${pumpNumber}`,
      breadcrumbs: createBreadcrumbs(`${systemPath}/Priming Pump ${pumpNumber}`),
      type: "mechanical",
      category: "pump",
      manufacturer: pumpData.brand,
      model: pumpData.model,
      serialNumber: pumpData.serialNo,
      assetTag: `PP-${stationCode}-PR-${pumpNumber.toString().padStart(3, '0')}`,
      location: {
        zone: `Zone ${data[0].zone}`,
        station: `Pump Station ${stationCode}`,
        system: "Priming System",
        building: "Priming Building",
        floor: "Ground Floor",
        room: "Priming Room"
      },
      specifications: {
        flowRate: pumpData.flowRate,
        vacuum: pumpData.vacuum,
        model: pumpData.model,
        manufacturer: pumpData.brand,
        vendor: pumpData.vendor,
        type: "Vacuum Pump"
      },
      status: "operational",
      condition: "good",
      installationDate: "2020-01-15",
      operatingHours: 35040,
      notes: `Priming pump - Flow: ${pumpData.flowRate} m³/hr, Vacuum: ${pumpData.vacuum} m.bar`,
      conditionMonitoring: {
        lastUpdated: "2024-12-15",
        overallCondition: "good",
        alerts: []
      },
      failureHistory: [],
      maintenanceHistory: [],
      history: [],
      createdAt: "2020-01-15T00:00:00Z",
      updatedAt: "2024-12-15T00:00:00Z"
    };
    equipment.push(primingPumpEquipment);
  });

  return equipment;
};

// Function to build the complete hierarchical structure from real data
const buildHierarchicalStructure = (): { zoneA: Zone; allEquipment: Equipment[] } => {
  // Group equipment by pump station
  const stationGroups = realEquipmentData.reduce((groups, data) => {
    if (!groups[data.pumpStation]) {
      groups[data.pumpStation] = [];
    }
    groups[data.pumpStation].push(data);
    return groups;
  }, {} as Record<string, RealEquipmentData[]>);

  const stations: Station[] = [];
  const allEquipment: Equipment[] = [];

  // Create stations and their equipment
  Object.entries(stationGroups).forEach(([stationCode, stationData]) => {
    const lines: Line[] = [];

    // Create a line for each pump
    stationData.forEach((data) => {
      const lineEquipment = createEquipmentFromRealData(data);

      // Add valve/strainer equipment for this line
      const lineValveStrainerData = realValveStrainerData.filter(
        vsd => vsd.pumpStation === data.pumpStation && vsd.lineNo === data.pumpNo
      );

      let valveSequence = 1;
      lineValveStrainerData.forEach((valveData) => {
        const valveEquipment = createValveStrainerEquipmentFromRealData(valveData, valveSequence);
        lineEquipment.push(valveEquipment);
        valveSequence++;
      });

      allEquipment.push(...lineEquipment);

      const line: Line = {
        id: `LINE-${data.pumpStation}-${data.pumpNo}`,
        name: data.pumpNo,
        level: "line",
        parentId: `STATION-${data.pumpStation}`,
        stationId: `STATION-${data.pumpStation}`,
        path: `Zone ${data.zone}/Pump Station ${data.pumpStation}/${data.pumpNo}`,
        breadcrumbs: createBreadcrumbs(`Zone ${data.zone}/Pump Station ${data.pumpStation}/${data.pumpNo}`),
        lineNumber: parseInt(data.pumpNo.replace('P', '')),
        capacity: data.flowRate,
        operationalStatus: "active",
        assetCount: lineEquipment.length,
        equipment: lineEquipment,
        createdAt: "2020-01-15T00:00:00Z",
        updatedAt: "2024-12-15T00:00:00Z"
      };

      lines.push(line);
    });

    // Add station-level equipment (main header, water hammer, main drain)
    const stationValveStrainerData = realValveStrainerData.filter(
      vsd => vsd.pumpStation === stationCode && !vsd.lineNo
    );

    let stationValveSequence = 1000; // Start from 1000 to avoid conflicts with line equipment
    stationValveStrainerData.forEach((valveData) => {
      const stationValveEquipment = createValveStrainerEquipmentFromRealData(valveData, stationValveSequence);
      allEquipment.push(stationValveEquipment);
      stationValveSequence++;
    });

    // Add water hammer system equipment
    const waterHammerData = realWaterHammerData.find(whd => whd.pumpStation === stationCode);
    const systems: System[] = [];

    if (waterHammerData) {
      const waterHammerEquipment = createWaterHammerEquipmentFromRealData(waterHammerData);
      allEquipment.push(...waterHammerEquipment);

      const waterHammerSystem: System = {
        id: `SYSTEM-${stationCode}-WH`,
        name: "Water Hammer System",
        level: "system",
        parentId: `STATION-${stationCode}`,
        stationId: `STATION-${stationCode}`,
        path: `Zone A/Pump Station ${stationCode}/Water Hammer System`,
        breadcrumbs: createBreadcrumbs(`Zone A/Pump Station ${stationCode}/Water Hammer System`),
        systemType: "water_hammer",
        capacity: waterHammerData.tank.capacity * waterHammerData.tank.qty,
        operationalStatus: "active",
        assetCount: waterHammerEquipment.length,
        equipment: waterHammerEquipment,
        createdAt: "2020-01-15T00:00:00Z",
        updatedAt: "2024-12-15T00:00:00Z"
      };

      systems.push(waterHammerSystem);
    }

    // Add priming system equipment
    const primingPumpData = realPrimingPumpData.filter(ppd => ppd.pumpStation === stationCode);

    if (primingPumpData.length > 0) {
      const primingEquipment = createPrimingPumpEquipmentFromRealData(primingPumpData);
      allEquipment.push(...primingEquipment);

      const primingSystem: System = {
        id: `SYSTEM-${stationCode}-PR`,
        name: "Priming System",
        level: "system",
        parentId: `STATION-${stationCode}`,
        stationId: `STATION-${stationCode}`,
        path: `Zone A/Pump Station ${stationCode}/Priming System`,
        breadcrumbs: createBreadcrumbs(`Zone A/Pump Station ${stationCode}/Priming System`),
        systemType: "priming",
        capacity: primingPumpData.length,
        operationalStatus: "active",
        assetCount: primingEquipment.length,
        equipment: primingEquipment,
        createdAt: "2020-01-15T00:00:00Z",
        updatedAt: "2024-12-15T00:00:00Z"
      };

      systems.push(primingSystem);
    }

    // Calculate total station capacity
    const totalCapacity = stationData.reduce((sum, data) => sum + data.flowRate, 0);

    const station: Station = {
      id: `STATION-${stationCode}`,
      name: `Pump Station ${stationCode}`,
      level: "station",
      parentId: "ZONE-A",
      zoneId: "ZONE-A",
      path: `Zone A/Pump Station ${stationCode}`,
      breadcrumbs: createBreadcrumbs(`Zone A/Pump Station ${stationCode}`),
      stationType: "pump_station",
      capacity: totalCapacity,
      operationalStatus: "active",
      assetCount: lines.reduce((sum, line) => sum + line.equipment.length, 0) +
        stationValveStrainerData.length +
        systems.reduce((sum, system) => sum + system.equipment.length, 0),
      lines: lines,
      systems: systems,
      createdAt: "2020-01-15T00:00:00Z",
      updatedAt: "2024-12-15T00:00:00Z"
    };

    stations.push(station);
  });

  // Create Zone A with all stations
  const zoneA: Zone = {
    id: "ZONE-A",
    name: "Zone A",
    level: "zone",
    path: "Zone A",
    breadcrumbs: createBreadcrumbs("Zone A"),
    description: "Primary operational zone for water pumping systems with 48 pumps across 11 pump stations",
    location: {
      country: "Egypt",
      state: "Cairo",
      city: "New Cairo",
      coordinates: {
        latitude: 30.0444,
        longitude: 31.2357
      }
    },
    assetCount: allEquipment.length,
    stations: stations.sort((a, b) => a.name.localeCompare(b.name)), // Sort stations by name
    createdAt: "2020-01-15T00:00:00Z",
    updatedAt: "2024-12-15T00:00:00Z"
  };

  return { zoneA, allEquipment };
};

// Build the actual hierarchical structure
const { zoneA, allEquipment } = buildHierarchicalStructure();

// Export the new hierarchical structure with real equipment data
export { zoneA };
export const allHierarchicalEquipment = allEquipment;

// Export the complete hierarchical structure
export const hierarchicalAssetStructure = {
  zones: [zoneA],
  allEquipment: allHierarchicalEquipment
};

// Backward compatibility - alias for existing code
export const industrialAssets = allHierarchicalEquipment;

// Export station data for easy access
export const pumpStations = zoneA.stations;

// Export summary statistics
export const equipmentSummary = {
  totalPumps: allEquipment.filter(eq => eq.category === 'pump').length,
  mainPumps: allEquipment.filter(eq => eq.category === 'pump' && !eq.name.includes('Priming')).length,
  primingPumps: allEquipment.filter(eq => eq.category === 'pump' && eq.name.includes('Priming')).length,
  totalMotors: allEquipment.filter(eq => eq.category === 'motor').length,
  totalValves: allEquipment.filter(eq => eq.category === 'valve').length,
  totalStrainers: allEquipment.filter(eq => eq.category === 'strainer').length,
  totalSensors: allEquipment.filter(eq => eq.category === 'sensor').length,
  totalActuators: allEquipment.filter(eq => eq.category === 'actuator').length,
  totalTanks: allEquipment.filter(eq => eq.category === 'tank').length,
  totalCompressors: allEquipment.filter(eq => eq.category === 'compressor').length,
  totalEquipment: allEquipment.length,
  totalStations: zoneA.stations.length,
  totalCapacity: zoneA.stations.reduce((sum, station) => sum + (station.capacity || 0), 0),
  manufacturers: {
    pumps: [...new Set(allEquipment.filter(eq => eq.category === 'pump').map(eq => eq.manufacturer))],
    mainPumps: [...new Set(allEquipment.filter(eq => eq.category === 'pump' && !eq.name.includes('Priming')).map(eq => eq.manufacturer))],
    primingPumps: [...new Set(allEquipment.filter(eq => eq.category === 'pump' && eq.name.includes('Priming')).map(eq => eq.manufacturer))],
    motors: [...new Set(allEquipment.filter(eq => eq.category === 'motor').map(eq => eq.manufacturer))],
    valves: [...new Set(allEquipment.filter(eq => eq.category === 'valve').map(eq => eq.manufacturer))],
    strainers: [...new Set(allEquipment.filter(eq => eq.category === 'strainer').map(eq => eq.manufacturer))],
    tanks: [...new Set(allEquipment.filter(eq => eq.category === 'tank').map(eq => eq.manufacturer))],
    compressors: [...new Set(allEquipment.filter(eq => eq.category === 'compressor').map(eq => eq.manufacturer))]
  },
  byCategory: {
    pump: allEquipment.filter(eq => eq.category === 'pump').length,
    motor: allEquipment.filter(eq => eq.category === 'motor').length,
    valve: allEquipment.filter(eq => eq.category === 'valve').length,
    strainer: allEquipment.filter(eq => eq.category === 'strainer').length,
    sensor: allEquipment.filter(eq => eq.category === 'sensor').length,
    actuator: allEquipment.filter(eq => eq.category === 'actuator').length,
    tank: allEquipment.filter(eq => eq.category === 'tank').length,
    compressor: allEquipment.filter(eq => eq.category === 'compressor').length
  }
};




