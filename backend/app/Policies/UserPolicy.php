<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Список пользователей — только админ и owner
     */
    public function viewAny(User $actor): bool
    {
        // Список видят админы и владельцы
        return in_array($actor->role->alias, ['admin', 'owner']);
    }

    /**
     * Просмотр профиля — свой, админ, owner
     */
    public function view(User $actor, User $target): bool
    {
        return $actor->id === $target->id || $actor->isAdmin();
    }

    /**
     * Редактирование — только свой профиль
     */
    public function update(User $actor, User $target): bool
    {
        return $actor->id === $target->id;
    }

    /**
     * Смена пароля — только свой
     */
    public function changePassword(User $actor, User $target): bool
    {
        return $actor->id === $target->id;
    }

    /**
     * Смена роли — только owner, и не себе
     */
    public function changeRole(User $actor, User $target): bool
    {
        // Менять роли может ТОЛЬКО владелец
        if (!$actor->isOwner()) return false;

        // Себе роль менять нельзя (защита от потери прав)
        if ($actor->id === $target->id) return false;

        // Нельзя менять роль другого владельца (он один)
        return $target->role->alias !== 'owner';
    }

    /**
     * Бан/разбан
     * - owner банит user и admin, кроме себя
     * - admin банит только user
     */
    public function ban(User $actor, User $target): bool
    {
        // Себя забанить нельзя
        if ($actor->id === $target->id) return false;

        // Владелец может банить админов и юзеров, но не других владельцев
        if ($actor->isOwner()) {
            return $target->role->alias !== 'owner';
        }

        // Админ может банить только обычных юзеров
        if ($actor->role->alias === 'admin') {
            return $target->role->alias === 'user';
        }

        return false; // Обычный юзер никого не банит
    }

    /**
     * Корректировка баланса
     * - owner — user и admin
     * - admin — только user
     */
    public function adjustBalance(User $actor, User $target): bool
    {
        if ($actor->isOwner()) {
            return $target->role->alias !== 'owner';
        }

        if ($actor->role->alias === 'admin') {
            return $target->role->alias === 'user';
        }

        return false;
    }
}
