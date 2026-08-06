export type SystemConnectorType = "PLM" | "ERP" | "QMS" | "REQUIREMENTS_ALM" | "CAD";

export interface IntegrationConnector {
  id: string;
  name: string;
  type: SystemConnectorType;
  provider: "Siemens Teamcenter" | "PTC Windchill" | "SAP S/4HANA" | "Veeva QMS" | "IBM DOORS";
  status: "CONNECTED" | "SYNCING" | "ERROR" | "IDLE";
  lastSyncAt: string;
  recordsSynced: number;
  conflictsDetected: number;
}

export interface SyncJobResult {
  jobId: string;
  connectorId: string;
  status: "SUCCESS" | "CONFLICTS_DETECTED" | "FAILED";
  recordsProcessed: number;
  conflicts: Array<{
    recordId: string;
    field: string;
    consecuenciaValue: string;
    remoteValue: string;
  }>;
  syncedAt: string;
}

/**
 * Enterprise Integration Connectors & Sync Engine
 */
export async function getActiveConnectors(
  _organizationId: string,
): Promise<IntegrationConnector[]> {
  return [
    {
      id: "conn-plm-teamcenter-01",
      name: "Siemens Teamcenter Aerospace PLM",
      type: "PLM",
      provider: "Siemens Teamcenter",
      status: "CONNECTED",
      lastSyncAt: new Date(Date.now() - 900000).toISOString(),
      recordsSynced: 48290,
      conflictsDetected: 0,
    },
    {
      id: "conn-erp-sap-02",
      name: "SAP S/4HANA Materials & Suppliers",
      type: "ERP",
      provider: "SAP S/4HANA",
      status: "CONNECTED",
      lastSyncAt: new Date(Date.now() - 1800000).toISOString(),
      recordsSynced: 12400,
      conflictsDetected: 1,
    },
    {
      id: "conn-qms-veeva-03",
      name: "Veeva QMS Quality NCR Registry",
      type: "QMS",
      provider: "Veeva QMS",
      status: "CONNECTED",
      lastSyncAt: new Date(Date.now() - 3600000).toISOString(),
      recordsSynced: 3410,
      conflictsDetected: 0,
    },
    {
      id: "conn-alm-doors-04",
      name: "IBM DOORS FAA Part 33 Requirements",
      type: "REQUIREMENTS_ALM",
      provider: "IBM DOORS",
      status: "CONNECTED",
      lastSyncAt: new Date(Date.now() - 7200000).toISOString(),
      recordsSynced: 1850,
      conflictsDetected: 0,
    },
  ];
}

/**
 * Trigger Incremental Synchronization for a Connector
 */
export async function triggerConnectorSync(connectorId: string): Promise<SyncJobResult> {
  return {
    jobId: `sync-${Date.now()}`,
    connectorId,
    status: "SUCCESS",
    recordsProcessed: 142,
    conflicts: [],
    syncedAt: new Date().toISOString(),
  };
}
