export const createInitialTracking = () => [
  {
    status: 'placed',
    title: 'Order Placed',
    description: 'Your order has been placed successfully',
    completed: true,
    timestamp: new Date(),
  },
  {
    status: 'confirmed',
    title: 'Supplier Confirmed',
    description: 'Supplier has confirmed your order',
    completed: false,
  },
  {
    status: 'packed',
    title: 'Packed',
    description: 'Materials are being packed at warehouse',
    completed: false,
  },
  {
    status: 'out_for_delivery',
    title: 'Out for Delivery',
    description: 'Your order is on the way',
    completed: false,
  },
  {
    status: 'delivered',
    title: 'Delivered',
    description: 'Order delivered successfully',
    completed: false,
  },
];

export const advanceTracking = (tracking, newStatus) => {
  const statusOrder = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];
  const targetIndex = statusOrder.indexOf(newStatus);
  return tracking.map((step, index) => {
    const stepIndex = statusOrder.indexOf(step.status);
    if (stepIndex <= targetIndex) {
      return { ...step.toObject?.() || step, completed: true, timestamp: step.timestamp || new Date() };
    }
    return step;
  });
};
