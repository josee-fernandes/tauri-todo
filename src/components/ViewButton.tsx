import clsx from 'clsx'
import { forwardRef } from 'react'

interface IViewButtonProps extends React.ComponentPropsWithoutRef<'button'> {
	children?: React.ReactNode
}

export const ViewButton: React.FC<IViewButtonProps> = forwardRef<HTMLButtonElement, IViewButtonProps>(
	({ children, className, ...props }, ref) => {
		return (
			<button
				ref={ref}
				type="button"
				className={clsx(
					'border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-800 font-semibold text-zinc-950 dark:text-zinc-50 rounded-lg p-3 transition-all cursor-pointer',
					className,
				)}
				{...props}
			>
				{children}
			</button>
		)
	},
)

ViewButton.displayName = 'ViewButton'
