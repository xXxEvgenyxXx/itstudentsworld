<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50'],
            'surname' => ['required', 'string', 'max:50'],
            'patronymic' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:250', 'unique:user,email'],
            'login' => ['required', 'string', 'max:50', 'unique:user,login'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'personal_data_consent' => ['required', 'accepted'],
            'privacy_policy_accepted' => ['required', 'accepted']
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Этот email уже зарегистрирован.',
            'login.unique' => 'Этот никнейм уже занят.',
            'password.confirmed' => 'Пароли не совпадают.',
            'password.min' => 'Пароль должен быть не менее 8 символов.',
        ];
    }
}
