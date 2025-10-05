// data/dashboardData.ts
export const kpiData = {
  totalOrders: 120,
  inProgress: 45,
  completed: 60,
  delayed: 15,
};

export const manufacturingOrders = [
  { id: 'MO001', product: 'Wooden Table', qty: 10, status: 'In Progress', startDate: '2025-09-15', endDate: '2025-09-22' },
  { id: 'MO002', product: 'Office Chair', qty: 25, status: 'Completed', startDate: '2025-09-10', endDate: '2025-09-18' },
  { id: 'MO003', product: 'Sofa', qty: 5, status: 'Planned', startDate: '2025-09-20', endDate: '2025-09-27' },
  { id: 'MO004', product: 'Dining Table', qty: 8, status: 'Delayed', startDate: '2025-09-12', endDate: '2025-09-19' },
];
