<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'dni' => $user->dni,
            'rol' => $user->rol,
            'estado' => $user->estado,
            'campana' => $user->campana,
            'coordinador' => $user->coordinador,
            'supervisor' => $user->supervisor,
            'allowedCampaigns' => $user->allowed_campaigns ?? [],
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $login = trim($request->login);
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'dni';

        if (!Auth::attempt([$field => $login, 'password' => $request->password], true)) {
            throw ValidationException::withMessages([
                'login' => ['Credenciales incorrectas.'],
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        if ($user->estado !== 'Activo') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'login' => ['Tu usuario está inactivo.'],
            ]);
        }

        return response()->json([
            'ok' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'dni' => $user->dni,
                'rol' => $user->rol,
                'estado' => $user->estado,
                'campana' => $user->campana,
                'coordinador' => $user->coordinador,
                'supervisor' => $user->supervisor,
                'allowedCampaigns' => $user->allowed_campaigns ?? [],
            ],
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'ok' => true,
        ]);
    }
}
