import clsx from 'clsx'
import { Check, Pencil, Trash, Undo } from 'lucide-react'

interface IDayViewProps {
	todos: ITodo[]
}

export const DayView: React.FC<IDayViewProps> = ({ todos }) => {
	const handleCompleteTodo = (id: string) => {
		console.log(id)
	}

	const handleEditTodo = (id: string) => {
		console.log(id)
	}

	const handleDeleteTodo = (id: string) => {
		console.log(id)
	}

	return (
		<div>
			<h1>Day view</h1>
			<ul className="flex flex-col gap-2 ">
				{todos.map((todo) => (
					<li
						key={todo.id}
						className={clsx(
							'group flex items-center gap-2 justify-between px-4 py-2 rounded-lg border',
							{
								'bg-emerald-200 dark:bg-emerald-900 border-emerald-500 text-emerald-500': todo.completed,
							},
							{
								'bg-zinc-100 dark:bg-zinc-900 border-zinc-600 dark:border-zinc-800 text-zinc-600 dark:text-zinc-50':
									!todo.completed,
							},
						)}
					>
						<span className={clsx('flex-1', todo.completed ? 'line-through' : '')}>{todo.title}</span>
						<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all">
							<button
								type="button"
								className={clsx(
									'rounded-lg p-2 transition-all cursor-pointer border',
									{
										'bg-zinc-300 dark:bg-zinc-900 hover:bg-zinc-500 border-zinc-500 text-zinc-500 hover:text-zinc-300':
											todo.completed,
									},
									{
										'bg-emerald-200 dark:bg-emerald-900 hover:bg-emerald-500 border-emerald-500 text-emerald-500 hover:text-emerald-200':
											!todo.completed,
									},
								)}
								onClick={() => handleCompleteTodo(todo.id)}
							>
								{todo.completed ? <Undo className="w-4 h-4" /> : <Check className="w-4 h-4" />}
							</button>
							<button
								type="button"
								className="rounded-lg p-2 transition-all cursor-pointer border bg-zinc-300 dark:bg-zinc-900 hover:bg-zinc-500 border-zinc-500 text-zinc-500 hover:text-zinc-300"
								onClick={() => handleEditTodo(todo.id)}
							>
								<Pencil className="w-4 h-4" />
							</button>
							<button
								type="button"
								className="border bg-rose-200 dark:bg-rose-900 hover:bg-rose-500 border-rose-500 text-rose-500 hover:text-rose-200 rounded-lg p-2 transition-all cursor-pointer"
								onClick={() => handleDeleteTodo(todo.id)}
							>
								<Trash className="w-4 h-4" />
							</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}

DayView.displayName = 'DayView'
