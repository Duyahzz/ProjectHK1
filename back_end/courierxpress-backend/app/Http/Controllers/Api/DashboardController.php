<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Shipment;

class DashboardController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $start = $request->start_date;
        $end = $request->end_date;
        $branchId = $request->branch_id;

        $shipmentBase = Shipment::query();
        if ($branchId) {
            $shipmentBase->where('origin_branch_id', $branchId);
        }
        if ($start) {
            $shipmentBase->where('booking_date', '>=', $start . ' 00:00:00');
        }
        if ($end) {
            $shipmentBase->where('booking_date', '<=', $end . ' 23:59:59');
        }

        $totalShipments = (clone $shipmentBase)->count();
        $booked = (clone $shipmentBase)->whereIn('current_status', ['BOOKED', 'PENDING'])->count();
        $inTransit = (clone $shipmentBase)->whereIn('current_status', ['IN_TRANSIT', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'SHIPMENT_ARRIVED'])->count();
        $delivered = (clone $shipmentBase)->where('current_status', 'DELIVERED')->count();
        $cancelled = (clone $shipmentBase)->where('current_status', 'CANCELLED')->count();
        
        $billBase = Bill::query();
        if ($branchId) {
            $billBase->whereHas('shipment', function($q) use ($branchId) {
                $q->where('origin_branch_id', $branchId);
            });
        }
        if ($start) {
            $billBase->where('issued_at', '>=', $start . ' 00:00:00');
        }
        if ($end) {
            $billBase->where('issued_at', '<=', $end . ' 23:59:59');
        }

        $revenue = (clone $billBase)->sum('total_amount');
        $unpaidBills = (clone $billBase)->where('payment_status', 'UNPAID')->count();
        $totalBills = (clone $billBase)->count();

        return response()->json([
            'total_shipments' => $totalShipments,
            'booked' => $booked,
            'in_transit' => $inTransit,
            'delivered' => $delivered,
            'cancelled' => $cancelled,
            'revenue' => (float)$revenue,
            'unpaid_bills' => $unpaidBills,
            'total_bills' => $totalBills,
        ]);
    }
}
