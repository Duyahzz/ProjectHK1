<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BranchController extends Controller
{
    public function index()
    {
        return response()->json(
            Branch::orderBy('branch_id', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_code' => 'required|string|max:20|unique:branches,branch_code',
            'branch_name' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20|unique:branches,phone',
            'email' => 'nullable|email|max:100|ends_with:@gmail.com|unique:branches,email',
            'status' => 'required|string|in:ACTIVE,INACTIVE',
        ], [
            'branch_code.required' => 'Branch code is required.',
            'branch_code.unique' => 'This branch code already exists.',
            'branch_name.required' => 'Branch name is required.',
            'city.required' => 'City is required.',
            'phone.unique' => 'This phone number already exists.',
            'email.unique' => 'This email already exists.',
            'email.ends_with' => 'Email must be a @gmail.com address.',
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be ACTIVE or INACTIVE.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $branch = Branch::create([
            'branch_code' => trim($data['branch_code']),
            'branch_name' => trim($data['branch_name']),
            'city' => trim($data['city']),
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'status' => $data['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Branch created successfully.',
            'branch' => $branch,
        ], 201);
    }

    public function updateStatus(Request $request, $branchId)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:ACTIVE,INACTIVE',
        ], [
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be ACTIVE or INACTIVE.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $branch = Branch::find($branchId);

        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Branch not found.',
            ], 404);
        }

        $branch->status = $validator->validated()['status'];
        $branch->save();

        return response()->json([
            'success' => true,
            'message' => 'Branch status updated successfully.',
            'branch' => $branch,
        ]);
    }
}