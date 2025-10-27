import { DragOverlay, type UniqueIdentifier } from '@dnd-kit/core'
import clsx from 'clsx'
import { format, formatISO, getDate, setDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { Plus } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'

import { Draggable } from './Draggable'
import { Droppable } from './Droppable'

interface IDayColumnsProps {
	activeDraggableId: UniqueIdentifier | null
	droppables: Record<string, { date: Date; data: ITodo[] }>
	todos: ITodo[]
	isCurrentMonth: boolean
	onEditTodo: (id: string) => void
	onCreateNewTodo: ({ date }: { date: Date }) => void
}

const today = new Date()

export const DayColumns: React.FC<IDayColumnsProps> = ({
	activeDraggableId,
	droppables,
	todos,
	isCurrentMonth,
	onEditTodo,
	onCreateNewTodo,
}) => {
	const [emblaRef] = useEmblaCarousel(
		{
			startIndex: isCurrentMonth ? getDate(today) - 1 : 0,
			dragFree: true,
			loop: false,
			watchSlides: false,
			watchDrag: (_, event) => {
				const target = event.target as HTMLElement
				const isDraggable = target?.closest('button[data-draggable="true"]')

				if (isDraggable) {
					return false
				}

				return true
			},
		},
		[WheelGesturesPlugin({ forceWheelAxis: 'y' })],
	)

	const activeTodo = useMemo(() => todos.find((todo) => todo.id === activeDraggableId), [activeDraggableId, todos])

	const emblaRefElement = useRef<HTMLDivElement>(null)

	const handleEditTodo = (id: string) => {
		onEditTodo(id)
	}

	const handleCreateNewTodo = ({ date }: { date: string }) => {
		const _date = setDate(new Date(), Number(date))

		onCreateNewTodo({ date: _date })
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
		<div className="flex-1 text-white flex gap-4 overflow-x-auto">
			<DragOverlay>
				{activeDraggableId ? (
					<Draggable id={activeDraggableId}>
						<p
							className={clsx(
								'min-h-[50px] h-max w-full border-2 border-blue-400 bg-blue-500 flex items-center justify-center p-2 rounded-lg cursor-grabbing',
								{
									'bg-emerald-200 dark:bg-emerald-900 border-emerald-500 text-emerald-500': activeTodo?.completed,
								},
							)}
						>
							{activeTodo?.title}
						</p>
					</Draggable>
				) : null}
			</DragOverlay>

			<div className="embla w-full">
				<div
					ref={(node) => {
						emblaRef(node)
						emblaRefElement.current = node
					}}
					className="embla__viewport overflow-hidden h-full "
				>
					<div className="embla__container flex gap-2 h-full">
						{Object.keys(droppables).map((id) => (
							<div key={id} className="embla__slide w-60 flex-none h-[576px]">
								<Droppable id={id}>
									<p
										className={clsx('text-sm text-zinc-500', {
											'!text-blue-500': formatISO(droppables[id].date) === formatISO(today),
										})}
									>
										{format(droppables[id].date, 'EEEE', { locale: ptBR })}
									</p>
									<p className="font-bold mb-1">{format(droppables[id].date, 'dd/MM')}</p>
									<div className="group flex flex-col gap-1 w-full h-full overflow-y-auto overflow-x-hidden p-2">
										<div className="opacity-0 w-full"></div>
										{droppables[id].data.length === 0 && (
											<p className="h-[50px] w-full  text-gray-500 flex items-center justify-center rounded-lg">
												Nenhum item
											</p>
										)}

										{droppables[id].data.map((todo: ITodo) =>
											activeDraggableId === todo.id ? null : (
												<Draggable key={todo.id} id={todo.id} onClick={() => handleEditTodo(todo.id)}>
													<p
														className={clsx(
															'min-h-[50px] h-max w-full border-2 border-blue-400 bg-blue-500 flex items-center justify-center p-2 rounded-lg cursor-pointer',
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

										<button
											type="button"
											className="w-full group-hover:opacity-100 opacity-0 transition-all"
											onClick={() =>
												handleCreateNewTodo({
													date: id,
												})
											}
										>
											<p
												className={clsx(
													'min-h-[50px] h-max w-full bg-zinc-300 dark:bg-zinc-900 hover:bg-zinc-500 border-zinc-500 text-zinc-500 hover:text-zinc-300 flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all',
												)}
											>
												<Plus className="w-4 h-4" />
											</p>
										</button>
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

DayColumns.displayName = 'DayColumns'
