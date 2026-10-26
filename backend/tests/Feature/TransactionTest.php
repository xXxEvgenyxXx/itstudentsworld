<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use DatabaseTransactions;

    public function test_guest_can_get_transaction_types(): void
    {
        $response = $this->getJson('/api/transaction-types');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id', 'name', 'alias']
                 ]);
    }

    public function test_guest_can_get_transaction_statuses(): void
    {
        $response = $this->getJson('/api/transaction-statuses');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id', 'name', 'alias']
                 ]);
    }
}
