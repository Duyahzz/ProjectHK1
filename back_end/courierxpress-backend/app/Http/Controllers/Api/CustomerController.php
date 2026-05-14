<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

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
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'phone' => 'required|string|max:20|unique:customers,phone',
            'address_line' => 'required|string|max:250',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
        ], [
            'full_name.required' => 'Customer name is required.',
            'email.required' => 'Email is required.',
            'email.email' => 'Email format is invalid.',
            'phone.required' => 'Phone number is required.',
            'phone.unique' => 'This phone number already exists.',
            'address_line.required' => 'Address is required.',
            'city.required' => 'City is required.',
            'country.required' => 'Country is required.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $nextCustomerId = (Customer::max('customer_id') ?? 0) + 1;
        $customerCode = 'CUS' . str_pad($nextCustomerId, 3, '0', STR_PAD_LEFT);

        $customer = Customer::create([
            'customer_code' => $customerCode,
            'full_name' => trim($data['full_name']),
            'email' => trim($data['email']),
            'phone' => trim($data['phone']),
            'address_line' => trim($data['address_line']),
            'city' => trim($data['city']),
            'country' => trim($data['country']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Customer created successfully.',
            'customer' => $customer,
        ], 201);
    }

    public function update(Request $request, Customer $customer)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('customers', 'phone')->ignore($customer->customer_id, 'customer_id'),
            ],
            'address_line' => 'required|string|max:250',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
        ], [
            'full_name.required' => 'Customer name is required.',
            'email.required' => 'Email is required.',
            'email.email' => 'Email format is invalid.',
            'phone.required' => 'Phone number is required.',
            'phone.unique' => 'This phone number already exists.',
            'address_line.required' => 'Address is required.',
            'city.required' => 'City is required.',
            'country.required' => 'Country is required.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $customer->full_name = trim($data['full_name']);
        $customer->email = trim($data['email']);
        $customer->phone = trim($data['phone']);
        $customer->address_line = trim($data['address_line']);
        $customer->city = trim($data['city']);
        $customer->country = trim($data['country']);
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