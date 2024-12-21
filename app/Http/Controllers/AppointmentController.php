<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $daySelected = Carbon::parse($request->input('daySelected'));
        $start = $daySelected->startOfDay()->toDateTimeString();
        $end = $daySelected->endOfDay()->toDateTimeString();

        $appointments = Appointment::query()
            ->whereBetween('start', [$start, $end])
            ->get();

        return response()->json(compact('appointments'));
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $authUser */
        $authUser = Auth::user();
        $request->validate([
            'startDate' => 'required|date',
            'endDate' => 'required|date',
        ]);

        $authUser->appointments()->create([
            'name' => 'Appointment reserve for '.$request->input('startDate'),
            'start' => $request->input('startDate'),
            'end' => $request->input('endDate'),
            'status' => 'reserved',
        ]);

        return response()->json([
            'status' => 'ok'
        ]);
    }

    public function myAppointments(): JsonResponse
    {
        /** @var User $authUser */
        $authUser = Auth::user();
        $appointments = Appointment::query()
            ->where('user_id', $authUser->id)
            ->get();

        return response()->json(compact('appointments'));
    }

    public function cancel($appointmentId): JsonResponse
    {
        $appointment = Appointment::find($appointmentId);

        if (!$appointment) {
            return response()->json([
                'error' => 'Appointment not found'
            ], Response::HTTP_NOT_FOUND);
        }

        $appointment->update([
            'status' => 'cancelled'
        ]);

        return response()->json([
            'status' => 'ok'
        ], Response::HTTP_OK);
    }
}
