import { getToday, computeAmount } from './storage.js'

export function getDummyData() {
  const today = getToday()

  const dummyParties = [
    {
      id: crypto.randomUUID(),
      name: 'Royal Florist',
      phone: '9876543210',
      address: 'MG Road, Pune',
      notes: 'Premium flower shop',
      drivers: [
        { id: crypto.randomUUID(), name: 'Rajesh Kumar', mobile: '9876543211', isEditing: false },
        { id: crypto.randomUUID(), name: 'Amit Singh', mobile: '9876543212', isEditing: false }
      ]
    },
    {
      id: crypto.randomUUID(),
      name: 'Bloom Mart',
      phone: '9823456780',
      address: 'Park St, Kolkata',
      notes: 'Bulk orders specialist',
      drivers: [
        { id: crypto.randomUUID(), name: 'Suresh Pal', mobile: '9823456781', isEditing: false },
        { id: crypto.randomUUID(), name: 'Vikram Das', mobile: '9823456782', isEditing: false },
        { id: crypto.randomUUID(), name: 'Ravi Sharma', mobile: '9823456783', isEditing: false }
      ]
    },
    {
      id: crypto.randomUUID(),
      name: 'Petal Point',
      phone: '9898989898',
      address: 'Brigade Rd, Bengaluru',
      notes: 'Wedding arrangements',
      drivers: [
        { id: crypto.randomUUID(), name: 'Mohan Reddy', mobile: '9898989899', isEditing: false }
      ]
    },
    {
      id: crypto.randomUUID(),
      name: 'Green Leaf Co.',
      phone: '9812345678',
      address: 'Connaught Pl, Delhi',
      notes: 'Corporate events',
      drivers: [
        { id: crypto.randomUUID(), name: 'Deepak Gupta', mobile: '9812345679', isEditing: false },
        { id: crypto.randomUUID(), name: 'Ashok Verma', mobile: '9812345680', isEditing: false }
      ]
    },
    {
      id: crypto.randomUUID(),
      name: 'Rose & Buds',
      phone: '9765432198',
      address: 'Marine Drive, Mumbai',
      notes: 'Wholesale supplier',
      drivers: [
        { id: crypto.randomUUID(), name: 'Santosh Patil', mobile: '9765432199', isEditing: false },
        { id: crypto.randomUUID(), name: 'Ganesh More', mobile: '9765432200', isEditing: false },
        { id: crypto.randomUUID(), name: 'Prakash Jadhav', mobile: '9765432201', isEditing: false }
      ]
    },
    {
      id: crypto.randomUUID(),
      name: 'City Florals',
      phone: '9654321087',
      address: 'Anna Salai, Chennai',
      notes: 'Retail chain',
      drivers: [
        { id: crypto.randomUUID(), name: 'Murugan S', mobile: '9654321088', isEditing: false }
      ]
    },
    {
      id: crypto.randomUUID(),
      name: 'Petal Plaza',
      phone: '9543210876',
      address: 'Sector 17, Chandigarh',
      notes: 'Event decorator',
      drivers: [
        { id: crypto.randomUUID(), name: 'Harpreet Singh', mobile: '9543210877', isEditing: false },
        { id: crypto.randomUUID(), name: 'Jasbir Kaur', mobile: '9543210878', isEditing: false }
      ]
    },
    {
      id: crypto.randomUUID(),
      name: 'Fresh Petals',
      phone: '9432109765',
      address: 'Civil Lines, Jaipur',
      notes: 'Temple supplier',
      drivers: [
        { id: crypto.randomUUID(), name: 'Ramesh Joshi', mobile: '9432109766', isEditing: false },
        { id: crypto.randomUUID(), name: 'Dinesh Agarwal', mobile: '9432109767', isEditing: false },
        { id: crypto.randomUUID(), name: 'Mahesh Gupta', mobile: '9432109768', isEditing: false },
        { id: crypto.randomUUID(), name: 'Naresh Kumar', mobile: '9432109769', isEditing: false }
      ]
    }
  ]

  const dummyVendors = [
    { id: crypto.randomUUID(), name: 'Sunrise Fertilizers', phone: '9876543220', address: 'Industrial Area, Pune' },
    { id: crypto.randomUUID(), name: 'Green Valley Seeds', phone: '9823456790', address: 'Agricultural Market, Kolkata' },
    { id: crypto.randomUUID(), name: 'Organic Solutions', phone: '9898989808', address: 'Whitefield, Bengaluru' },
    { id: crypto.randomUUID(), name: 'Farm Tech Equipment', phone: '9812345688', address: 'Karol Bagh, Delhi' },
    { id: crypto.randomUUID(), name: 'Pesticide Plus', phone: '9765432108', address: 'Andheri, Mumbai' },
    { id: crypto.randomUUID(), name: 'Soil Care Products', phone: '9654321097', address: 'T. Nagar, Chennai' },
    { id: crypto.randomUUID(), name: 'Irrigation Systems', phone: '9543210886', address: 'Industrial Area, Chandigarh' },
    { id: crypto.randomUUID(), name: 'Harvest Tools', phone: '9432109775', address: 'Malviya Nagar, Jaipur' }
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
    { party: 'Royal Florist', vendor: 'Sunrise Fertilizers', driver: 'Rajesh Kumar', item: 'Rose Flowers', qty: 5, groupRate: 180, vendorRate: 200, luggage: 50, mode: 'UPI', status: 'Completed', unit: 'kgs' },
    { party: 'Bloom Mart', vendor: 'Green Valley Seeds', driver: 'Suresh Pal', item: 'Marigold Flowers', qty: 8, groupRate: 120, vendorRate: 140, luggage: 30, mode: 'Cash', status: 'Pending', unit: 'kgs' },
    { party: 'Petal Point', vendor: 'Organic Solutions', driver: 'Mohan Reddy', item: 'Jasmine Garland', qty: 12, groupRate: 45, vendorRate: 55, luggage: 25, mode: 'UPI', status: 'Completed', unit: 'bunch' },
    { party: 'Green Leaf Co.', vendor: 'Organic Solutions', driver: 'Deepak Gupta', item: 'Filler Greens', qty: 6, groupRate: 80, vendorRate: 95, luggage: 40, mode: 'Card', status: 'Processing', unit: 'bags' },
    { party: 'Rose & Buds', vendor: 'Farm Tech Equipment', driver: 'Santosh Patil', item: 'Rose Flowers', qty: 15, groupRate: 180, vendorRate: 210, luggage: 75, mode: 'UPI', status: 'Completed', unit: 'kgs' },
    { party: 'City Florals', vendor: 'Pesticide Plus', driver: 'Murugan S', item: 'Chrysanthemum', qty: 4, groupRate: 95, vendorRate: 115, luggage: 20, mode: 'Cash', status: 'Pending', unit: 'kgs' },
    { party: 'Petal Plaza', vendor: 'Pesticide Plus', driver: 'Harpreet Singh', item: 'Carnation Mix', qty: 3, groupRate: 220, vendorRate: 250, luggage: 35, mode: 'Card', status: 'Completed', unit: 'kgs' },
    { party: 'Fresh Petals', vendor: 'Soil Care Products', driver: 'Ramesh Joshi', item: 'Lotus Petals', qty: 2, groupRate: 350, vendorRate: 380, luggage: 60, mode: 'UPI', status: 'Processing', unit: 'kgs' }
  ].map(row => ({
    id: crypto.randomUUID(),
    date: today,
    ...row,
    rate: row.groupRate, // Keep for backward compatibility
    amount: computeAmount({ qty: row.qty, rate: row.groupRate, luggage: row.luggage })
  }))

  const dummyTransactionData = [
    { party: 'Royal Florist', vendor: 'Sunrise Fertilizers', driver: 'Rajesh Kumar', item: 'Rose Flowers', qty: 10, groupRate: 180, vendorRate: 200, luggage: 80, mode: 'UPI', status: 'Completed', unit: 'kgs' },
    { party: 'Bloom Mart', vendor: 'Green Valley Seeds', driver: 'Suresh Pal', item: 'Marigold Flowers', qty: 25, groupRate: 120, vendorRate: 140, luggage: 120, mode: 'Cash', status: 'Pending', unit: 'kgs' },
    { party: 'Petal Point', vendor: 'Organic Solutions', driver: 'Mohan Reddy', item: 'Jasmine Garland', qty: 50, groupRate: 45, vendorRate: 55, luggage: 100, mode: 'UPI', status: 'Completed', unit: 'bunch' },
    { party: 'Green Leaf Co.', vendor: 'Organic Solutions', driver: 'Deepak Gupta', item: 'Filler Greens', qty: 20, groupRate: 80, vendorRate: 95, luggage: 90, mode: 'Card', status: 'Cancelled', unit: 'bags' },
    { party: 'Rose & Buds', vendor: 'Farm Tech Equipment', driver: 'Santosh Patil', item: 'Rose Flowers', qty: 100, groupRate: 180, vendorRate: 210, luggage: 200, mode: 'UPI', status: 'Completed', unit: 'kgs' },
    { party: 'City Florals', vendor: 'Pesticide Plus', driver: 'Murugan S', item: 'Chrysanthemum', qty: 15, groupRate: 95, vendorRate: 115, luggage: 65, mode: 'Cash', status: 'Pending', unit: 'kgs' },
    { party: 'Petal Plaza', vendor: 'Pesticide Plus', driver: 'Harpreet Singh', item: 'Tuberose', qty: 8, groupRate: 65, vendorRate: 80, luggage: 45, mode: 'Card', status: 'Completed', unit: 'bunch' },
    { party: 'Fresh Petals', vendor: 'Soil Care Products', driver: 'Ramesh Joshi', item: 'Lotus Petals', qty: 5, groupRate: 350, vendorRate: 380, luggage: 150, mode: 'UPI', status: 'Processing', unit: 'kgs' },
    { party: 'Royal Florist', vendor: 'Irrigation Systems', driver: 'Amit Singh', item: 'Carnation Mix', qty: 7, groupRate: 220, vendorRate: 250, luggage: 85, mode: 'UPI', status: 'Completed', unit: 'kgs' },
    { party: 'Bloom Mart', vendor: 'Harvest Tools', driver: 'Vikram Das', item: 'Jasmine Garland', qty: 30, groupRate: 45, vendorRate: 55, luggage: 70, mode: 'Cash', status: 'Completed', unit: 'bunch' }
  ].map(row => ({
    id: crypto.randomUUID(),
    date: today,
    ...row,
    rate: row.groupRate, // Keep for backward compatibility
    amount: computeAmount({ qty: row.qty, rate: row.groupRate, luggage: row.luggage })
  }))

  const dummyAdvanceData = [
    { id: crypto.randomUUID(), party: 'Royal Florist', date: today, advance: 5000 },
    { id: crypto.randomUUID(), party: 'Royal Florist', date: '2025-02-20', advance: 3000 },
    { id: crypto.randomUUID(), party: 'Bloom Mart', date: today, advance: 8000 },
    { id: crypto.randomUUID(), party: 'Bloom Mart', date: '2025-02-19', advance: 4500 }
  ]

  return {
    parties: dummyParties,
    vendors: dummyVendors,
    items: dummyItems,
    today: dummyTodayData,
    transactions: dummyTransactionData,
    advances: dummyAdvanceData
  }
}
