import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, type UniqueIdentifier } from '@dnd-kit/core'
import { useState } from 'react'
import { Draggable } from './Draggable'
import { Droppable } from './Droppable'

interface IDndTestCProps {
	activeDraggableId: UniqueIdentifier | null
	droppables: Record<string, UniqueIdentifier[]>
}

export const DndTestC: React.FC<IDndTestCProps> = ({ activeDraggableId, droppables }) => {
	// Itens disponíveis fora dos droppables (não alocados)
	const allItems = ['A', 'B', 'C', 'D', 'E'] as const
	const allocatedItems = Object.values(droppables).flat()
	const availableItems = allItems.filter((id) => !allocatedItems.includes(id))

	return (
		<div className="border border-blue-500 h-72 text-white flex gap-4 p-2">
			<div className="border border-green-500 flex flex-col gap-2 items-center">
				<p className="font-bold mb-1">Backlog</p>
				<div className="flex flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 py-2">
					<div className="opacity-0 w-40"></div>
					{availableItems.map((id) =>
						activeDraggableId === id ? null : (
							<Draggable key={id} id={id}>
								<p className="h-[50px] w-40 bg-blue-500 flex items-center justify-center">Item {id}</p>
							</Draggable>
						),
					)}
					{availableItems.length === 0 && (
						<p className="h-[50px] w-40 border border-gray-500  text-gray-500 flex items-center justify-center">
							Nenhum item
						</p>
					)}
				</div>
			</div>

			<DragOverlay>
				{activeDraggableId ? (
					<Draggable id={activeDraggableId}>
						<p className="h-[50px] w-40 bg-blue-500 flex items-center justify-center">Item {activeDraggableId}</p>
					</Draggable>
				) : null}
			</DragOverlay>

			{/* Droppables */}
			<div className="flex-1 flex gap-2">
				{Object.keys(droppables).map((id) => (
					<Droppable key={id} id={id}>
						<p className="font-bold mb-1">Col {id}</p>
						<div className="flex flex-col gap-1 px-2 overflow-y-auto overflow-x-hidden py-2">
							<div className="opacity-0 w-40"></div>
							{droppables[id].map((itemId) =>
								activeDraggableId === itemId ? null : (
									<Draggable key={itemId} id={itemId}>
										<p className="h-[50px] w-40 bg-blue-500 flex items-center justify-center">Item {itemId}</p>
									</Draggable>
								),
							)}
							{droppables[id].length === 0 && (
								<p className="h-[50px] w-40 border border-gray-500  text-gray-500 flex items-center justify-center">
									Nenhum item
								</p>
							)}
						</div>
					</Droppable>
				))}
			</div>
		</div>
	)
}

export const DndTest: React.FC = () => {
	const [activeDraggableId, setActiveDraggableId] = useState<UniqueIdentifier | null>(null)

	const [droppables, setDroppables] = useState<Record<string, UniqueIdentifier[]>>({
		'1': [],
		'2': [],
		'3': [],
	})

	const findContainer = (id: UniqueIdentifier): string | undefined => {
		return Object.keys(droppables).find((key) => droppables[key].includes(id))
	}

	const handleDragStart = (event: DragStartEvent) => {
		setActiveDraggableId(event.active.id)
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (!over) {
			setActiveDraggableId(null)
			return
		}

		const sourceId = findContainer(active.id)
		const targetId = over.id.toString()

		if (sourceId === targetId) {
			setActiveDraggableId(null)
			return
		}

		setDroppables((prev) => {
			const next = { ...prev }

			if (sourceId) {
				next[sourceId] = next[sourceId].filter((item) => item !== active.id)
			}

			if (!next[targetId]) next[targetId] = []
			next[targetId] = [...next[targetId], active.id]

			return next
		})

		setActiveDraggableId(null)
	}

	return (
		<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<DndTestC activeDraggableId={activeDraggableId} droppables={droppables} />
		</DndContext>
	)
}

DndTest.displayName = 'DndTest'
