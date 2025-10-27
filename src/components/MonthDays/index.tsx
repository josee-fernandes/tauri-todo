import {
	DndContext,
	type DragEndEvent,
	type DragStartEvent,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { format, getDate, getDaysInMonth, isSameMonth, setDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'

import { DayColumns } from './DayColumns'

interface IMonthDaysProps {
	todos: ITodo[]
	month: number
	onUpdate: ({ updatedTodo }: { updatedTodo: ITodo }) => void
	onEditTodo: (id: string) => void
	onCreateNewTodo: ({ date }: { date: Date }) => void
}

const updateDroppables = (days: number, todos: ITodo[], date: Date) => {
	const memo: Record<string, { date: Date; data: ITodo[] }> = {}

	for (let day = 1; day <= days; day++) {
		memo[day.toString()] = {
			date: setDate(date, day),
			data: todos.filter((todo) => getDate(new Date(todo.date)) === Number(day)),
		}
	}

	return memo
}

const activationConstraint = {
	delay: 100,
	tolerance: 5,
}

const today = new Date()

export const MonthDays: React.FC<IMonthDaysProps> = ({ todos, month, onUpdate, onEditTodo, onCreateNewTodo }) => {
	const mouseSensor = useSensor(MouseSensor, { activationConstraint })
	const touchSensor = useSensor(TouchSensor, { activationConstraint })
	const sensors = useSensors(mouseSensor, touchSensor)

	const [activeDraggableId, setActiveDraggableId] = useState<string | null>(null)

	const date = useMemo(() => {
		const d = new Date()
		d.setMonth(month)
		return d
	}, [month])
	const days = useMemo(() => getDaysInMonth(date), [date])
	const isCurrentMonth = useMemo(() => isSameMonth(date, today), [date])

	const [droppables, setDroppables] = useState<Record<string, { date: Date; data: ITodo[] }>>(
		updateDroppables(days, todos, date),
	)

	const findContainer = (id: string): string | undefined => {
		return Object.keys(droppables).find((key) => droppables[key].data.some((todo) => todo.id === id)) ?? undefined
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
				next[sourceId] = {
					...next[sourceId],
					data: next[sourceId].data.filter((todo) => todo.id !== active.id.toString()),
				}
			}

			if (!next[targetId]) next[targetId] = { date: setDate(date, Number(targetId)), data: [] }
			next[targetId] = {
				...next[targetId],
				data: [...next[targetId].data, todos.find((todo) => todo.id === active.id.toString()) as ITodo],
			}

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
		setDroppables(updateDroppables(days, todos, date))
	}, [todos, days, date])

	return (
		<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold capitalize">{format(date, 'MMMM yyyy', { locale: ptBR })}</h1>
					<div>
						<span>{todos.length} tarefas</span>
					</div>
				</div>
				<DayColumns
					activeDraggableId={activeDraggableId}
					droppables={droppables}
					todos={todos}
					isCurrentMonth={isCurrentMonth}
					onEditTodo={onEditTodo}
					onCreateNewTodo={onCreateNewTodo}
				/>
			</div>
		</DndContext>
	)
}

MonthDays.displayName = 'MonthDays'
