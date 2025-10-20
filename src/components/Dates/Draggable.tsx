import { type UniqueIdentifier, useDraggable } from '@dnd-kit/core'

interface IDraggableProps {
	children?: React.ReactNode
	id: UniqueIdentifier
}

export const Draggable: React.FC<IDraggableProps> = ({ children, id }) => {
	const { attributes, listeners, setNodeRef } = useDraggable({ id })

	return (
		<button ref={setNodeRef} type="button" {...listeners} {...attributes}>
			{children}
		</button>
	)
}

Draggable.displayName = 'Draggable'
