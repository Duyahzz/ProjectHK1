<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\Customer;
use App\Models\ShipmentStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ShipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Shipment::with(['sender', 'receiver', 'shipmentType', 'branch', 'agent', 'bill']);

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('current_status', $request->status);
        }

        if ($request->filled('branch_id')) {
            $query->where('origin_branch_id', $request->branch_id);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('booking_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('booking_date', '<=', $request->end_date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('tracking_number', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->orderBy('shipment_id', 'desc')->paginate(10)
        );
    }

    public function show(Shipment $shipment)
    {
        $shipment->load(['sender', 'receiver', 'shipmentType', 'branch', 'agent', 'statusHistory.updatedBy', 'bill']);
        return response()->json($shipment);
    }

    public function store(Request $request)
    {
        $request->validate([
            // Thông tin người gửi
            'sender_name' => 'required|string|max:100',
            'sender_phone' => 'required|string|max:20',
            'sender_address' => 'required|string|max:250',
            'sender_city' => 'nullable|string|max:100',
            
            // Thông tin người nhận
            'receiver_name' => 'required|string|max:100',
            'receiver_phone' => 'required|string|max:20',
            'receiver_address' => 'required|string|max:250',
            'receiver_city' => 'nullable|string|max:100',

            // Thông tin đơn hàng
            'shipment_type_id' => 'required|integer|exists:shipment_types,shipment_type_id',
            'origin_branch_id' => 'required|integer|exists:branches,branch_id',
            'assigned_agent_id' => 'nullable|integer|exists:users,user_id',
            'weight' => 'required|numeric|min:0.01',
            'total_charge' => 'required|numeric|min:0',
            'parcel_name' => 'nullable|string|max:100',
            'item_description' => 'nullable|string',
            'current_status' => 'nullable|string|max:50',
            'expected_delivery_date' => 'required|date|after_or_equal:today',
            'notes' => 'nullable|string',
        ]);

        // 1. Xử lý người gửi (Sender)
        $sender = Customer::updateOrCreate(
            ['phone' => $request->sender_phone],
            [
                'full_name' => $request->sender_name,
                'address_line' => $request->sender_address,
                'city' => $request->sender_city,
                'customer_code' => Customer::where('phone', $request->sender_phone)->first()->customer_code ?? 'CUS' . time() . 'S',
                'country' => 'Vietnam',
            ]
        );

        // 2. Xử lý người nhận (Receiver)
        $receiver = Customer::updateOrCreate(
            ['phone' => $request->receiver_phone],
            [
                'full_name' => $request->receiver_name,
                'address_line' => $request->receiver_address,
                'city' => $request->receiver_city,
                'customer_code' => Customer::where('phone', $request->receiver_phone)->first()->customer_code ?? 'CUS' . time() . 'R',
                'country' => 'Vietnam',
            ]
        );

        // 3. Tạo đơn hàng
        $shipmentData = [
            'tracking_number' => 'TRK' . now()->format('YmdHis'),
            'sender_customer_id' => $sender->customer_id,
            'receiver_customer_id' => $receiver->customer_id,
            'shipment_type_id' => $request->shipment_type_id,
            'origin_branch_id' => $request->origin_branch_id,
            'assigned_agent_id' => $request->assigned_agent_id,
            'weight' => $request->weight,
            'total_charge' => $request->total_charge,
            'parcel_name' => $request->parcel_name,
            'item_description' => $request->item_description,
            'current_status' => $request->current_status ?? 'BOOKED',
            'booking_date' => now(),
            'notes' => $request->notes,
            'expected_delivery_date' => $request->expected_delivery_date,
            'booking_source' => 'AGENT_COUNTER',
        ];

        $shipment = Shipment::create($shipmentData);

        // 4. Lưu lịch sử trạng thái
        ShipmentStatusHistory::create([
            'shipment_id' => $shipment->shipment_id,
            'status' => $shipment->current_status,
            'status_note' => 'Shipment created via counter',
            'updated_by_user_id' => $request->assigned_agent_id ?? 1,
            'event_time' => now(),
        ]);

        return response()->json(
            $shipment->load(['sender', 'receiver', 'shipmentType', 'branch', 'agent', 'bill']),
            201
        );
    }

    public function updateStatus(Request $request, Shipment $shipment)
    {
        $data = $request->validate([
            'status' => 'required|string|max:50',
            'status_note' => 'nullable|string|max:255',
            'updated_by_user_id' => 'required|integer',
        ]);

        try {
            $shipment->current_status = $data['status'];
            $shipment->save();

            $history = DB::table('shipment_status_history')->insert([
                'shipment_id' => $shipment->shipment_id,
                'status' => $data['status'],
                'status_note' => $data['status_note'] ?? null,
                'updated_by_user_id' => $data['updated_by_user_id'],
                'event_time' => now(),
            ]);

            return response()->json([
                'message' => 'Shipment status updated successfully',
                'shipment' => $shipment->fresh(['sender', 'receiver', 'shipmentType', 'branch', 'agent', 'bill']),
                'history' => DB::table('shipment_status_history')
                    ->where('shipment_id', $shipment->shipment_id)
                    ->orderBy('history_id', 'desc')
                    ->first()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackByNumber(string $tracking)
    {
        $shipment = Shipment::with(['sender', 'receiver', 'shipmentType', 'branch', 'statusHistory.updatedBy', 'bill'])
            ->where('tracking_number', $tracking)
            ->first();

        if (!$shipment) {
            return response()->json(['message' => 'Tracking number not found'], 404);
        }

        return response()->json($shipment);
    }
}
