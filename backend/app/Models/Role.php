<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'role';
    public $timestamps = false;
    protected $fillable = ['name', 'alias'];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
