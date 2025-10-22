import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	MouseSensor,
	TouchSensor,
	type UniqueIdentifier,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import clsx from 'clsx'
import { format, formatISO, getDate, getDaysInMonth, setDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import useEmblaCarousel from 'embla-carousel-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Draggable } from './Draggable'
import { Droppable } from './Droppable'

interface IDatesCProps {
	activeDraggableId: UniqueIdentifier | null
	droppables: Record<string, ITodo[]>
	todos: ITodo[]
	onEditTodo: (id: string) => void
}

const today = new Date()

const DatesC: React.FC<IDatesCProps> = ({ activeDraggableId, droppables, todos, onEditTodo }) => {
	const [emblaRef] = useEmblaCarousel({
		startIndex: getDate(today) - 1,
		dragFree: true,
		loop: false,
		watchSlides: false,
		watchDrag: (_, event) => {
			const target = event.target as HTMLElement
			const isDraggable = target?.closest('button[data-draggable="true"]')

			console.log({ isDraggable })

			if (isDraggable) {
				return false
			}

			return true
		},
	})

	const activeTodo = useMemo(() => {
		return todos.find((todo) => todo.id === activeDraggableId)
	}, [activeDraggableId, todos])

	const emblaRefElement = useRef<HTMLDivElement>(null)

	const handleEditTodo = (id: string) => {
		onEditTodo(id)
	}

	useEffect(() => {
		if (emblaRefElement.current) {
			if (activeDraggableId) {
				emblaRefElement.current.style.pointerEvents = 'none'
			} else {
				emblaRefElement.current.style.pointerEvents = 'auto'
			}
		}
	}, [activeDraggableId])

	return (
		<div className=" h-full text-white flex gap-4 overflow-x-auto">
			<DragOverlay>
				{activeDraggableId ? (
					<Draggable id={activeDraggableId}>
						<p className="min-h-[50px] h-max w-full bg-blue-500 flex items-center justify-center p-2 rounded-lg cursor-grabbing">
							{activeTodo?.title}
						</p>
					</Draggable>
				) : null}
			</DragOverlay>

			<div className="embla h-full w-full">
				<div
					ref={(node) => {
						emblaRef(node)
						emblaRefElement.current = node
					}}
					className="embla__viewport overflow-hidden"
				>
					<div className="embla__container flex gap-2">
						{Object.keys(droppables).map((id) => (
							<div key={id} className="embla__slide min-w-60 w-60">
								<Droppable id={id}>
									<p
										className={clsx('text-sm text-zinc-500', {
											'!text-blue-500': formatISO(setDate(today, Number(id))) === formatISO(today.toISOString()),
										})}
									>
										{format(setDate(today, Number(id)), 'EEEE', { locale: ptBR })}
									</p>
									<p className="font-bold mb-1">{format(setDate(today, Number(id)), 'dd/MM')}</p>
									<div className="flex flex-col gap-1 w-full overflow-y-auto overflow-x-hidden p-2">
										<div className="opacity-0 w-full"></div>
										{droppables[id].map((todo) =>
											activeDraggableId === todo.id ? null : (
												<Draggable key={todo.id} id={todo.id} onClick={() => handleEditTodo(todo.id)}>
													<p
														className={clsx(
															'min-h-[50px] h-max w-full bg-blue-500 flex items-center justify-center p-2 rounded-lg cursor-pointer',
															{
																'bg-emerald-200 dark:bg-emerald-900 border-emerald-500 text-emerald-500':
																	todo.completed,
															},
														)}
													>
														{todo.title}
													</p>
												</Draggable>
											),
										)}
										{droppables[id].length === 0 && (
											<p className="h-[50px] w-full  text-gray-500 flex items-center justify-center rounded-lg">
												Nenhum item
											</p>
										)}
									</div>
								</Droppable>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

DatesC.displayName = 'DatesC'

interface IDatesProps {
	todos: ITodo[]
	onUpdate: ({ updatedTodo }: { updatedTodo: ITodo }) => void
	onEditTodo: (id: string) => void
}

export const Dates: React.FC<IDatesProps> = ({ todos, onUpdate, onEditTodo }) => {
	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: {
			delay: 10,
			tolerance: 5,
		},
	})
	const touchSensor = useSensor(TouchSensor, {
		activationConstraint: {
			delay: 10,
			tolerance: 5,
		},
	})

	const [activeDraggableId, setActiveDraggableId] = useState<string | null>(null)

	// https://deepwiki.com/search/eu-consigo-usar-off-para-desli_7cd2dcbd-2c69-4a13-b91d-2470ac951402?mode=fast
	// https://chatgpt.com/c/68f695ea-c500-832b-91ad-ecee10ff807e

	const sensors = useSensors(mouseSensor, touchSensor)
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

		const todo = todos.find((todo) => todo.id === active.id.toString())

		if (todo) {
			const updatedTodo = {
				...todo,
				date: setDate(new Date(todo.date), Number(targetId)).toISOString(),
			}

			onUpdate({ updatedTodo })
		}

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
		<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<DatesC activeDraggableId={activeDraggableId} droppables={droppables} todos={todos} onEditTodo={onEditTodo} />
		</DndContext>
	)
}

Dates.displayName = 'Dates'
