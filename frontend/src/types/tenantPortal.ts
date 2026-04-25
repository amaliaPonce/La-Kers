export type TenantPortalPayment = {
  id: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'LATE';
  dueDate: string | null;
  paidDate: string | null;
  paymentMethod: 'CASH' | 'BANK' | null;
  month: number | null;
  year: number | null;
  unitName: string | null;
  receiptDownloadUrl: string | null;
};

export type TenantPortalIncident = {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdAt: string | null;
  updatedAt: string | null;
  statusUpdatedAt: string | null;
  closedAt: string | null;
  reportedBy: 'OWNER' | 'TENANT' | 'SYSTEM';
  unitName: string | null;
  cost: number | null;
};

export type TenantPortalOverview = {
  accessId: string;
  ownerId: string;
  tenantPersonId: string;
  clerkUserId: string;
  tenant: {
    id: string;
    fullName: string;
    email: string | null;
    contractStart: string | null;
    contractEnd: string | null;
    status: string | null;
  };
  unit: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    postalCode: string | null;
  } | null;
  premium: {
    enabled: boolean;
    reason: 'disabled_by_env' | 'owner_plan_required' | null;
    renewalNotice: {
      visible: boolean;
      thresholdDays: number;
      daysRemaining: number | null;
      contractEnd: string | null;
      tone: 'info' | 'warning' | 'critical' | null;
    } | null;
    payments: {
      pending: TenantPortalPayment[];
      history: TenantPortalPayment[];
      summary: {
        pendingCount: number;
        lateCount: number;
        paidCount: number;
        outstandingAmount: number;
        paidAmount: number;
      };
    } | null;
    documents: {
      contract: {
        available: boolean;
        downloadUrl: string | null;
      };
      receipts: Array<{
        id: string;
        paymentId: string;
        title: string;
        paidDate: string | null;
        amount: number;
        downloadUrl: string;
      }>;
    } | null;
    incidents: {
      items: TenantPortalIncident[];
      openCount: number;
      closedCount: number;
      canCreate: boolean;
    } | null;
  };
};
