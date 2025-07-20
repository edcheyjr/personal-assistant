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
import { Loader, Loader2 } from 'lucide-react'
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

            // More robust success handling
            if (response.status === 200 || response.status === 201) {
                toast.success('Successfully created agent')
            } else {
                toast.error(
                    'Agent creation completed but with unexpected status'
                )
            }
            onClose()
        },
        onError: (error: Error & { response?: any }) => {
            logger(error, 'Error', 'error')

            // Enhanced error message handling
            const errorMessage =
                error.response?.data?.message ??
                error.response?.message ??
                error.message ??
                'Failed to create agent'

            toast.error(errorMessage)
        },
        onSettled: async (data, error, variables, context) => {
            // Optional: Add loading state cleanup or additional actions
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
        // if (!user_id) {
        //     toast.error('User not authenticated')
        //     return
        // }
        /**
 * {
  "name": "string",
  "agent_type": "string",
  "description": "string",
  "personality_traits": {
    "formal": 1,
    "friendly": 1,
    "professional": 1,
    "conversational": 1,
    "humorous": 1,
    "serious": 1,
    "direct": 1,
    "verbose": 1
  },
  "agent_properties": {
    "name": "string",
    "tone": "string",
    "objective": "string",
    "socratic_approach": "string",
    "conversation_style": "string",
    "response_to_greetings": "string",
    "focus": "string",
    "interactivity": "string",
    "response_format": "string",
    "personality_slider": {
      "formal": 0.5,
      "friendly": 0.5,
      "professional": 0.5,
      "conversational": 0.5,
      "humorous": 0.5,
      "serious": 0.5,
      "direct": 0.5,
      "verbose": 0.5
    },
    "personality_traits": []
  },
  "config": {
    "max_history": 0,
    "temperature": 0,
    "model": "string"
  },
  "voice_settings": {
    "voice_id": "string",
    "voice_settings": {
      "additionalProp1": {}
    }
  },
  "user_id": "user@example.com"
}
 */
        const createAgentData = {
            user_id: 'alice@sentient.ai',
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
            agent_properties: {},
            config: {},
            voice_settings: {},
        } as CreateAgentRequest

        // Optional: Add loading toast
        // toast.loading('Creating agent...', { id: 'create-agent' })

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
                        disabled={mutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={'default'}
                        disabled={!isValid || mutation.isPending}
                        onClick={form.handleSubmit(onSubmit)}
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader className="size-4 animate-spin" />
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
                    className="space-y-8"
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
