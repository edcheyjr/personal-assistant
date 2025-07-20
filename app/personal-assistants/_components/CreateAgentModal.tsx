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
import SelectedInput from '@/components/inputs/SpecialSelectionInput'
import { personalityTraits } from '@/lib/data/personality'

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onClose: () => void
}

export default function CreateForm({ isOpen, onOpenChange, onClose }: Props) {
    const { data: session } = useSession()
    const email = session?.user.email
    const queryClient = useQueryClient()

    const formSchema = z.object({
        name: z
            .string()
            .min(1, 'Name is required')
            .max(100, 'Agent name must not exceed 100 characters'),
        agent_type: z.string().min(1, 'Agent type is required'),
        description: z.string().min(1, 'Description is required'),
        personality: z.array(z.string()),
    })

    const mutation = useMutation({
        mutationFn: createAgentAction,
        onSuccess: async (response) => {
            // More robust success handling
            if (response.status === 200 || response.status === 201) {
                console.log('data', response.data)
                toast.success('Successfully created agent')
                await queryClient.invalidateQueries({
                    queryKey: [AGENTS_TAG],
                })
            } else {
                if (response.status == 422) {
                    toast.error('Missing fields')
                    process.env.NODE_ENV == 'development' &&
                        console.error('Submitting Error', response.error)
                } else {
                    toast.error(
                        response.error || response.status
                            ? `${response.status}: ${response.error}`
                            : 'Agent creation completed but with unexpected status'
                    )
                }
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
            personality: [],
        },
    })

    const {
        formState: { isDirty, isLoading, isValid },
    } = form

    // Helper function to create a schema-compliant agent object
    function createSchemaCompliantAgent(
        formValues: z.infer<typeof formSchema>
    ): CreateAgentRequest {
        const defaultPersonalityTraits = {
            formal: 0.5,
            friendly: 0.5,
            professional: 0.5,
            conversational: 0.5,
            humorous: 0.5,
            serious: 0.5,
            direct: 0.5,
            verbose: 0.5,
        }

        return {
            name: formValues.name,
            agent_type: formValues.agent_type,
            description: formValues.description,
            user_id: email || 'user@example.com',

            // Schema-compliant personality_traits (top level - numeric values)
            personality_traits: defaultPersonalityTraits,

            // Schema-compliant agent_properties
            agent_properties: {
                name: formValues.name,
                tone: 'Professional', // Default value
                objective: formValues.description, // Use description as objective
                socratic_approach: 'balanced', // Default value
                conversation_style: 'adaptive', // Default value
                response_to_greetings: 'friendly', // Default value
                focus: 'task-oriented', // Default value
                interactivity: 'high', // Default value
                response_format: 'structured', // Default value

                // Nested personality_slider with same values
                personality_slider: defaultPersonalityTraits,

                // Empty personality_traits array as per schema
                personality_traits: formValues.personality,
            },

            // Schema-compliant config with defaults
            config: {
                max_history: 10, // Default conversation history limit
                temperature: 0.7, // Default creativity level
                model: 'gpt-4', // Default model
            },

            voice_settings: {
                voice_id: 'default-voice', // Default voice
                enabled: true,
                speaking_rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
            },
        } as CreateAgentRequest
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!email) {
            toast.error('User not authenticated')
            return
        }

        // Create schema-compliant agent data
        const createAgentData = createSchemaCompliantAgent(values)

        console.log(
            'Submitting agent data:',
            JSON.stringify(createAgentData, null, 2)
        )

        // Optional: Add loading toast
        // toast.loading('Creating agent...', { id: 'create-agent' })

        mutation.mutateAsync({ agentData: createAgentData })
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
                        />{' '}
                        <FormField
                            control={form.control}
                            name="personality"
                            render={({ field }) => (
                                <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                    <FormLabel className="flex shrink-0">
                                        Personality Traits
                                    </FormLabel>

                                    <div className="w-full">
                                        <FormControl>
                                            <SelectedInput
                                                type="text"
                                                name={field.name}
                                                values={field.value || []}
                                                options={personalityTraits}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
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
