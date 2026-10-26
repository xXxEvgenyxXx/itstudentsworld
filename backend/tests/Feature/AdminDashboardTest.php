<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Models\Transaction;
use App\Models\TransactionType;
use App\Models\TransactionStatus;
use App\Models\CosmeticItem;
use App\Models\CosmeticType;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use DatabaseTransactions;

    private function getAdmin(): User
    {
        $role = Role::where('alias', 'admin')->firstOrFail();
        return User::factory()->create(['role_id' => $role->id]);
    }

    public function test_guest_cannot_access_statistics(): void
    {
        $this->getJson('/api/admin/dashboard')->assertStatus(401);
    }

    public function test_regular_user_cannot_access_statistics(): void
    {
        $user = $this->createUserWithBalance();
        $this->actingAs($user)->getJson('/api/admin/dashboard')->assertStatus(403);
    }

    public function test_dashboard_returns_correct_statistics(): void
    {
        $admin = $this->getAdmin();

        // Очищаем транзакции, чтобы assertJsonCount(2) работал корректно
        Transaction::query()->delete();

        // 1. Запоминаем, сколько данных уже есть в БД (до наших манипуляций)
        $initialUsers = User::count();
        $initialBanned = User::where('is_banned', true)->count();
        $initialAdmins = User::whereHas('role', fn($q) => $q->whereIn('alias', ['admin', 'owner']))->count();

        // Транзакции теперь 0
        $initialTransactions = 0;
        $initialFailed = 0;
        $initialRevenue = 0;

        // 2. Подготовка новых пользователей (без изменений)
        $ownerRole = Role::where('alias', 'owner')->first();
        User::factory()->create(['role_id' => $ownerRole->id]); // +1 владелец
        User::factory()->count(3)->create(); // +3 юзера
        User::factory()->count(2)->create(['is_banned' => true]); // +2 забаненных

        // 3. Подготовка НОВЫХ транзакций (без изменений)
        $depositType = TransactionType::where('alias', 'deposit')->first();
        $successStatus = TransactionStatus::where('alias', 'success')->first();
        $failedStatus = TransactionStatus::where('alias', 'failed')->first();

        Transaction::create([
            'user_id' => $admin->id, 'amount' => 1000, 'type_id' => $depositType->id,
            'status_id' => $successStatus->id, 'created_at' => now()
        ]);
        Transaction::create([
            'user_id' => $admin->id, 'amount' => 500, 'type_id' => $depositType->id,
            'status_id' => $failedStatus->id, 'created_at' => now()
        ]);

        // 4. Запрос
        $response = $this->actingAs($admin)->getJson('/api/admin/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('stats.users.total', $initialUsers + 6)
            ->assertJsonPath('stats.users.banned', $initialBanned + 2)
            ->assertJsonPath('stats.users.admins', $initialAdmins + 1)
            ->assertJsonPath('stats.transactions.total', 2)
            ->assertJsonPath('stats.transactions.failed', 1)
            ->assertJsonPath('stats.transactions.revenue', '1000.00')
            ->assertJsonCount(2, 'recent_transactions');
    }
}
