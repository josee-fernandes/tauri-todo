import { forwardRef } from 'react'

interface IContainerProps {
	children?: React.ReactNode
}

export const Container = forwardRef<HTMLDivElement, IContainerProps>(({ children, ...props }, ref) => {
	return (
		<div ref={ref} className="max-w-[1200px] mx-auto w-[90%] py-10" {...props}>
			{children}
		</div>
	)
})

Container.displayName = 'Container'
