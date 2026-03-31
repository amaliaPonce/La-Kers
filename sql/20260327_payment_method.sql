alter table public.payments
add column if not exists payment_method text check (payment_method in ('CASH', 'BANK'));

create index if not exists payments_payment_method_idx on public.payments(payment_method);
