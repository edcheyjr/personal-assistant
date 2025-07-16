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
import { useSession } from 'next-auth/react'
import { CreateAgentRequest } from '@/types/agent'

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onClose: () => void
}

export default function CreateForm({ isOpen, onOpenChange, onClose }: Props) {
    const { data: session } = useSession()
    const user_id = session?.user.id
    const queryClient = useQueryClient()

    const formSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        agent_type: z.string().min(1, 'Agent type is required'),
        description: z.string().min(1, 'Description is required'),
    })

    const mutation = useMutation({
        mutationFn: createAgentAction,
        onSuccess: async (response) => {
            await queryClient.invalidateQueries({
                queryKey: [AGENTS_TAG],
            })
            if (response.status == 200) {
                toast.success('Successfully created agent')
            }
            onClose()
        },
        onError: (error: Error & { response?: any }) => {
            logger(error, 'Error', 'error')
            toast.error(
                error.response?.message ??
                    error.message ??
                    'Failed to create agent'
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
            agent_type: '',
            description: '',
        },
    })

    const {
        formState: { isDirty, isLoading, isValid },
    } = form

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user_id) {
            toast.error('User not authenticated')
            return
        }

        const createAgentData = {
            user_id,
            name: values.name,
            agent_type: values.agent_type,
            description: values.description,
            personality_traits: {
                formal: 0.5,
                friendly: 0.5,
                professional: 0.5,
                conversational: 0.5,
                humorous: 0.5,
                serious: 0.5,
                direct: 0.5,
                verbose: 0.5,
            },
        } as CreateAgentRequest

        mutation.mutate(createAgentData)
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
            dialogAriaDesc="Create new agent dialog with form fields for name, type, and description"
            footer={
                <>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="w-full"
                        disabled={mutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!isValid || mutation.isPending}
                        onClick={form.handleSubmit(onSubmit)}
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
                                        Name
                                    </FormLabel>

                                    <div className="w-full">
                                        <FormControl>
                                            <div className="relative w-full">
                                                <Input
                                                    key="name"
                                                    placeholder="Enter agent name"
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
                            name="agent_type"
                            render={({ field }) => (
                                <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                    <FormLabel className="block text-sm font-medium mb-2">
                                        Agent Type
                                    </FormLabel>
                                    <div className="w-full">
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                width="w-full"
                                                defaultLabel="Select Agent Type"
                                                required
                                                className="-mt-0.5"
                                                aria-label="Select Agent Type"
                                                selectItems={AgentTypeSelection}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
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
                                                placeholder="Describe your agent's purpose and capabilities"
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
