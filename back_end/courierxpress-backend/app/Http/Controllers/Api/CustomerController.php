<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Shipment;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('customer_code', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->orderBy('customer_id', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:100',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'address_line' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
        ], [
            'full_name.required' => 'Customer name is required.',
        ]);

        $nextCustomerId = (Customer::max('customer_id') ?? 0) + 1;
        $customerCode = 'CUS' . str_pad($nextCustomerId, 3, '0', STR_PAD_LEFT);

        $customer = Customer::create([
            'customer_code' => $customerCode,
            'full_name' => trim($data['full_name']),
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'address_line' => $data['address_line'] ?? null,
            'city' => $data['city'] ?? null,
            'country' => $data['country'] ?? 'Vietnam',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json($customer, 201);
    }

    public function update(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:100',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'address_line' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
        ], [
            'full_name.required' => 'Customer name is required.',
        ]);

        $customer->full_name = trim($data['full_name']);
        $customer->email = $data['email'] ?? null;
        $customer->phone = $data['phone'] ?? null;
        $customer->address_line = $data['address_line'] ?? null;
        $customer->city = $data['city'] ?? null;
        $customer->country = $data['country'] ?? 'Vietnam';
        $customer->updated_at = now();
        $customer->save();

        return response()->json([
            'success' => true,
            'message' => 'Customer updated successfully.',
            'customer' => $customer,
        ]);
    }

    public function destroy(Customer $customer)
    {
        $isUsedInShipment = Shipment::where('sender_customer_id', $customer->customer_id)
            ->orWhere('receiver_customer_id', $customer->customer_id)
            ->exists();

        if ($isUsedInShipment) {
            return response()->json([
                'success' => false,
                'message' => 'This customer cannot be deleted because it is already used in shipments.',
            ], 409);
        }

        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer deleted successfully.',
        ]);
    }
}