<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('username', 'like', "%$search%");
            });
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        } else {
            // Default to only AGENTS for this specific management view if no role specified
            $query->where('role', 'AGENT');
        }

        return response()->json($query->with('branch')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string|unique:users',
            'password' => 'required|string|min:6',
            'full_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|max:20|unique:users',
            'role' => 'required|in:ADMIN,AGENT,CUSTOMER',
            'branch_id' => 'nullable|integer|exists:branches,branch_id'
        ]);

        $data['password_hash'] = Hash::make($data['password']);
        unset($data['password']);
        $data['is_active'] = 1;
        $data['created_at'] = now();
        $user = User::create($data);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->load('branch')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'full_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email,' . $id . ',user_id',
            'phone' => 'required|string|max:20|unique:users,phone,' . $id . ',user_id',
            'role' => 'required|in:ADMIN,AGENT,CUSTOMER',
            'branch_id' => 'nullable|integer|exists:branches,branch_id'
        ]);

        if ($request->filled('password')) {
            $data['password_hash'] = Hash::make($request->password);
        }
        $data['updated_at'] = now();

        $user->update($data);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->load('branch')
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting yourself
        // (In a real app, you'd check auth()->id())
        
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
