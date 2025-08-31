import { getToday, computeAmount } from './storage.js'

export function getDummyData() {
  const today = getToday()
  
  const dummyParties = [
    { id: crypto.randomUUID(), name: 'Royal Florist', phone: '9876543210', address: 'MG Road, Pune', notes: 'Premium flower shop' },
    { id: crypto.randomUUID(), name: 'Bloom Mart', phone: '9823456780', address: 'Park St, Kolkata', notes: 'Bulk orders specialist' },
    { id: crypto.randomUUID(), name: 'Petal Point', phone: '9898989898', address: 'Brigade Rd, Bengaluru', notes: 'Wedding arrangements' },
    { id: crypto.randomUUID(), name: 'Green Leaf Co.', phone: '9812345678', address: 'Connaught Pl, Delhi', notes: 'Corporate events' },
    { id: crypto.randomUUID(), name: 'Rose & Buds', phone: '9765432198', address: 'Marine Drive, Mumbai', notes: 'Wholesale supplier' },
    { id: crypto.randomUUID(), name: 'City Florals', phone: '9654321087', address: 'Anna Salai, Chennai', notes: 'Retail chain' },
    { id: crypto.randomUUID(), name: 'Petal Plaza', phone: '9543210876', address: 'Sector 17, Chandigarh', notes: 'Event decorator' },
    { id: crypto.randomUUID(), name: 'Fresh Petals', phone: '9432109765', address: 'Civil Lines, Jaipur', notes: 'Temple supplier' }
  ]

  const dummyItems = [
    { id: crypto.randomUUID(), name: 'Rose Flowers', unit: 'kgs', rate: 180, notes: 'Fresh red roses' },
    { id: crypto.randomUUID(), name: 'Marigold Flowers', unit: 'kgs', rate: 120, notes: 'Temple variety' },
    { id: crypto.randomUUID(), name: 'Jasmine Garland', unit: 'bunch', rate: 45, notes: 'Traditional garlands' },
    { id: crypto.randomUUID(), name: 'Lotus Petals', unit: 'kgs', rate: 350, notes: 'Premium quality' },
    { id: crypto.randomUUID(), name: 'Filler Greens', unit: 'bags', rate: 80, notes: 'Mixed green leaves' },
    { id: crypto.randomUUID(), name: 'Chrysanthemum', unit: 'kgs', rate: 95, notes: 'White and yellow' },
    { id: crypto.randomUUID(), name: 'Tuberose', unit: 'bunch', rate: 65, notes: 'Fragrant flowers' },
    { id: crypto.randomUUID(), name: 'Carnation Mix', unit: 'kgs', rate: 220, notes: 'Imported variety' }
  ]

  const dummyTodayData = [
    { party: 'Royal Florist', item: 'Rose Flowers', qty: 5, rate: 180, mode: 'UPI', status: 'Completed', unit: 'kgs' },
    { party: 'Bloom Mart', item: 'Marigold Flowers', qty: 8, rate: 120, mode: 'Cash', status: 'Pending', unit: 'kgs' },
    { party: 'Petal Point', item: 'Jasmine Garland', qty: 12, rate: 45, mode: 'UPI', status: 'Completed', unit: 'bunch' },
    { party: 'Green Leaf Co.', item: 'Filler Greens', qty: 6, rate: 80, mode: 'Card', status: 'Processing', unit: 'bags' },
    { party: 'Rose & Buds', item: 'Rose Flowers', qty: 15, rate: 180, mode: 'UPI', status: 'Completed', unit: 'kgs' },
    { party: 'City Florals', item: 'Chrysanthemum', qty: 4, rate: 95, mode: 'Cash', status: 'Pending', unit: 'kgs' },
    { party: 'Petal Plaza', item: 'Carnation Mix', qty: 3, rate: 220, mode: 'Card', status: 'Completed', unit: 'kgs' },
    { party: 'Fresh Petals', item: 'Lotus Petals', qty: 2, rate: 350, mode: 'UPI', status: 'Processing', unit: 'kgs' }
  ].map(row => ({
    id: crypto.randomUUID(),
    date: today,
    ...row,
    amount: computeAmount({ qty: row.qty, rate: row.rate })
  }))

  const dummyTransactionData = [
    { party: 'Royal Florist', item: 'Rose Flowers', qty: 10, rate: 180, mode: 'UPI', status: 'Completed', unit: 'kgs' },
    { party: 'Bloom Mart', item: 'Marigold Flowers', qty: 25, rate: 120, mode: 'Cash', status: 'Pending', unit: 'kgs' },
    { party: 'Petal Point', item: 'Jasmine Garland', qty: 50, rate: 45, mode: 'UPI', status: 'Completed', unit: 'bunch' },
    { party: 'Green Leaf Co.', item: 'Filler Greens', qty: 20, rate: 80, mode: 'Card', status: 'Cancelled', unit: 'bags' },
    { party: 'Rose & Buds', item: 'Rose Flowers', qty: 100, rate: 180, mode: 'UPI', status: 'Completed', unit: 'kgs' },
    { party: 'City Florals', item: 'Chrysanthemum', qty: 15, rate: 95, mode: 'Cash', status: 'Pending', unit: 'kgs' },
    { party: 'Petal Plaza', item: 'Tuberose', qty: 8, rate: 65, mode: 'Card', status: 'Completed', unit: 'bunch' },
    { party: 'Fresh Petals', item: 'Lotus Petals', qty: 5, rate: 350, mode: 'UPI', status: 'Processing', unit: 'kgs' },
    { party: 'Royal Florist', item: 'Carnation Mix', qty: 7, rate: 220, mode: 'UPI', status: 'Completed', unit: 'kgs' },
    { party: 'Bloom Mart', item: 'Jasmine Garland', qty: 30, rate: 45, mode: 'Cash', status: 'Completed', unit: 'bunch' }
  ].map(row => ({
    id: crypto.randomUUID(),
    date: today,
    ...row,
    amount: computeAmount({ qty: row.qty, rate: row.rate })
  }))

  return {
    parties: dummyParties,
    items: dummyItems,
    today: dummyTodayData,
    transactions: dummyTransactionData
  }
}
