export const branches = [
  { branch_id: 1, branch_code: "BR001", branch_name: "Ho Chi Minh Branch", city: "Ho Chi Minh City", status: "ACTIVE", phone: "0901000001", email: "hcm@courierxpress.com" },
  { branch_id: 2, branch_code: "BR002", branch_name: "Ha Noi Branch", city: "Ha Noi", status: "ACTIVE", phone: "0901000002", email: "hanoi@courierxpress.com" },
  { branch_id: 3, branch_code: "BR003", branch_name: "Da Nang Branch", city: "Da Nang", status: "ACTIVE", phone: "0901000003", email: "danang@courierxpress.com" },
];

export const users = [
  { user_id: 1, username: "admin01", full_name: "System Admin", email: "admin@courierxpress.com", phone: "0911000001", role: "ADMIN", branch_id: 1, is_active: true },
  { user_id: 2, username: "agent_hcm", full_name: "Nguyen Van A", email: "agent_hcm@courierxpress.com", phone: "0911000002", role: "AGENT", branch_id: 1, is_active: true },
  { user_id: 3, username: "agent_hn", full_name: "Tran Thi B", email: "agent_hn@courierxpress.com", phone: "0911000003", role: "AGENT", branch_id: 2, is_active: true },
  { user_id: 4, username: "cust_minh", full_name: "Le Minh", email: "minh@gmail.com", phone: "0911000004", role: "CUSTOMER", branch_id: null, is_active: true },
];

export const customers = [
  { customer_id: 1, user_id: 4, customer_code: "CUS001", full_name: "Le Minh", email: "minh@gmail.com", phone: "0911000004", address_line: "12 Le Loi Street", city: "Ho Chi Minh City", country: "Vietnam" },
  { customer_id: 2, user_id: null, customer_code: "CUS002", full_name: "Pham Lan", email: "lan@gmail.com", phone: "0911000005", address_line: "25 Hai Ba Trung Street", city: "Ha Noi", country: "Vietnam" },
  { customer_id: 3, user_id: null, customer_code: "CUS003", full_name: "Vo Huy", email: "huy@gmail.com", phone: "0911000006", address_line: "88 Bach Dang Street", city: "Da Nang", country: "Vietnam" },
  { customer_id: 4, user_id: null, customer_code: "CUS004", full_name: "Nguyen Thi Hoa", email: "hoa@gmail.com", phone: "0911000007", address_line: "91 Dien Bien Phu Street", city: "Can Tho", country: "Vietnam" },
  { customer_id: 5, user_id: null, customer_code: "CUS005", full_name: "Tran Quoc Nam", email: "nam@gmail.com", phone: "0911000008", address_line: "44 Hung Vuong Street", city: "Hai Phong", country: "Vietnam" },
];

export const shipmentTypes = [
  { shipment_type_id: 1, type_name: "Document", description: "Important document delivery", base_rate: 30000 },
  { shipment_type_id: 2, type_name: "Parcel", description: "Normal parcel delivery", base_rate: 50000 },
  { shipment_type_id: 3, type_name: "Express", description: "Fast express delivery", base_rate: 80000 },
];

export const shipments = [
  { shipment_id: 1, tracking_number: "TRK001", sender_customer_id: 1, receiver_customer_id: 2, shipment_type_id: 1, origin_branch_id: 1, assigned_agent_id: 2, weight: 0.5, total_charge: 35000, current_status: "BOOKED", booking_date: "2026-04-10 09:00", expected_delivery_date: "2026-04-12", notes: "Handle with care" },
  { shipment_id: 2, tracking_number: "TRK002", sender_customer_id: 2, receiver_customer_id: 3, shipment_type_id: 2, origin_branch_id: 2, assigned_agent_id: 3, weight: 1.2, total_charge: 60000, current_status: "IN_TRANSIT", booking_date: "2026-04-11 10:30", expected_delivery_date: "2026-04-13", notes: "Normal parcel" },
  { shipment_id: 3, tracking_number: "TRK003", sender_customer_id: 3, receiver_customer_id: 4, shipment_type_id: 3, origin_branch_id: 3, assigned_agent_id: 2, weight: 2.5, total_charge: 90000, current_status: "DELIVERED", booking_date: "2026-04-09 08:15", expected_delivery_date: "2026-04-10", notes: "Urgent shipment" },
  { shipment_id: 4, tracking_number: "TRK004", sender_customer_id: 1, receiver_customer_id: 5, shipment_type_id: 2, origin_branch_id: 1, assigned_agent_id: 2, weight: 3.0, total_charge: 70000, current_status: "CANCELLED", booking_date: "2026-04-12 14:00", expected_delivery_date: "2026-04-15", notes: "Customer cancelled" },
];

export const shipmentStatusHistory = [
  { history_id: 1, shipment_id: 1, status: "BOOKED", status_note: "Shipment created successfully", updated_by_user_id: 2, event_time: "2026-04-10 09:00" },
  { history_id: 2, shipment_id: 2, status: "BOOKED", status_note: "Shipment booked at branch", updated_by_user_id: 3, event_time: "2026-04-11 10:30" },
  { history_id: 3, shipment_id: 2, status: "IN_TRANSIT", status_note: "Shipment is on the way", updated_by_user_id: 3, event_time: "2026-04-11 15:00" },
  { history_id: 4, shipment_id: 3, status: "BOOKED", status_note: "Shipment booked", updated_by_user_id: 2, event_time: "2026-04-09 08:15" },
  { history_id: 5, shipment_id: 3, status: "IN_TRANSIT", status_note: "Shipment left branch", updated_by_user_id: 2, event_time: "2026-04-09 12:00" },
  { history_id: 6, shipment_id: 3, status: "DELIVERED", status_note: "Shipment delivered successfully", updated_by_user_id: 2, event_time: "2026-04-10 16:30" },
];

export const bills = [
  { bill_id: 1, bill_number: "BILL001", shipment_id: 1, subtotal: 30000, tax_amount: 5000, discount_amount: 0, total_amount: 35000, payment_status: "PAID", payment_method: "CASH", issued_at: "2026-04-10 09:05" },
  { bill_id: 2, bill_number: "BILL002", shipment_id: 2, subtotal: 50000, tax_amount: 10000, discount_amount: 0, total_amount: 60000, payment_status: "UNPAID", payment_method: "BANK_TRANSFER", issued_at: "2026-04-11 10:35" },
  { bill_id: 3, bill_number: "BILL003", shipment_id: 3, subtotal: 80000, tax_amount: 10000, discount_amount: 0, total_amount: 90000, payment_status: "PAID", payment_method: "CARD", issued_at: "2026-04-09 08:20" },
];
