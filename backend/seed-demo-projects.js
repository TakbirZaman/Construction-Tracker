// Seed realistic demo projects with tasks, materials, and budget
// Run: node seed-demo-projects.js

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const DEMO_PROJECTS = [
  {
    name: 'Dhaka Business Plaza Development',
    description: 'Modern commercial complex with 15-story office tower, retail spaces, and parking facilities in Gulshan, Dhaka. High-end finishing with smart building integration.',
    status: 'active',
    budget: 45000000,
    start_date: '2024-03-15',
    end_date: '2026-06-30',
    location: 'Gulshan, Dhaka',
    manager_id: 15, // Opi
    tasks: [
      { title: 'Foundation & Structural Framework', description: 'Excavation and reinforced concrete foundation work', status: 'completed', priority: 'critical', progress: 100 },
      { title: 'Electrical Installation - Phase 1', description: 'Main power distribution and emergency backup systems', status: 'in_progress', priority: 'high', progress: 65 },
      { title: 'HVAC System Setup', description: 'Central air conditioning and ventilation for all floors', status: 'pending', priority: 'high', progress: 0 },
      { title: 'Glass Facade Installation', description: 'High-performance glazing systems for external walls', status: 'pending', priority: 'medium', progress: 0 },
      { title: 'Interior Finishing', description: 'Flooring, painting, ceiling systems', status: 'pending', priority: 'medium', progress: 0 },
    ],
    materials: [
      { name: 'Reinforced Steel (Tons)', unit: 'ton', quantity_ordered: 2500, quantity_used: 1800, unit_cost: 65000, supplier: 'Siddeshwari Steel Mills' },
      { name: 'Ready Mix Concrete (Cubic Meter)', unit: 'm³', quantity_ordered: 8000, quantity_used: 6500, unit_cost: 4500, supplier: 'Lafarge Bangladesh' },
      { name: 'Double Glazed Glass (Sqm)', unit: 'm²', quantity_ordered: 15000, quantity_used: 0, unit_cost: 1200, supplier: 'AGC Glass' },
      { name: 'Electrical Cable (Kilometer)', unit: 'km', quantity_ordered: 250, quantity_used: 120, unit_cost: 85000, supplier: 'Voltas Electrical' },
      { name: 'Ceramic Tiles (Sqm)', unit: 'm²', quantity_ordered: 50000, quantity_used: 5000, unit_cost: 280, supplier: 'Ispat Ceramics' },
    ],
    budgetEntries: [
      { category: 'materials', description: 'Steel reinforcement bars', planned_cost: 162500000, actual_cost: 117000000 },
      { category: 'labor', description: 'Construction workforce', planned_cost: 120000000, actual_cost: 95000000 },
      { category: 'equipment', description: 'Cranes, excavators, machinery rental', planned_cost: 80000000, actual_cost: 42000000 },
      { category: 'overhead', description: 'Permits, inspections, site office', planned_cost: 25000000, actual_cost: 18000000 },
      { category: 'other', description: 'Contingency and miscellaneous', planned_cost: 15000000, actual_cost: 8000000 },
    ]
  },
  {
    name: 'Residential Complex - Green Valley',
    description: '250-unit apartment complex with modern amenities including swimming pool, gym, community center, and landscaped gardens in Baridhara.',
    status: 'active',
    budget: 28500000,
    start_date: '2024-06-01',
    end_date: '2026-03-31',
    location: 'Baridhara, Dhaka',
    manager_id: 16, // Alamain
    tasks: [
      { title: 'Land Acquisition & Clearing', description: 'Complete site preparation and survey', status: 'completed', priority: 'critical', progress: 100 },
      { title: 'Building Construction - Block A', description: 'Structural work for first residential block', status: 'in_progress', priority: 'critical', progress: 70 },
      { title: 'Building Construction - Block B', description: 'Structural work for second residential block', status: 'in_progress', priority: 'critical', progress: 45 },
      { title: 'Common Amenities Development', description: 'Swimming pool, gym, and community facilities', status: 'pending', priority: 'high', progress: 0 },
      { title: 'Landscaping & External Works', description: 'Gardens, pathways, and parking areas', status: 'pending', priority: 'medium', progress: 0 },
    ],
    materials: [
      { name: 'Cement (Bags)', unit: 'bag', quantity_ordered: 120000, quantity_used: 75000, unit_cost: 650, supplier: 'Holcim Bangladesh' },
      { name: 'Sand (Cubic Meter)', unit: 'm³', quantity_ordered: 25000, quantity_used: 18000, unit_cost: 1200, supplier: 'Local Suppliers' },
      { name: 'Bricks (Million)', unit: 'mn', quantity_ordered: 50, quantity_used: 28, unit_cost: 25000, supplier: 'Dhaka Clay Works' },
      { name: 'Plumbing Fixtures', unit: 'set', quantity_ordered: 250, quantity_used: 0, unit_cost: 35000, supplier: 'Jaquar India' },
      { name: 'Paint (Liter)', unit: 'ltr', quantity_ordered: 8000, quantity_used: 1500, unit_cost: 450, supplier: 'Asian Paints' },
    ],
    budgetEntries: [
      { category: 'labor', description: 'Construction and skilled workers', planned_cost: 90000000, actual_cost: 72000000 },
      { category: 'materials', description: 'Cement, sand, bricks, and finishes', planned_cost: 85000000, actual_cost: 54000000 },
      { category: 'equipment', description: 'Machinery and temporary structures', planned_cost: 45000000, actual_cost: 22000000 },
      { category: 'overhead', description: 'Site management and utilities', planned_cost: 18000000, actual_cost: 12000000 },
    ]
  },
  {
    name: 'Chittagong Port Road Expansion',
    description: 'Highway expansion project adding 4 lanes to existing road infrastructure connecting port terminal with industrial zones. Total length 12 km.',
    status: 'active',
    budget: 65000000,
    start_date: '2024-01-20',
    end_date: '2025-12-31',
    location: 'Chittagong Port Area',
    manager_id: 15, // Opi
    tasks: [
      { title: 'Soil Testing & Survey', description: 'Geotechnical investigation and road alignment finalization', status: 'completed', priority: 'critical', progress: 100 },
      { title: 'Asphalt Laying - Phase 1', description: 'Base layer asphalt for 6 km stretch', status: 'completed', priority: 'critical', progress: 100 },
      { title: 'Asphalt Laying - Phase 2', description: 'Base layer asphalt for remaining 6 km', status: 'in_progress', priority: 'critical', progress: 55 },
      { title: 'Drainage System Installation', description: 'Stormwater and underground drainage', status: 'in_progress', priority: 'high', progress: 40 },
      { title: 'Traffic Signals & Markings', description: 'Installation of safety equipment and road markings', status: 'pending', priority: 'medium', progress: 0 },
    ],
    materials: [
      { name: 'Bitumen (Ton)', unit: 'ton', quantity_ordered: 45000, quantity_used: 28000, unit_cost: 78000, supplier: 'Bangladesh Petroleum' },
      { name: 'Concrete (Cubic Meter)', unit: 'm³', quantity_ordered: 12000, quantity_used: 8500, unit_cost: 5200, supplier: 'RMC Suppliers' },
      { name: 'Aggregate (Cubic Meter)', unit: 'm³', quantity_ordered: 35000, quantity_used: 22000, unit_cost: 2800, supplier: 'Stone Crushers Association' },
      { name: 'Steel Reinforcement (Ton)', unit: 'ton', quantity_ordered: 1200, quantity_used: 650, unit_cost: 68000, supplier: 'Siddeshwari' },
      { name: 'Drainage Pipes (Meter)', unit: 'm', quantity_ordered: 25000, quantity_used: 12000, unit_cost: 850, supplier: 'PVC Manufacturers' },
    ],
    budgetEntries: [
      { category: 'materials', description: 'Bitumen and aggregates for road', planned_cost: 210000000, actual_cost: 132000000 },
      { category: 'labor', description: 'Road construction workforce', planned_cost: 180000000, actual_cost: 98000000 },
      { category: 'equipment', description: 'Roller, excavators, pavers', planned_cost: 75000000, actual_cost: 42000000 },
      { category: 'overhead', description: 'Project management and permits', planned_cost: 35000000, actual_cost: 28000000 },
    ]
  },
  {
    name: 'Sylhet Teaching Hospital Wing Extension',
    description: 'Medical facility expansion with 200-bed capacity, ICU, operation theaters, and diagnostic centers. Healthcare industry standard specifications.',
    status: 'planning',
    budget: 55000000,
    start_date: '2025-02-01',
    end_date: '2026-11-30',
    location: 'Sylhet City',
    manager_id: 15, // Opi
    tasks: [
      { title: 'Architectural Design Approval', description: 'Complete design documentation and regulatory approval', status: 'in_progress', priority: 'critical', progress: 85 },
      { title: 'Site Preparation', description: 'Land acquisition and preliminary works', status: 'pending', priority: 'high', progress: 0 },
      { title: 'Foundation Work', description: 'Deep foundation for medical safety requirements', status: 'pending', priority: 'critical', progress: 0 },
      { title: 'MEP Installation', description: 'Mechanical, Electrical, Plumbing systems for hospital', status: 'pending', priority: 'critical', progress: 0 },
      { title: 'Medical Equipment Integration', description: 'Installation of specialized medical equipment', status: 'pending', priority: 'high', progress: 0 },
    ],
    materials: [
      { name: 'Structural Steel (Ton)', unit: 'ton', quantity_ordered: 1800, quantity_used: 0, unit_cost: 70000, supplier: 'ArcelorMittal' },
      { name: 'Medical-Grade Tiles (Sqm)', unit: 'm²', quantity_ordered: 20000, quantity_used: 0, unit_cost: 850, supplier: 'Porcelain Specialists' },
      { name: 'Stainless Steel Fixtures (Set)', unit: 'set', quantity_ordered: 200, quantity_used: 0, unit_cost: 125000, supplier: 'Hospital Equipment Co.' },
      { name: 'Medical Gas Pipeline (Meter)', unit: 'm', quantity_ordered: 15000, quantity_used: 0, unit_cost: 2500, supplier: 'Medical Gas Systems' },
    ],
    budgetEntries: [
      { category: 'materials', description: 'Specialized construction materials', planned_cost: 165000000, actual_cost: 0 },
      { category: 'labor', description: 'Skilled healthcare facility construction', planned_cost: 155000000, actual_cost: 0 },
      { category: 'equipment', description: 'Machinery and medical equipment', planned_cost: 120000000, actual_cost: 0 },
      { category: 'other', description: 'Contingency (12%)', planned_cost: 60000000, actual_cost: 0 },
    ]
  },
  {
    name: 'Narayanganj Industrial Park Infrastructure',
    description: 'Industrial estate development with 50 factory plots, common facilities, warehousing, and utility infrastructure. Spread over 150 acres.',
    status: 'active',
    budget: 72000000,
    start_date: '2023-09-15',
    end_date: '2025-09-14',
    location: 'Narayanganj',
    manager_id: 16, // Alamain
    tasks: [
      { title: 'Master Plan Development', description: 'Layout design and infrastructure planning', status: 'completed', priority: 'critical', progress: 100 },
      { title: 'Road & Utility Network', description: 'Main roads, water, electricity distribution', status: 'in_progress', priority: 'critical', progress: 80 },
      { title: 'Factory Plot Development', description: 'Leveling and plot demarcation for 50 units', status: 'in_progress', priority: 'high', progress: 65 },
      { title: 'Common Facility Building', description: 'Warehouse, office, and conference center', status: 'in_progress', priority: 'high', progress: 50 },
      { title: 'Waste Management System', description: 'Environmental compliance infrastructure', status: 'pending', priority: 'medium', progress: 0 },
    ],
    materials: [
      { name: 'Asphalt (Ton)', unit: 'ton', quantity_ordered: 28000, quantity_used: 22000, unit_cost: 76000, supplier: 'Bangladesh Petroleum' },
      { name: 'Concrete Blocks (Million)', unit: 'mn', quantity_ordered: 15, quantity_used: 8, unit_cost: 45000, supplier: 'Block Manufacturers' },
      { name: 'Water Pipe (Km)', unit: 'km', quantity_ordered: 45, quantity_used: 32, unit_cost: 2500000, supplier: 'Pipe Suppliers Union' },
      { name: 'Electrical Cable (Km)', unit: 'km', quantity_ordered: 120, quantity_used: 95, unit_cost: 850000, supplier: 'Electrical Distributors' },
    ],
    budgetEntries: [
      { category: 'materials', description: 'Roads, pipes, and utilities', planned_cost: 216000000, actual_cost: 168000000 },
      { category: 'labor', description: 'Site development and construction', planned_cost: 180000000, actual_cost: 132000000 },
      { category: 'equipment', description: 'Dozers, compactors, utility vehicles', planned_cost: 95000000, actual_cost: 58000000 },
      { category: 'overhead', description: 'Project management and administration', planned_cost: 40000000, actual_cost: 32000000 },
    ]
  },
  {
    name: 'Khulna Export Processing Zone Terminal',
    description: 'Modern cargo handling terminal with 50,000 sqm covered storage, container yard, and administrative facilities. International port standards.',
    status: 'completed',
    budget: 38500000,
    start_date: '2022-11-01',
    end_date: '2024-08-31',
    location: 'Khulna Port',
    manager_id: 15, // Opi
    tasks: [
      { title: 'Site Development & Reclamation', description: 'Dredging and land preparation for port facility', status: 'completed', priority: 'critical', progress: 100 },
      { title: 'Terminal Building Construction', description: 'Main warehouse and administrative block', status: 'completed', priority: 'critical', progress: 100 },
      { title: 'Cargo Handling Equipment Installation', description: 'Cranes, conveyor systems, and loading systems', status: 'completed', priority: 'high', progress: 100 },
      { title: 'Container Yard Paving', description: 'Reinforced concrete yard for container storage', status: 'completed', priority: 'high', progress: 100 },
      { title: 'Commissioning & Testing', description: 'Full operational testing and staff training', status: 'completed', priority: 'high', progress: 100 },
    ],
    materials: [
      { name: 'Structural Steel (Ton)', unit: 'ton', quantity_ordered: 2200, quantity_used: 2200, unit_cost: 72000, supplier: 'Siddeshwari Steel' },
      { name: 'Reinforced Concrete (Cubic Meter)', unit: 'm³', quantity_ordered: 22000, quantity_used: 22000, unit_cost: 5500, supplier: 'RMC Suppliers' },
      { name: 'Industrial Flooring (Sqm)', unit: 'm²', quantity_ordered: 50000, quantity_used: 50000, unit_cost: 650, supplier: 'Flooring Specialists' },
    ],
    budgetEntries: [
      { category: 'materials', description: 'Steel, concrete, and finishing materials', planned_cost: 115500000, actual_cost: 110250000 },
      { category: 'labor', description: 'Skilled port facility construction workforce', planned_cost: 95000000, actual_cost: 92500000 },
      { category: 'equipment', description: 'Heavy machinery and cargo equipment', planned_cost: 85000000, actual_cost: 82000000 },
      { category: 'overhead', description: 'Project management and compliance', planned_cost: 40000000, actual_cost: 38250000 },
    ]
  },
  {
    name: 'Rajshahi University Academic Complex',
    description: 'State-of-the-art academic building with 15 lecture halls, 40 offices, library, and research facilities. Green building certified.',
    status: 'planning',
    budget: 42000000,
    start_date: '2025-04-01',
    end_date: '2026-12-31',
    location: 'Rajshahi University Campus',
    manager_id: 16, // Alamain
    tasks: [
      { title: 'Detailed Architectural Design', description: 'Complete design with sustainability features', status: 'in_progress', priority: 'high', progress: 60 },
      { title: 'Environmental Impact Assessment', description: 'Green building and sustainability certification', status: 'in_progress', priority: 'high', progress: 50 },
      { title: 'Foundation & Structural Work', description: 'Earthquake-resistant design implementation', status: 'pending', priority: 'critical', progress: 0 },
      { title: 'HVAC & Utilities Installation', description: 'Energy-efficient systems installation', status: 'pending', priority: 'high', progress: 0 },
      { title: 'Library & Lab Equipment Setup', description: 'Specialized equipment and furniture installation', status: 'pending', priority: 'medium', progress: 0 },
    ],
    materials: [
      { name: 'Reinforced Concrete (Cubic Meter)', unit: 'm³', quantity_ordered: 6500, quantity_used: 0, unit_cost: 5200, supplier: 'Lafarge Bangladesh' },
      { name: 'Eco-Friendly Paint (Liter)', unit: 'ltr', quantity_ordered: 5000, quantity_used: 0, unit_cost: 850, supplier: 'Eco-Paint Ltd' },
      { name: 'Solar Panels (Unit)', unit: 'unit', quantity_ordered: 800, quantity_used: 0, unit_cost: 45000, supplier: 'Renewable Energy Corp' },
      { name: 'Smart Glass Windows (Sqm)', unit: 'm²', quantity_ordered: 3000, quantity_used: 0, unit_cost: 2200, supplier: 'Smart Solutions' },
    ],
    budgetEntries: [
      { category: 'materials', description: 'Green building materials', planned_cost: 126000000, actual_cost: 0 },
      { category: 'labor', description: 'Specialized academic facility construction', planned_cost: 105000000, actual_cost: 0 },
      { category: 'equipment', description: 'Educational and lab equipment', planned_cost: 75000000, actual_cost: 0 },
      { category: 'overhead', description: 'Engineering and certification', planned_cost: 44000000, actual_cost: 0 },
    ]
  },
];

async function seedDemoProjects() {
  try {
    console.log('🔄 Connecting to database...');
    await pool.query('SELECT 1');
    console.log('✅ Connected');

    console.log('🔄 Seeding 7 realistic demo projects...');

    for (const project of DEMO_PROJECTS) {
      // Create project
      const { rows: projectRows } = await pool.query(
        `INSERT INTO projects (name, description, status, budget, start_date, end_date, location, manager_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [project.name, project.description, project.status, project.budget, project.start_date, project.end_date, project.location, project.manager_id, 13]
      );
      const projectId = projectRows[0].id;
      console.log(`  ✅ Created project: ${project.name}`);

      // Add tasks
      for (const task of project.tasks) {
        await pool.query(
          `INSERT INTO tasks (project_id, title, description, status, priority, progress, due_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [projectId, task.title, task.description, task.status, task.priority, task.progress, project.end_date]
        );
      }
      console.log(`    📋 Added ${project.tasks.length} tasks`);

      // Add materials
      for (const material of project.materials) {
        await pool.query(
          `INSERT INTO materials (project_id, name, unit, quantity_ordered, quantity_used, unit_cost, supplier)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [projectId, material.name, material.unit, material.quantity_ordered, material.quantity_used, material.unit_cost, material.supplier]
        );
      }
      console.log(`    📦 Added ${project.materials.length} materials`);

      // Add budget entries
      for (const entry of project.budgetEntries) {
        await pool.query(
          `INSERT INTO budget_entries (project_id, category, description, planned_cost, actual_cost, date)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [projectId, entry.category, entry.description, entry.planned_cost, entry.actual_cost, project.start_date]
        );
      }
      console.log(`    💰 Added ${project.budgetEntries.length} budget entries`);
    }

    console.log('\n✅ Database seeded with 7 professional demo projects!');
    console.log('\nProject Summary:');
    console.log('  • Dhaka Business Plaza: 45 Cr (Active)');
    console.log('  • Green Valley Residential: 28.5 Cr (Active)');
    console.log('  • Chittagong Port Expansion: 65 Cr (Active)');
    console.log('  • Sylhet Teaching Hospital: 55 Cr (Planning)');
    console.log('  • Narayanganj Industrial Park: 72 Cr (Active)');
    console.log('  • Khulna Export Terminal: 38.5 Cr (Completed)');
    console.log('  • Rajshahi University Academic: 42 Cr (Planning)');
    console.log('\nTotal Project Value: ₳347 Crore');
  } catch (e) {
    console.error('❌ Seeding failed:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDemoProjects();
