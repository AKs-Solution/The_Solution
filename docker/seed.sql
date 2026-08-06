-- File: docker/seed.sql

-- 1. Insert Evidence Spans with SHA-256 Hashes
INSERT INTO evidence_spans (id, hash, document_id, span_text, page_number)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    'DOC-STRESS-ANALYSIS-001.pdf',
    'Operating circumferential stress under 400 bar hydrostatic test pressure calculation: stress = 300 MPa.',
    14
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'f0e1d2c3b4a59876543210fe2109876543210fe2109876543210fe2109876543',
    'MAT-SPEC-STEEL-A-902.pdf',
    'High strength alloy Steel A minimum specified yield strength at 20C: yield_strength = 250 MPa.',
    42
  )
ON CONFLICT (hash) DO NOTHING;

-- 2. Insert Knowledge Nodes
-- Material Node: Steel A
INSERT INTO knowledge_nodes (id, tenant_id, node_type, properties, active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'tenant-default',
  'material',
  '{
    "name": "Steel A",
    "material_code": "AISI-4140",
    "yield_strength": {
      "value": 250,
      "unit": "MPa",
      "dimension": [1, -1, -2, 0, 0, 0, 0]
    }
  }'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Equation Node: Operating Stress
INSERT INTO knowledge_nodes (id, tenant_id, node_type, properties, active)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'tenant-default',
  'equation',
  '{
    "name": "Propulsion Flange Stress Equation",
    "formula": "stress = force / area",
    "operating_stress": {
      "value": 300,
      "unit": "MPa",
      "dimension": [1, -1, -2, 0, 0, 0, 0]
    }
  }'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Design Variable Node: Wall Thickness
INSERT INTO knowledge_nodes (id, tenant_id, node_type, properties, active)
VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'tenant-default',
  'design_variable',
  '{
    "name": "wall_thickness",
    "thickness": {
      "value": 12.5,
      "unit": "mm",
      "dimension": [0, 1, 0, 0, 0, 0, 0]
    }
  }'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Constraint Node: Stress Limit Constraint
INSERT INTO knowledge_nodes (id, tenant_id, node_type, properties, active)
VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'tenant-default',
  'constraint',
  '{
    "name": "Yield Stress Safety Constraint",
    "condition": "operating_stress <= yield_strength"
  }'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert Knowledge Edges with Evidence Binding
INSERT INTO knowledge_edges (id, tenant_id, edge_type, source_id, target_id, evidence_hashes, properties, active)
VALUES 
  (
    'e0000000-0000-0000-0000-000000000001',
    'tenant-default',
    'calculates',
    'a0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    ARRAY['a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0'],
    '{"notes": "Wall thickness governs operating circumferential stress"}'::jsonb,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'tenant-default',
    'constrains',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    ARRAY['f0e1d2c3b4a59876543210fe2109876543210fe2109876543210fe2109876543'],
    '{"notes": "Operating stress constrained by material yield strength"}'::jsonb,
    true
  )
ON CONFLICT (id) DO NOTHING;
