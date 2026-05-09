<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $table = 'branches';
    protected $primaryKey = 'branch_id';
    public $timestamps = false;

    protected $fillable = [
        'branch_code',
        'branch_name',
        'city',
        'phone',
        'email',
        'status',
    ];
}