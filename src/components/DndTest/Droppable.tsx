import { type UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import clsx from 'clsx'

interface IDroppableProps {
	children?: React.ReactNode
	id: UniqueIdentifier
}

export const Droppable: React.FC<IDroppableProps> = ({ children, id }) => {
	const { isOver, setNodeRef } = useDroppable({ id })

	return (
		<div
			ref={setNodeRef}
			className={clsx('border border-amber-500 h-full flex flex-col gap-1 items-center', {
				'border-emerald-500 border-dashed': isOver,
			})}
		>
			{children}
		</div>
	)
}

Droppable.displayName = 'Droppable'
