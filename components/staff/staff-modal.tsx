"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6).optional().or(z.literal("")),
    role: z.enum(["admin", "staff"]),
});

type StaffFormValues = z.infer<typeof formSchema>;

interface StaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: StaffFormValues & { id: string };
}

export const StaffModal: React.FC<StaffModalProps> = ({
    isOpen,
    onClose,
    initialData,
}) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit staff" : "Create staff";
    const description = initialData ? "Edit staff details." : "Add a new staff member";
    const action = initialData ? "Save changes" : "Create";

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            email: "",
            password: "",
            role: "staff",
        },
    });

    const onSubmit = async (data: StaffFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/users/${initialData.id}`, data);
            } else {
                await axios.post(`/api/users`, data);
            }
            router.refresh();
            toast.success(initialData ? "Staff updated." : "Staff created.");
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={title}
            description={description}
            isOpen={isOpen}
            onClose={onClose}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Staff name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password {initialData && "(Leave blank to keep current)"}</FormLabel>
                                <FormControl>
                                    <Input type="password" disabled={loading} placeholder="Password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select
                                    disabled={loading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue defaultValue={field.value} placeholder="Select a role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                        <Button disabled={loading} variant="outline" onClick={onClose} type="button">
                            Cancel
                        </Button>
                        <Button disabled={loading} type="submit">
                            {action}
                        </Button>
                    </div>
                </form>
            </Form>
        </Modal>
    );
};
