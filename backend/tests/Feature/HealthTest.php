<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class HealthTest extends TestCase
{
    use DatabaseTransactions;

    public function test_health_check_returns_ok_status(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'ok',
                     'database' => 'connected',
                 ])
                 ->assertJsonStructure([
                     'status',
                     'database',
                     'timestamp'
                 ]);
    }
}
