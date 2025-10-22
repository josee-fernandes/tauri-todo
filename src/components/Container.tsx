import clsx from 'clsx'
import { forwardRef } from 'react'

interface IContainerProps extends React.ComponentPropsWithoutRef<'div'> {
	overrideClassName?: boolean
}

const DEFAULT_CLASSNAME = 'max-w-[1200px] mx-auto w-[90%] py-10'

export const Container = forwardRef<HTMLDivElement, IContainerProps>(
	({ children, className, overrideClassName, ...props }, ref) => {
		return (
			<div ref={ref} className={overrideClassName ? className : clsx(DEFAULT_CLASSNAME, className)} {...props}>
				{children}
			</div>
		)
	},
)

Container.displayName = 'Container'
