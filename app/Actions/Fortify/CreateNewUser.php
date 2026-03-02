<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string|UploadedFile>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $userData = [
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
        ];

        // Handle avatar upload
        if (isset($input['avatar']) && $input['avatar'] instanceof UploadedFile) {
            $path = $input['avatar']->store('avatars', 'public');
            $userData['avatar'] = $path;
        }

        return User::create($userData);
    }
}
