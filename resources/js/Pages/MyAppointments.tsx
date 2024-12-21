import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import dayjs from "dayjs";
import {toast} from "sonner";

export default function Home() {
    const [myAppointments, setMyAppointments] = useState([]);

    async function getMyAppointments() {
        const { data } = await axios.get('/appointments/me');

        setMyAppointments(data.appointments);
    }

    useEffect(() => {
        (async () => {
            try {
                await getMyAppointments();
            } catch (err) {
                console.log('Error occured when fetching books');
            }
        })();
    }, []);

    async function handleCancel(appointmentId: number) {
        const {status} = await axios.get(`/appointments/${appointmentId}/cancel`)

        if (status === 200) {
            toast.success('Appointment has been cancelled')
            await getMyAppointments();
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    My Appointments
                </h2>
            }
        >
            <Head title="My Appointments" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <Table>
                                <TableCaption>
                                    A list of your recent appoitments.
                                </TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">
                                            Details
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Start</TableHead>
                                        <TableHead>
                                            End
                                        </TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myAppointments.map((appointment: any) => (
                                        <TableRow key={appointment.id}>
                                            <TableCell className="font-medium md:min-w-96">
                                                {appointment.name}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                <Badge variant={appointment.status === 'cancelled' ? 'destructive': 'default'}>
                                                    {appointment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {dayjs(appointment.start).format('ddd d MMM, h:mm')}
                                            </TableCell>
                                            <TableCell>
                                                {dayjs(appointment.end).format('ddd d MMM, h:mm')}
                                            </TableCell>
                                            <TableCell>
                                                {appointment.status !== 'cancelled' && (
                                                    <Button size={'sm'} onClick={() => handleCancel(appointment.id)}>Cancel</Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>

                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
