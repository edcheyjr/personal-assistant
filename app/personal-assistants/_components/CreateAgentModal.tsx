'use client'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import ModalWrapper from '@/components/modal'
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAgentAction } from '@/server-actions/agents'
import { AGENTS_TAG } from '@/utils/constants'
import { toast } from 'sonner'
import { logger } from '@/utils/logger'
import { Loader2 } from 'lucide-react'
import { AgentTypeSelection } from './Settings'
import Select from '@/components/inputs/select-input'

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onClose: () => void
}

export default function CreateForm({ isOpen, onOpenChange, onClose }: Props) {
    const queryClient = useQueryClient()
    const formSchema = z.object({
        name: z.string(),
        description: z.string(),
    })

    const mutation = useMutation({
        mutationFn: createAgentAction,
        onSuccess: async (response) => {
            await queryClient.invalidateQueries({
                queryKey: [AGENTS_TAG],
            })
            if (response.status == 200) {
                toast.success('Successfully updated role')
            }
            onClose()
        },
        onError: (error: Error & { response?: any }) => {
            logger(error, 'Error', 'error')
            toast.error(
                error.response?.message ??
                    error.message ??
                    'Failed to update role'
            )
        },
        onSettled: async (data, error, variables, context) => {
            //on settled
        },
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    })

    const {
        formState: { isDirty, isLoading, isValid },
    } = form
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    function onReset() {
        form.reset()
        form.clearErrors()
    }

    return (
        <ModalWrapper
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            contentClassName="max-w-lg 2xl:max-w-3xl 2xl:p-10"
            title="Create New Agent"
            dialogAriaDesc="switch plan dialog. has three tabs. Intro, add billing and confirm"
            footer={
                <>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="w-full"
                        // disabled={currentStep === 'intro'}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!isValid}
                        // onClick={handleSubmit}
                        className="w-full max-sm:mb-2"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="mr-1 size-4 animate-spin" />{' '}
                                Creating...
                            </>
                        ) : (
                            'Create'
                        )}
                    </Button>
                </>
            }
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    onReset={onReset}
                    className="space-y-8 @container"
                >
                    <div className="grid grid-cols-12 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                    <FormLabel className="flex shrink-0">
                                        Title
                                    </FormLabel>

                                    <div className="w-full">
                                        <FormControl>
                                            <div className="relative w-full">
                                                <Input
                                                    key="name"
                                                    placeholder=""
                                                    type="text"
                                                    id="name"
                                                    className=" "
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>

                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                    <FormLabel className="block text-sm font-medium mb-2">
                                        Agent Types
                                    </FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        width="w-full"
                                        defaultLabel="Communication Tone"
                                        required
                                        className="-mt-0.5"
                                        aria-label="Select Connection Tone"
                                        selectItems={AgentTypeSelection}
                                    />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                    <FormLabel className="flex shrink-0">
                                        Description
                                    </FormLabel>

                                    <div className="w-full">
                                        <FormControl>
                                            <Textarea
                                                key="description"
                                                id="description"
                                                placeholder=""
                                                className=""
                                                {...field}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </Form>
        </ModalWrapper>
    )
}
