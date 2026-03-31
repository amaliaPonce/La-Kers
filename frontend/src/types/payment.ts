export type PaymentStatus = 'PENDING' | 'PAID' | 'LATE';
export type PaymentMethod = 'CASH' | 'BANK';

export type PaymentUnit = {
  id: string;
  name?: string;
};

export type TenantPerson = {
  id: string;
  full_name?: string;
};

export type Payment = {
  id: string;
  amount: number;
  status: PaymentStatus;
  due_date: string;
  month: number;
  year: number;
  paid_date?: string;
  payment_method?: PaymentMethod | null;
  tenant_person_id?: string;
  unit_id?: string;
  units?: PaymentUnit;
  tenant_persons?: TenantPerson;
};
