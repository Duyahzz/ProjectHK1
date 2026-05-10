<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:100',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => 'required|string|min:6|confirmed',
            'address_line' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
        ], [
            'full_name.required' => 'Full name is required.',
            'username.required' => 'Username is required.',
            'username.unique' => 'This username already exists.',
            'email.required' => 'Email is required.',
            'email.email' => 'Email format is invalid.',
            'email.unique' => 'This email already exists.',
            'phone.required' => 'Phone number is required.',
            'phone.unique' => 'This phone number already exists.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 6 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
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

        try {
            $data = $validator->validated();

            $result = DB::transaction(function () use ($data) {
                $user = User::create([
                    'username' => trim($data['username']),
                    'password_hash' => Hash::make($data['password']),
                    'full_name' => trim($data['full_name']),
                    'email' => trim($data['email']),
                    'phone' => trim($data['phone']),
                    'role' => 'CUSTOMER',
                    'branch_id' => null,
                    'is_active' => 1,
                    'last_login_at' => null,
                ]);

                $nextCustomerId = (Customer::max('customer_id') ?? 0) + 1;
                $customerCode = 'CUS' . str_pad($nextCustomerId, 3, '0', STR_PAD_LEFT);

                Customer::create([
                    'user_id' => $user->user_id,
                    'customer_code' => $customerCode,
                    'full_name' => trim($data['full_name']),
                    'email' => trim($data['email']),
                    'phone' => trim($data['phone']),
                    'address_line' => trim($data['address_line']),
                    'city' => trim($data['city']),
                    'country' => trim($data['country']),
                ]);

                return $user->fresh();
            });

            return response()->json([
                'success' => true,
                'message' => 'Register successful.',
                'user' => $this->formatUser($result),
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Register failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required|string',
            'password' => 'required|string',
        ], [
            'login.required' => 'Username or email is required.',
            'password.required' => 'Password is required.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::with('branch')
            ->where('username', $request->login)
            ->orWhere('email', $request->login)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid username/email or password.',
            ], 401);
        }

        $storedPassword = (string) $user->password_hash;

        $isHashed =
            str_starts_with($storedPassword, '$2y$') ||
            str_starts_with($storedPassword, '$2b$') ||
            str_starts_with($storedPassword, '$argon2i$') ||
            str_starts_with($storedPassword, '$argon2id$');

        if ($isHashed) {
            $passwordOk = Hash::check($request->password, $storedPassword);
        } else {
            $passwordOk = $request->password === $storedPassword;
        }

        if (!$passwordOk) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid username/email or password.',
            ], 401);
        }

        if ((int) $user->is_active !== 1) {
            return response()->json([
                'success' => false,
                'message' => 'This account is inactive.',
            ], 403);
        }

        $user->last_login_at = now();
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'role' => strtoupper($user->role),
            'user' => $this->formatUser($user->fresh('branch')),
        ]);
    }

    public function resetPasswordByPhone(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:50',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'username.required' => 'Username is required.',
            'phone.required' => 'Phone number is required.',
            'password.required' => 'New password is required.',
            'password.min' => 'New password must be at least 6 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('username', trim($request->username))
            ->where('phone', trim($request->phone))
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Username or phone number is incorrect.',
            ], 404);
        }

        if ((int) $user->is_active !== 1) {
            return response()->json([
                'success' => false,
                'message' => 'This account is inactive.',
            ], 403);
        }

        $user->password_hash = Hash::make($request->password);
        $user->updated_at = now();
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successful. Please login again.',
        ]);
    }

    public function logout(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Logout successful.',
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'user_id' => $user->user_id,
            'username' => $user->username,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => strtoupper($user->role),
            'branch_id' => $user->branch_id,
            'branch' => $user->branch,
        ];
    }
}