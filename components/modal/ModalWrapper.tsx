import { useState } from "react"
import { cn } from "@/utils/cn"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface ModalWrapperProps {
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
    title?: React.ReactNode
    description?: React.ReactNode
    footer?: React.ReactNode
    contentClassName?: string
    headerClassName?: string
    titleClassName?: string
    descriptionClassName?: string
    footerClassName?: string
    children?: React.ReactNode
    shouldCloseOnOverlayClick?: boolean
    showCloseButton?: boolean
    /**
     * Accessablity description, for the dialog content
     */
    dialogAriaDesc?: string
}
/**
 * ModalWrapper component provides a customizable dialog/modal using a controlled or uncontrolled state.
 *
 * This component wraps a dialog structure with an optional trigger, header (including title and description),
 * content, and footer. It allows external control over its open state via the `isOpen` prop, or can manage
 * its own state internally. The component also supports preventing the modal from closing on overlay click.
 *
 * @component
 *
 * @param {Object} props - The properties object.
 * @param {boolean} [props.isOpen] - Controlled open state of the modal. If provided, the modal open state
 *   will be determined by this prop.
 * @param {(open: boolean) => void} [props.onOpenChange] - Callback invoked when the modal's open state changes.
 *   It receives the new open state as a parameter.
 * @param {React.ReactNode} [props.trigger] - An optional React node that acts as the trigger to open the modal.
 *   When provided, it will be rendered as the dialog trigger.
 * @param {React.ReactNode} [props.title] - The title content of the modal dialog, rendered in the header.
 * @param {React.ReactNode} [props.description] - The description content of the modal dialog, rendered under the title.
 * @param {React.ReactNode} [props.footer] - The footer content of the modal dialog, typically used for actions
 *   such as confirmation or cancellation.
 * @param {string} [props.contentClassName] - Optional class name for the DialogContent element to allow custom styling.
 * @param {string} [props.headerClassName] - Optional class name for the DialogHeader element.
 * @param {string} [props.titleClassName] - Optional class name for the DialogTitle element.
 * @param {string} [props.descriptionClassName] - Optional class name for the DialogDescription element.
 * @param {string} [props.footerClassName] - Optional class name for the DialogFooter element.
 * @param {React.ReactNode} [props.children] - The main content of the modal dialog.
 * @param {React.ReactNode} [props.showCloseButton] - Determines whether the close button should be displayed.
 * @param {boolean} [props.shouldCloseOnOverlayClick=true] - Determines whether clicking outside the modal content
 *   (on the overlay) should close the modal. Defaults to true.
 *
 * @returns {JSX.Element} The rendered ModalWrapper component.
 *
 * @example
 * // Controlled usage:
 * <ModalWrapper
 *   isOpen={modalOpen}
 *   onOpenChange={(open) => setModalOpen(open)}
 *   trigger={<button>Open Modal</button>}
 *   title="Modal Title"
 *   description="This is a description for the modal."
 *   footer={<button onClick={() => setModalOpen(false)}>Close</button>}
 * >
 *   <p>This is the modal content.</p>
 * </ModalWrapper>
 *
 * @example
 * // Uncontrolled usage:
 * <ModalWrapper
 *   trigger={<button>Open Modal</button>}
 *   title="Modal Title"
 *   description="This is a description for the modal."
 * >
 *   <p>This is the modal content.</p>
 * </ModalWrapper>
 */
export const ModalWrapper = ({
    isOpen: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    trigger,
    title,
    description,
    dialogAriaDesc,
    footer,
    contentClassName,
    headerClassName,
    titleClassName,
    descriptionClassName,
    footerClassName,
    children,
    showCloseButton = true,
    shouldCloseOnOverlayClick = true,
}: ModalWrapperProps) => {
    const [internalOpen, setInternalOpen] = useState(false)

    const isControlled = typeof controlledOpen !== "undefined"
    const open = isControlled ? controlledOpen : internalOpen

    const handleOpenChange = (newOpen: boolean) => {
        if (!isControlled) {
            setInternalOpen(newOpen)
        }
        controlledOnOpenChange?.(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent
                aria-describedby="dialog-content-description"
                className={cn("bg-background", contentClassName)}
                onInteractOutside={
                    !shouldCloseOnOverlayClick
                        ? (e) => e.preventDefault()
                        : undefined
                }
                showCloseButton={showCloseButton}
            >
                {(title || description) && (
                    <DialogHeader className={headerClassName}>
                        {title && (
                            <DialogTitle className={titleClassName}>
                                {title}
                            </DialogTitle>
                        )}
                        {description && (
                            <DialogDescription className={descriptionClassName}>
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                )}

                {children}

                {footer && (
                    <DialogFooter className={footerClassName}>
                        {footer}
                    </DialogFooter>
                )}
            </DialogContent>
            <p className="sr-only" id="dialog-content-description">
                {dialogAriaDesc || description || title}
            </p>
        </Dialog>
    )
}
