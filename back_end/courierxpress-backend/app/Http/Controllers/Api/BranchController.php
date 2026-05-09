<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;

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
        $data = $request->validate([
            'branch_code' => 'required|string|max:20|unique:branches,branch_code',
            'branch_name' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'status' => 'required|string|in:ACTIVE,INACTIVE',
        ], [
            'branch_code.required' => 'Branch code is required.',
            'branch_code.unique' => 'This branch code already exists.',
            'branch_name.required' => 'Branch name is required.',
            'city.required' => 'City is required.',
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be ACTIVE or INACTIVE.',
        ]);

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
        $data = $request->validate([
            'status' => 'required|string|in:ACTIVE,INACTIVE',
        ], [
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be ACTIVE or INACTIVE.',
        ]);

        $branch = Branch::find($branchId);

        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Branch not found.',
            ], 404);
        }

        $branch->status = $data['status'];
        $branch->save();

        return response()->json([
            'success' => true,
            'message' => 'Branch status updated successfully.',
            'branch' => $branch,
        ]);
    }
}