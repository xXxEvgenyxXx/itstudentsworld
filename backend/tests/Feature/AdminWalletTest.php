<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use App\Services\WalletService;

class AdminWalletTest extends TestCase
{
    use DatabaseTransactions;

    private function getAdmin(): User
    {
        $role = Role::where('alias', 'admin')->firstOrFail();
        return User::factory()->create(['role_id' => $role->id]);
    }

    // 1. Успешные операции

    public function test_admin_can_accrue_balance(): void
    {
        $admin = $this->getAdmin();
        $user = $this->createUserWithBalance(1000);

        $response = $this->actingAs($admin)->postJson("/api/admin/users/{$user->id}/wallet/adjust", [
            'amount' => 500,
            'type' => 'accrual',
            'comment' => 'Компенсация за сбой сервера'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 1500]);
        $this->assertDatabaseHas('transaction', [
            'user_id' => $user->id,
            'amount' => 500,
            'type_id' => 4,
            'comment' => 'Компенсация за сбой сервера'
        ]);
    }

    public function test_admin_can_deduct_balance(): void
    {
        $admin = $this->getAdmin();
        $user = $this->createUserWithBalance(1000);

        $response = $this->actingAs($admin)->postJson("/api/admin/users/{$user->id}/wallet/adjust", [
            'amount' => 300,
            'type' => 'deduction',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 700]);
        $this->assertDatabaseHas('transaction', [
            'user_id' => $user->id,
            'amount' => 300,
            'type_id' => 5,
        ]);
    }

    // 2. Проверка прав (RBAC)

    public function test_regular_user_cannot_accrue_balance(): void
    {
        $user1 = $this->createUserWithBalance(1000);
        $user2 = $this->createUserWithBalance(1000);

        $response = $this->actingAs($user1)->postJson("/api/admin/users/{$user1->id}/wallet/adjust", [
            'amount' => 9999,
            'type' => 'accrual',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user1->id, 'balance' => 1000]);
    }

    public function test_regular_user_cannot_deduct_balance(): void
    {
        $user1 = $this->createUserWithBalance(1000);
        $user2 = $this->createUserWithBalance(1000); // Жертва

        // Юзер пытается списать деньги у другого юзера
        $response = $this->actingAs($user1)->postJson("/api/admin/users/{$user2->id}/wallet/adjust", [
            'amount' => 500,
            'type' => 'deduction',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user2->id, 'balance' => 1000]);
    }

    // 3. Валидация (Отрицательные числа)

    public function test_cannot_accrue_balance_with_negative_amount(): void
    {
        $admin = $this->getAdmin();
        $user = $this->createUserWithBalance(1000);

        $response = $this->actingAs($admin)->postJson("/api/admin/users/{$user->id}/wallet/adjust", [
            'amount' => -500,
            'type' => 'accrual',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['amount']);
    }

    public function test_cannot_deduct_balance_with_negative_amount(): void
    {
        $admin = $this->getAdmin();
        $user = $this->createUserWithBalance(1000);

        $response = $this->actingAs($admin)->postJson("/api/admin/users/{$user->id}/wallet/adjust", [
            'amount' => -500,
            'type' => 'deduction',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['amount']);
    }

    // 4. Безопасность: IDOR и Parameter Tampering

    public function test_adjust_balance_ignores_user_id_in_body(): void
    {
        $admin = $this->getAdmin();
        $targetUser = $this->createUserWithBalance(1000);
        $victimUser = $this->createUserWithBalance(1000);

        $response = $this->actingAs($admin)->postJson("/api/admin/users/{$targetUser->id}/wallet/adjust", [
            'amount' => 500,
            'type' => 'accrual',
            'user_id' => $victimUser->id,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('user_wallet', ['user_id' => $targetUser->id, 'balance' => 1500]);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $victimUser->id, 'balance' => 1000]);
    }

    public function test_adjust_balance_protects_against_parameter_tampering(): void
    {
        $admin = $this->getAdmin();
        $user = $this->createUserWithBalance(1000);

        $response = $this->actingAs($admin)->postJson("/api/admin/users/{$user->id}/wallet/adjust", [
            'amount' => 500,
            'type' => 'accrual',
            'status_id' => 1,
            'type_id' => 2,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('transaction', [
            'user_id' => $user->id,
            'amount' => 500,
            'type_id' => 4,
            'status_id' => 2,
        ]);
    }

    // 5. Безопасность: SQLi и XSS в поле comment

    public function test_adjust_balance_handles_sqli_safely(): void
    {
        $admin = $this->getAdmin();
        $user = $this->createUserWithBalance(1000);
        $sqliPayload = "' OR 1=1 --";

        $response = $this->actingAs($admin)->postJson("/api/admin/users/{$user->id}/wallet/adjust", [
            'amount' => 100,
            'type' => 'accrual',
            'comment' => $sqliPayload,
        ]);

        $response->assertStatus(200);

        // Eloquent должен сохранить это как безобидную строку
        $this->assertDatabaseHas('transaction', [
            'user_id' => $user->id,
            'comment' => $sqliPayload
        ]);
    }

    public function test_adjust_balance_handles_xss_safely(): void
    {
        $admin = $this->getAdmin();
        $user = $this->createUserWithBalance(1000);
        $xssPayload = '<script>alert("hacked")</script>';

        $response = $this->actingAs($admin)->postJson("/api/admin/users/{$user->id}/wallet/adjust", [
            'amount' => 100,
            'type' => 'accrual',
            'comment' => $xssPayload,
        ]);

        $response->assertStatus(200);

        // Защита от исполнения ложится на React, но бэкенд должен сохранить это как строку
        $this->assertDatabaseHas('transaction', [
            'user_id' => $user->id,
            'comment' => $xssPayload
        ]);
    }

    // 6. Безопасность: SQLi/XSS в других полях

    public function test_adjust_balance_fails_on_sqli_in_type_field(): void
    {
        $admin = $this->getAdmin();
        $user = $this->createUserWithBalance(1000);

        $response = $this->actingAs($admin)->postJson("/api/admin/users/{$user->id}/wallet/adjust", [
            'amount' => 500,
            'type' => "accrual' OR 1=1 --",
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['type']);

        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 1000]);
    }

    public function test_adjust_balance_fails_on_sqli_in_amount_field(): void
    {
        $admin = $this->getAdmin();
        $user = $this->createUserWithBalance(1000);

        $response = $this->actingAs($admin)->postJson("/api/admin/users/{$user->id}/wallet/adjust", [
            'amount' => "500 OR 1=1",
            'type' => "accrual",
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['amount']);

        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 1000]);
    }

    public function test_adjust_balance_fails_on_xss_in_type_field(): void
    {
        $admin = $this->getAdmin();
        $user = $this->createUserWithBalance(1000);

        $response = $this->actingAs($admin)->postJson("/api/admin/users/{$user->id}/wallet/adjust", [
            'amount' => 500,
            'type' => "<script>alert('xss')</script>",
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['type']);
        $this->assertDatabaseHas('user_wallet', ['user_id' => $user->id, 'balance' => 1000]);
    }
}
