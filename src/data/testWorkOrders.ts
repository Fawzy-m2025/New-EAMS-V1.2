
import type { WorkOrder, Priority } from '@/types/eams';

// Generate 15 comprehensive test work orders aligned with asset registry
export const generateTestWorkOrders = (): WorkOrder[] => {
  const workOrders: WorkOrder[] = [
    {
      id: "WO-2024-001",
      title: "Emergency Transformer Oil Leak Repair",
      description: "Critical oil leak detected in primary transformer T-001. Immediate containment and repair required to prevent environmental hazard and potential equipment failure. Oil analysis shows contamination requiring full replacement.",
      priority: "critical",
      status: "in-progress",
      assignedTo: ["John Smith", "Mike Rodriguez"],
      equipmentId: "TX-001",
      equipmentName: "Primary Distribution Transformer 13.8kV",
      location: "Electrical Substation A - Bay 1",
      type: "Emergency",
      createdDate: "2024-12-16",
      dueDate: "2024-12-16",
      scheduledDate: "2024-12-16",
      estimatedHours: 12,
      actualHours: 8,
      cost: {
        labor: 960,
        parts: 2500,
        external: 800,
        total: 4260
      },
      procedures: [
        "Isolate transformer and implement lockout/tagout procedures",
        "Contain oil spill using absorbent materials and barriers",
        "Drain remaining oil from transformer tank",
        "Inspect and replace damaged gaskets and seals",
        "Pressure test all connections and joints",
        "Fill with new transformer oil and test insulation resistance"
      ]
    },
    {
      id: "WO-2024-002",
      title: "Centrifugal Pump Bearing Replacement",
      description: "Condition monitoring detected elevated vibration levels (>7.1 mm/s RMS) in pump P-201. Bearing replacement required per ISO 10816 guidelines. Thermographic analysis shows hot spots indicating bearing deterioration.",
      priority: "high",
      status: "completed",
      assignedTo: "Sarah Wilson",
      equipmentId: "P-201",
      equipmentName: "Main Circulation Pump 500GPM",
      location: "Pump House 2 - Room B",
      type: "Corrective",
      createdDate: "2024-12-10",
      dueDate: "2024-12-14",
      scheduledDate: "2024-12-12",
      completedDate: "2024-12-13",
      estimatedHours: 6,
      actualHours: 5.5,
      cost: {
        labor: 440,
        parts: 350,
        external: 0,
        total: 790
      },
      procedures: [
        "Shut down pump and isolate from electrical supply",
        "Drain pump casing and disconnect piping",
        "Remove pump coupling and impeller assembly",
        "Extract old bearings using hydraulic puller",
        "Install new bearings with proper alignment",
        "Reassemble pump and perform vibration analysis"
      ]
    },
    {
      id: "WO-2024-003",
      title: "HVAC System Quarterly Maintenance",
      description: "Scheduled preventive maintenance for rooftop HVAC unit including filter replacement, coil cleaning, refrigerant level check, and control system calibration. Energy efficiency optimization per ASHRAE standards.",
      priority: "medium",
      status: "open",
      assignedTo: "David Lee",
      equipmentId: "HVAC-03",
      equipmentName: "Rooftop Package Unit 25-Ton",
      location: "Building C - Roof Level",
      type: "Preventive",
      createdDate: "2024-12-15",
      dueDate: "2024-12-20",
      scheduledDate: "2024-12-19",
      estimatedHours: 4,
      cost: {
        labor: 320,
        parts: 150,
        external: 0,
        total: 470
      },
      procedures: [
        "Replace air filters and inspect ductwork",
        "Clean evaporator and condenser coils",
        "Check refrigerant levels and test for leaks",
        "Calibrate thermostat and control systems",
        "Lubricate motors and check belt tension",
        "Test safety controls and record performance data"
      ]
    },
    {
      id: "WO-2024-004",
      title: "Motor Control Panel Arc Flash Assessment",
      description: "Annual arc flash hazard analysis for 480V motor control center MCC-A. IEEE 1584 compliance study required with updated incident energy calculations and PPE requirements documentation.",
      priority: "high",
      status: "assigned",
      assignedTo: "Robert Chen",
      equipmentId: "MCC-A01",
      equipmentName: "Motor Control Center 480V Main",
      location: "Electrical Room - Building A",
      type: "Compliance",
      createdDate: "2024-12-14",
      dueDate: "2024-12-21",
      scheduledDate: "2024-12-18",
      estimatedHours: 8,
      cost: {
        labor: 800,
        parts: 0,
        external: 1200,
        total: 2000
      },
      procedures: [
        "Collect electrical system data and one-line diagrams",
        "Perform short circuit and coordination study",
        "Calculate incident energy levels per IEEE 1584",
        "Update arc flash labels and boundary markers",
        "Document PPE requirements for each panel",
        "Train maintenance staff on new safety procedures"
      ]
    },
    {
      id: "WO-2024-005",
      title: "Butterfly Valve Actuator Calibration",
      description: "Control valve BV-501 showing position feedback discrepancies. Smart positioner calibration required to ensure accurate flow control and reduce process variation. HART communication diagnostics included.",
      priority: "medium",
      status: "in-progress",
      assignedTo: "Lisa Martinez",
      equipmentId: "BV-501",
      equipmentName: "Process Control Valve 8-inch",
      location: "Process Area - Line 3",
      type: "Corrective",
      createdDate: "2024-12-12",
      dueDate: "2024-12-17",
      scheduledDate: "2024-12-15",
      estimatedHours: 3,
      actualHours: 2,
      cost: {
        labor: 240,
        parts: 75,
        external: 0,
        total: 315
      },
      procedures: [
        "Connect HART communicator to valve positioner",
        "Perform auto-calibration sequence",
        "Test valve travel limits and linearity",
        "Verify position feedback accuracy",
        "Update control system parameters",
        "Document calibration results and trending data"
      ]
    },
    {
      id: "WO-2024-006",
      title: "Generator Load Bank Testing",
      description: "Monthly load test for emergency generator G-002 per NFPA 110 requirements. Full rated load test to verify performance under maximum capacity conditions and validate automatic transfer switch operation.",
      priority: "medium",
      status: "completed",
      assignedTo: "Tom Anderson",
      equipmentId: "G-002",
      equipmentName: "Emergency Diesel Generator 750kW",
      location: "Generator Building - Unit 2",
      type: "Preventive",
      createdDate: "2024-12-08",
      dueDate: "2024-12-15",
      scheduledDate: "2024-12-10",
      completedDate: "2024-12-10",
      estimatedHours: 4,
      actualHours: 4,
      cost: {
        labor: 400,
        parts: 50,
        external: 0,
        total: 450
      },
      procedures: [
        "Pre-test generator systems inspection",
        "Start generator and warm up to operating temperature",
        "Apply incremental load using portable load bank",
        "Monitor engine parameters and electrical output",
        "Test automatic transfer switch operation",
        "Record performance data and fuel consumption"
      ]
    },
    {
      id: "WO-2024-007",
      title: "Cooling Tower Fan Motor Replacement",
      description: "Motor M-301 failed due to bearing seizure and winding insulation breakdown. Replacement with high-efficiency motor required to maintain cooling system capacity during peak summer operations.",
      priority: "high",
      status: "assigned",
      assignedTo: ["Mike Johnson", "Carlos Rivera"],
      equipmentId: "M-301",
      equipmentName: "Cooling Tower Fan Motor 50HP",
      location: "Cooling Tower 1 - East Side",
      type: "Corrective",
      createdDate: "2024-12-13",
      dueDate: "2024-12-18",
      scheduledDate: "2024-12-16",
      estimatedHours: 10,
      cost: {
        labor: 800,
        parts: 3500,
        external: 0,
        total: 4300
      },
      procedures: [
        "Shut down cooling tower and lock out electrical supply",
        "Disconnect motor wiring and remove coupling",
        "Use crane to remove failed motor from tower structure",
        "Install new motor with proper alignment",
        "Connect electrical supply and test rotation",
        "Commission motor with VFD and test cooling capacity"
      ]
    },
    {
      id: "WO-2024-008",
      title: "Instrumentation Loop Calibration",
      description: "Annual calibration of critical process instrumentation loop including pressure transmitter PT-401, temperature sensor TE-402, and flow meter FE-403. Ensure measurement accuracy within ±0.1% tolerance.",
      priority: "medium",
      status: "open",
      assignedTo: "Jennifer Wong",
      equipmentId: "LOOP-401",
      equipmentName: "Process Control Loop 401",
      location: "Process Area - Control Room Interface",
      type: "Preventive",
      createdDate: "2024-12-16",
      dueDate: "2024-12-23",
      scheduledDate: "2024-12-20",
      estimatedHours: 6,
      cost: {
        labor: 600,
        parts: 25,
        external: 0,
        total: 625
      },
      procedures: [
        "Calibrate pressure transmitter using deadweight tester",
        "Verify temperature sensor accuracy with RTD simulator",
        "Check flow meter calibration using portable reference",
        "Test 4-20mA signal integrity and loop resistance",
        "Update DCS configuration and alarm setpoints",
        "Generate calibration certificates for regulatory compliance"
      ]
    },
    {
      id: "WO-2024-009",
      title: "Compressor Oil Analysis and Changeout",
      description: "Routine oil analysis for air compressor AC-201 revealed elevated metal content and acidity levels. Immediate oil change required with filter replacement to prevent equipment damage and ensure reliability.",
      priority: "medium",
      status: "completed",
      assignedTo: "Steve Thompson",
      equipmentId: "AC-201",
      equipmentName: "Rotary Screw Air Compressor 100HP",
      location: "Compressor Room - Building B",
      type: "Preventive",
      createdDate: "2024-12-05",
      dueDate: "2024-12-12",
      scheduledDate: "2024-12-08",
      completedDate: "2024-12-08",
      estimatedHours: 3,
      actualHours: 3,
      cost: {
        labor: 240,
        parts: 180,
        external: 0,
        total: 420
      },
      procedures: [
        "Shut down compressor and allow cooling period",
        "Drain contaminated oil and remove filters",
        "Inspect drain plug and gasket condition",
        "Install new oil filter and separator elements",
        "Fill with fresh synthetic compressor oil",
        "Start compressor and check for leaks and proper pressure"
      ]
    },
    {
      id: "WO-2024-010",
      title: "Electrical Panel Infrared Thermography",
      description: "Quarterly thermographic inspection of electrical distribution panels per NETA MTS standards. Identify hot spots, loose connections, and potential failure points to prevent unplanned outages.",
      priority: "low",
      status: "open",
      assignedTo: "Alex Kumar",
      equipmentId: "PANEL-SCAN",
      equipmentName: "Electrical Distribution System Scan",
      location: "Multiple Electrical Rooms",
      type: "Predictive",
      createdDate: "2024-12-16",
      dueDate: "2024-12-30",
      scheduledDate: "2024-12-22",
      estimatedHours: 8,
      cost: {
        labor: 800,
        parts: 0,
        external: 0,
        total: 800
      },
      procedures: [
        "Load electrical panels to 40% capacity minimum",
        "Capture thermal images of all connections and components",
        "Identify temperature differentials exceeding 15°C",
        "Document findings with digital photography",
        "Generate priority repair recommendations",
        "Schedule corrective actions based on severity levels"
      ]
    },
    {
      id: "WO-2024-011",
      title: "Cooling System Chemical Treatment",
      description: "Monthly water treatment system maintenance including biocide addition, corrosion inhibitor adjustment, and water quality testing. Prevent scale formation and microbiological growth in cooling towers.",
      priority: "low",
      status: "completed",
      assignedTo: "Maria Garcia",
      equipmentId: "CWT-001",
      equipmentName: "Cooling Water Treatment System",
      location: "Chemical Storage Building",
      type: "Preventive",
      createdDate: "2024-12-01",
      dueDate: "2024-12-08",
      scheduledDate: "2024-12-03",
      completedDate: "2024-12-03",
      estimatedHours: 2,
      actualHours: 2,
      cost: {
        labor: 160,
        parts: 300,
        external: 0,
        total: 460
      },
      procedures: [
        "Test water pH, conductivity, and chloride levels",
        "Adjust chemical feed pump rates as required",
        "Add biocide to prevent legionella growth",
        "Check corrosion coupon weight loss",
        "Sample cooling tower basin for laboratory analysis",
        "Update water treatment log and trending charts"
      ]
    },
    {
      id: "WO-2024-012",
      title: "UPS Battery Bank Replacement",
      description: "Uninterruptible power supply UPS-A battery bank showing reduced capacity during load tests. Complete battery replacement required to maintain 15-minute backup power capability for critical systems.",
      priority: "high",
      status: "assigned",
      assignedTo: ["Kevin Park", "Rachel Adams"],
      equipmentId: "UPS-A",
      equipmentName: "UPS System 100kVA Critical Load",
      location: "Computer Room - Building A",
      type: "Corrective",
      createdDate: "2024-12-11",
      dueDate: "2024-12-18",
      scheduledDate: "2024-12-17",
      estimatedHours: 6,
      cost: {
        labor: 600,
        parts: 4500,
        external: 0,
        total: 5100
      },
      procedures: [
        "Coordinate maintenance window with IT operations",
        "Transfer critical loads to bypass source",
        "Disconnect and remove old battery modules",
        "Install new VRLA batteries with proper torque",
        "Test battery string voltage and inter-cell connections",
        "Perform discharge test to verify capacity"
      ]
    },
    {
      id: "WO-2024-013",
      title: "Steam Trap Survey and Replacement",
      description: "Annual steam trap inspection and efficiency assessment. Replace failed traps to eliminate steam losses and improve energy efficiency. Ultrasonic testing to identify blow-through and plugged traps.",
      priority: "medium",
      status: "in-progress",
      assignedTo: "Paul Mitchell",
      equipmentId: "ST-SURVEY",
      equipmentName: "Steam Distribution System Traps",
      location: "Multiple Building Locations",
      type: "Preventive",
      createdDate: "2024-12-09",
      dueDate: "2024-12-20",
      scheduledDate: "2024-12-14",
      estimatedHours: 12,
      actualHours: 8,
      cost: {
        labor: 960,
        parts: 800,
        external: 0,
        total: 1760
      },
      procedures: [
        "Use ultrasonic detector to test each steam trap",
        "Check trap discharge temperature with infrared gun",
        "Identify failed open, failed closed, and leaking traps",
        "Replace defective traps with appropriate models",
        "Test new trap operation and adjust if necessary",
        "Calculate energy savings from trap replacements"
      ]
    },
    {
      id: "WO-2024-014",
      title: "Fire Pump Annual Testing",
      description: "NFPA 25 compliant annual performance test of electric fire pump FP-001. Verify pump capacity, pressure, and automatic start functionality. Ensure fire protection system readiness.",
      priority: "high",
      status: "cancelled",
      assignedTo: "Emergency Response Team",
      equipmentId: "FP-001",
      equipmentName: "Electric Fire Pump 1500GPM",
      location: "Fire Pump House",
      type: "Compliance",
      createdDate: "2024-12-02",
      dueDate: "2024-12-09",
      scheduledDate: "2024-12-07",
      estimatedHours: 4,
      cost: {
        labor: 400,
        parts: 0,
        external: 250,
        total: 650
      },
      procedures: [
        "Coordinate with fire department and insurance carrier",
        "Test automatic start from fire alarm system",
        "Run pump at rated capacity for 30 minutes",
        "Check suction and discharge pressure readings",
        "Test pressure relief valve operation",
        "Document test results for regulatory compliance"
      ]
    },
    {
      id: "WO-2024-015",
      title: "Variable Frequency Drive Programming",
      description: "Commission new VFD installation for circulation pump P-301. Program control parameters, set up communication with SCADA system, and optimize energy efficiency settings per process requirements.",
      priority: "medium",
      status: "open",
      assignedTo: "Technical Specialist Team",
      equipmentId: "VFD-301",
      equipmentName: "Variable Frequency Drive 75HP",
      location: "Electrical Room - Process Building",
      type: "Installation",
      createdDate: "2024-12-15",
      dueDate: "2024-12-22",
      scheduledDate: "2024-12-19",
      estimatedHours: 8,
      cost: {
        labor: 800,
        parts: 100,
        external: 0,
        total: 900
      },
      procedures: [
        "Configure VFD parameters for motor specifications",
        "Set up analog and digital I/O connections",
        "Program PID control loop for pressure regulation",
        "Establish Modbus communication with SCADA",
        "Test all operating modes and safety interlocks",
        "Optimize energy efficiency settings and acceleration rates"
      ]
    }
  ];

  return workOrders;
};

export const testWorkOrders = generateTestWorkOrders();
