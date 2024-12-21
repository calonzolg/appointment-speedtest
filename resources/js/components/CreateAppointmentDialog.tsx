import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReactNode, useState } from 'react';

export function CreateAppointmentDialog({
    children,
    onSave,
    title,
    setTitle,
}: {
    children: ReactNode;
    onSave: () => void;
    title: string;
    setTitle: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);

    function handleSave() {
        setOpen(false);
        onSave();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Appointment</DialogTitle>
                    <DialogDescription>
                        Add your title for the appointment
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-left">
                            Title
                        </Label>
                        <Input
                            id="title"
                            defaultValue={title}
                            className="col-span-4"
                            onChange={({ target: { value } }) => {
                                setTitle(value);
                            }}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSave}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
