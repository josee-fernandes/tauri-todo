import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, type UniqueIdentifier } from '@dnd-kit/core'
import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide'
import { getDate, getDaysInMonth } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'

import { Draggable } from './Draggable'
import { Droppable } from './Droppable'

// @ts-expect-error no types for this package
import '@splidejs/react-splide/css'

interface IDatesCProps {
	activeDraggableId: UniqueIdentifier | null
	droppables: Record<string, ITodo[]>
	todos: ITodo[]
}

const DatesC: React.FC<IDatesCProps> = ({ activeDraggableId, droppables, todos }) => {
	const activeTodo = useMemo(() => {
		return todos.find((todo) => todo.id === activeDraggableId)
	}, [activeDraggableId, todos])

	return (
		<div className="h-full max-h-96 text-white flex gap-4 overflow-x-auto">
			<DragOverlay>
				{activeDraggableId ? (
					<Draggable id={activeDraggableId}>
						<p className="min-h-[50px] h-max w-full bg-blue-500 flex items-center justify-center p-2 rounded-lg">
							{activeTodo?.title}
						</p>
					</Draggable>
				) : null}
			</DragOverlay>

			<div className="flex-1 relative w-full">
				<Splide
					aria-label="Dates"
					options={{
						perPage: 7,
						snap: true,
						wheel: false,
						gap: '1rem',
						height: '384px',
						drag: activeDraggableId ? false : 'free',
					}}
				>
					{Object.keys(droppables).map((id) => (
						<SplideSlide key={id}>
							<Droppable id={id}>
								<p className="font-bold mb-1">Col {id}</p>
								<div className="flex flex-col gap-1 w-full overflow-y-auto overflow-x-hidden p-2">
									<div className="opacity-0 w-full"></div>
									{droppables[id].map((todo) =>
										activeDraggableId === todo.id ? null : (
											<Draggable key={todo.id} id={todo.id}>
												<p className="min-h-[50px] h-max w-full bg-blue-500 flex items-center justify-center p-2 rounded-lg">
													{todo.title}
												</p>
											</Draggable>
										),
									)}
									{droppables[id].length === 0 && (
										<p className="h-[50px] w-full border border-gray-500  text-gray-500 flex items-center justify-center rounded-lg">
											Nenhum item
										</p>
									)}
								</div>
							</Droppable>
						</SplideSlide>
					))}
				</Splide>
			</div>
		</div>
	)
}

interface IDatesProps {
	todos: ITodo[]
}

export const Dates: React.FC<IDatesProps> = ({ todos }) => {
	const [activeDraggableId, setActiveDraggableId] = useState<string | null>(null)

	const days = getDaysInMonth(new Date())

	const initialDroppables = new Array(days)
		.fill(0)
		.map((_, index) => index + 1)
		.map((day) => day.toString())
		.reduce(
			(acc, day) => {
				acc[day] = todos.filter((todo) => getDate(new Date(todo.date)) === Number(day))
				return acc
			},
			{} as Record<string, ITodo[]>,
		)

	const [droppables, setDroppables] = useState<Record<string, ITodo[]>>(initialDroppables)

	const findContainer = (id: string): string | undefined => {
		return Object.keys(droppables).find((key) => droppables[key].some((todo) => todo.id === id))
	}

	const handleDragStart = (event: DragStartEvent) => {
		setActiveDraggableId(event.active.id.toString())
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (!over) {
			setActiveDraggableId(null)
			return
		}

		const sourceId = findContainer(active.id.toString())
		const targetId = over.id.toString()

		if (sourceId === targetId) {
			setActiveDraggableId(null)
			return
		}

		setDroppables((prev) => {
			const next = { ...prev }

			if (sourceId) {
				next[sourceId] = next[sourceId].filter((todo) => todo.id !== active.id.toString())
			}

			if (!next[targetId]) next[targetId] = []
			next[targetId] = [...next[targetId], todos.find((todo) => todo.id === active.id.toString()) as ITodo]

			return next
		})

		setActiveDraggableId(null)
	}

	useEffect(() => {
		const newDroppables = new Array(days)
			.fill(0)
			.map((_, index) => index + 1)
			.map((day) => day.toString())
			.reduce(
				(acc, day) => {
					acc[day] = todos.filter((todo) => getDate(new Date(todo.date)) === Number(day))
					return acc
				},
				{} as Record<string, ITodo[]>,
			)

		setDroppables(newDroppables)
	}, [todos, days])

	return (
		<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<DatesC activeDraggableId={activeDraggableId} droppables={droppables} todos={todos} />
		</DndContext>
	)
}

Dates.displayName = 'Dates'
