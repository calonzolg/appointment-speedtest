import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import {useEffect, useState} from 'react';
import {toast} from "sonner";

dayjs.extend(isSameOrAfter);

const generateTimeIntervals = (start: string, end: string, interval: number) => {
    const times = [];
    const startHour = parseInt(start.split(':')[0], 10);
    const startMinutes = parseInt(start.split(':')[1], 10);
    const endHour = parseInt(end.split(':')[0], 10);

    let currentHour = startHour;
    let currentMinutes = startMinutes;

    while (currentHour < endHour || (currentHour === endHour && currentMinutes === 0)) {
        const formattedTime = `${String(currentHour).padStart(2, '0')}:${String(
            currentMinutes,
        ).padStart(2, '0')}`;
        times.push(formattedTime);

        currentMinutes += interval;
        if (currentMinutes >= 60) {
            currentMinutes = 0;
            currentHour += 1;
        }
    }

    return times;
};

function dates(current: Date): Date[] {
    const week = [];
    current.setDate(current.getDate() - current.getDay() + 1);
    for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return week.filter(day => dayjs(day).isSameOrAfter(new Date()));
}

export default function Home() {
    const [days, setDays] = useState(dates(new Date()));
    const [selectedDay, setSelectedDay] = useState(
        dayjs(days[0]).format('dddd MMM, D YYYY'),
    );
    const [appointments, setAppointments] = useState([])

    async function getAppointments(daySelected: string) {
        const parse = dayjs(daySelected).format('YYYY-MM-DD')
        try {
            const response = await axios.get(`/appointments?daySelected=${parse}`)

            setAppointments(response.data.appointments);
        } catch (e) {
            console.error(e)
        }
    }

    async function createAppointment(selectedTime: string) {
        const startDate = dayjs(`${selectedDay} ${selectedTime}`);
        const endDate = startDate.add(30, "minute")

        try {
            const response = await axios.post('/appointments', {
                startDate: startDate.format(
                    'YYYY-MM-DD HH:mm',
                ),
                endDate: endDate.format(
                    'YYYY-MM-DD HH:mm'
                )
            });
            const status = response.status;
            if (status === 200) {
                toast.success("Appointment has been created.");
                await getAppointments(selectedDay)
            }
            console.log({ status });
        } catch (e) {
            console.error('Oops: ', e);
        }
    }

    async function handleSelectedDate(value: string) {
        setSelectedDay(value);

        await getAppointments(value)
    }

    useEffect(() => {
        (async () => {
            try {
                await getAppointments(selectedDay);
            } catch (err) {
                console.log('Error occured when fetching books');
            }
        })();
    }, [])

    const now = dayjs();
    const selectedDate = dayjs(selectedDay);
    const timeIntervals = generateTimeIntervals('9:00', '17:00', 30);
    const filteredIntervals = timeIntervals.filter((time) => {
        const [hour, minute] = time.split(':').map(Number);
        const intervalTime = dayjs().hour(hour).minute(minute).second(0);

        if (selectedDate.isSame(now, 'day')) {
            return intervalTime.isAfter(now);
        }

        return true;
    });

    const isReserved = (time: any) => {
        const [hour, minute] = time.split(':').map(Number);
        const intervalStart = dayjs(selectedDay).hour(hour).minute(minute).second(0);
        const intervalEnd = intervalStart.add(30, 'minute');

        if (appointments.length === 0) {
            return false
        }

        return appointments.some((appointment: any) => {
            const appointmentStart = dayjs(appointment.start);
            const appointmentEnd = dayjs(appointment.end);

            return (
                intervalStart.isBefore(appointmentEnd) &&
                intervalEnd.isAfter(appointmentStart)
            );
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Home
                </h2>
            }
        >
            <Head title="Home" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <Tabs
                                defaultValue={selectedDay}
                                className="w-full"
                                onValueChange={(value) =>
                                    handleSelectedDate(value)
                                }
                            >
                                <TabsList className={`h-auto w-full flex-wrap`}>
                                    {days.map((day, index) => (
                                        <TabsTrigger
                                            className={`flex-1 p-4 md:p-2`}
                                            key={`trigger-${index}`}
                                            value={dayjs(day).format(
                                                'dddd MMM, D YYYY',
                                            )}
                                        >
                                            {dayjs(day).format('ddd D MMM')}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {days.map((day, index) => (
                                    <TabsContent
                                        value={dayjs(day).format(
                                            'dddd MMM, D YYYY',
                                        )}
                                        key={`content-${index}`}
                                    >
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    Available hours
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="mx-auto grid max-w-96 grid-cols-2 gap-4">
                                                {filteredIntervals.length > 0 ? (
                                                    filteredIntervals.map((time) => {
                                                        const disabled = isReserved(time)

                                                        return <Button
                                                            key={time}
                                                            onClick={() => createAppointment(time)}
                                                            disabled={disabled}
                                                        >
                                                            {time}
                                                        </Button>
                                                    })
                                                ) : (
                                                    <p>No hay horarios disponibles para hoy.</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
