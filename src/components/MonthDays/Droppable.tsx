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
			className={clsx(
				'relative border-2 border-zinc-800 h-full max-w-60 flex flex-col gap-1 items-center rounded-lg p-2',
				{ '!border-transparent': isOver },
			)}
		>
			{isOver && (
				<svg className="absolute top-0 left-0 w-full h-full">
					<title>Droppable area</title>
					<rect
						className="w-full h-full mx-auto inset-0 rounded-lg stroke-blue-500 stroke-4 fill-none"
						strokeDasharray="12 4"
						rx={8}
						ry={8}
					/>
				</svg>
			)}
			{children}
		</div>
	)
}

Droppable.displayName = 'Droppable'
