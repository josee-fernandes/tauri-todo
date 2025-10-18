import clsx from 'clsx'
import { forwardRef } from 'react'

interface IBackgroundOverlayProps {
	children?: React.ReactNode
}

export const BackgroundOverlay = forwardRef<HTMLDivElement, IBackgroundOverlayProps>(({ children, ...props }, ref) => {
	const { className, ...rest } = props

	const _class = clsx('fixed w-screen h-screen top-0 left-0 bg-black/30 backdrop-blur-lg z-50', className)

	return (
		<div ref={ref} className={_class} {...rest}>
			{children}
		</div>
	)
})

BackgroundOverlay.displayName = 'BackgroundOverlay'
