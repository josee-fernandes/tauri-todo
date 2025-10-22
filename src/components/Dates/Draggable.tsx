import { type UniqueIdentifier, useDraggable } from '@dnd-kit/core'

interface IDraggableProps {
	children?: React.ReactNode
	id: UniqueIdentifier
	onClick?: () => void
}

export const Draggable: React.FC<IDraggableProps> = ({ children, id, onClick }) => {
	const { attributes, listeners, setNodeRef } = useDraggable({ id })

	return (
		<button
			ref={setNodeRef}
			type="button"
			data-draggable="true"
			className="w-full"
			{...listeners}
			{...attributes}
			onClick={onClick}
		>
			{children}
		</button>
	)
}

Draggable.displayName = 'Draggable'
