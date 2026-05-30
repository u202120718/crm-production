
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    private function authorizeManagement(Request $request): void
    {
        $user = $request->user();

        abort_unless($user && in_array($user->rol, ['Gerente', 'Admin']), 403, 'No autorizado.');
    }

    private function mapUser(User $user): array
    {
        return [
            'id' => $user->id,
            'nombre' => $user->name,
            'name' => $user->name,
            'email' => $user->email,
            'dni' => $user->dni,
            'rol' => $user->rol,
            'estado' => $user->estado,
            'campana' => $user->campana ?? '',
            'coordinador' => $user->coordinador ?? '',
            'supervisor' => $user->supervisor ?? '',
            'allowedCampaigns' => $user->allowed_campaigns ?? [],
            'allowedMenus' => [],
        ];
    }

    public function index(Request $request)
    {
        $this->authorizeManagement($request);

        $users = User::orderBy('id', 'desc')
            ->get()
            ->map(fn (User $user) => $this->mapUser($user));

        return response()->json([
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeManagement($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'dni' => ['nullable', 'string', 'max:50', 'unique:users,dni'],
            'password' => ['required', 'string', 'min:6'],
            'rol' => ['required', Rule::in(['Gerente', 'Admin', 'Supervisor', 'Backoffice', 'Comercial'])],
            'estado' => ['required', Rule::in(['Activo', 'Inactivo'])],
            'campana' => ['nullable', 'string', 'max:255'],
            'coordinador' => ['nullable', 'string', 'max:255'],
            'supervisor' => ['nullable', 'string', 'max:255'],
            'allowedCampaigns' => ['nullable', 'array'],
            'allowedCampaigns.*' => ['string', 'max:255'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'dni' => $data['dni'] ?? null,
            'password' => $data['password'],
            'rol' => $data['rol'],
            'estado' => $data['estado'],
            'campana' => $data['campana'] ?? null,
            'coordinador' => $data['coordinador'] ?? null,
            'supervisor' => $data['supervisor'] ?? null,
            'allowed_campaigns' => $data['allowedCampaigns'] ?? [],
        ]);

        return response()->json([
            'ok' => true,
            'user' => $this->mapUser($user),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $this->authorizeManagement($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'dni' => ['nullable', 'string', 'max:50', Rule::unique('users', 'dni')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'rol' => ['required', Rule::in(['Gerente', 'Admin', 'Supervisor', 'Backoffice', 'Comercial'])],
            'estado' => ['required', Rule::in(['Activo', 'Inactivo'])],
            'campana' => ['nullable', 'string', 'max:255'],
            'coordinador' => ['nullable', 'string', 'max:255'],
            'supervisor' => ['nullable', 'string', 'max:255'],
            'allowedCampaigns' => ['nullable', 'array'],
            'allowedCampaigns.*' => ['string', 'max:255'],
        ]);

        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
            'dni' => $data['dni'] ?? null,
            'rol' => $data['rol'],
            'estado' => $data['estado'],
            'campana' => $data['campana'] ?? null,
            'coordinador' => $data['coordinador'] ?? null,
            'supervisor' => $data['supervisor'] ?? null,
            'allowed_campaigns' => $data['allowedCampaigns'] ?? [],
        ];

        if (!empty($data['password'])) {
            $payload['password'] = $data['password'];
        }

        $user->update($payload);

        return response()->json([
            'ok' => true,
            'user' => $this->mapUser($user->fresh()),
        ]);
    }

    public function updateStatus(Request $request, User $user)
    {
        $this->authorizeManagement($request);

        abort_if($request->user()->id === $user->id, 422, 'No puedes cambiar el estado de tu propio usuario.');

        $data = $request->validate([
            'estado' => ['required', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $user->update([
            'estado' => $data['estado'],
        ]);

        return response()->json([
            'ok' => true,
            'user' => $this->mapUser($user->fresh()),
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        $this->authorizeManagement($request);

        abort_if($request->user()->id === $user->id, 422, 'No puedes eliminar tu propio usuario.');

        $user->delete();

        return response()->json([
            'ok' => true,
        ]);
    }
}
