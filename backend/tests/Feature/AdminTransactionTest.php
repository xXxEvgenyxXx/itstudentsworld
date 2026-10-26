<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Transaction;
use App\Models\TransactionStatus;
use App\Models\TransactionType;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminTransactionTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        Transaction::query()->delete();
    }

    private function getAdmin(): User
    {
        $role = Role::where('alias', 'admin')->firstOrFail();
        return User::factory()->create(['role_id' => $role->id]);
    }

    private function createTransaction(User $user, string $typeAlias, string $statusAlias, float $amount = 100): Transaction
    {
        $type = TransactionType::where('alias', $typeAlias)->firstOrFail();
        $status = TransactionStatus::where('alias', $statusAlias)->firstOrFail();

        return Transaction::create([
            'user_id' => $user->id,
            'amount' => $amount,
            'type_id' => $type->id,
            'status_id' => $status->id,
            'created_at' => now(),
        ]);
    }

    // 1. Доступ к списку транзакций (RBAC)

    public function test_guest_cannot_access_transactions_list(): void
    {
        $this->getJson('/api/admin/transactions')->assertStatus(401);
    }

    public function test_regular_user_cannot_access_transactions_list(): void
    {
        $user = $this->createUserWithBalance();
        $this->actingAs($user)->getJson('/api/admin/transactions')->assertStatus(403);
    }

    public function test_admin_can_access_transactions_list(): void
    {
        $admin = $this->getAdmin();
        $this->createTransaction($admin, 'deposit', 'success');

        $response = $this->actingAs($admin)->getJson('/api/admin/transactions');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id', 'user_id', 'amount', 'type', 'status', 'user', 'created_at'
                         ]
                     ],
                     'total', 'current_page'
                 ]);
    }

    // 2. Проверка фильтров (Бизнес-логика)

    public function test_transactions_can_be_filtered_by_status(): void
    {
        $admin = $this->getAdmin();

        // Создаем две транзакции: успешную и упавшую
        $this->createTransaction($admin, 'deposit', 'success');
        $failedTx = $this->createTransaction($admin, 'purchase', 'failed');

        // Фильтруем только по failed
        $response = $this->actingAs($admin)->getJson('/api/admin/transactions?status=failed');

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJsonPath('data.0.id', $failedTx->id)
                 ->assertJsonPath('data.0.status.alias', 'failed');
    }

    public function test_transactions_can_be_filtered_by_type(): void
    {
        $admin = $this->getAdmin();

        // Создаем транзакции разных типов
        $this->createTransaction($admin, 'deposit', 'success');
        $purchaseTx = $this->createTransaction($admin, 'purchase', 'success');

        // Фильтруем только по purchase
        $response = $this->actingAs($admin)->getJson('/api/admin/transactions?type=purchase');

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJsonPath('data.0.id', $purchaseTx->id)
                 ->assertJsonPath('data.0.type.alias', 'purchase');
    }
}
