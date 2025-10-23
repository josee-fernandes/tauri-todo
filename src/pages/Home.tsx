import * as path from '@tauri-apps/api/path'
import { exists, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import clsx from 'clsx'
import { format } from 'date-fns'
import { BookOpenText, Loader2, Plus, Save } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { Container } from '@/components/Container'
import { Dates } from '@/components/Dates'
import { EditTodo } from '@/components/EditTodo'

export const Home: React.FC = () => {
	const [todos, setTodos] = useState<ITodo[]>([])
	const [title, setTitle] = useState('')
	const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle')
	const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
	const [filteredTodos, setFilteredTodos] = useState<ITodo[]>([])
	const [editingTodoId, setEditingTodoId] = useState<string | null>(null)

	const editingTodo = useMemo(() => todos.find((todo) => todo.id === editingTodoId), [todos, editingTodoId])

	const titleInputId = useId()

	const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setTitle(event.target.value)
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		try {
			const newTodo: ITodo = {
				id: uuidv4(),
				title,
				description: '',
				completed: false,
				date: new Date(`${selectedDate}T00:00:00.000`).toISOString(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			setTodos((prevTodos) => [...prevTodos, newTodo])

			setTitle('')

			setSaveStatus('unsaved')
		} catch (error) {
			toast.error('Erro ao adicionar tarefa', {
				description: error instanceof Error ? error.message : String(error),
			})
		}
	}

	// const handleCompleteTodo = (id: string) => {
	// 	setTodos((prevTodos) => prevTodos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
	// 	setSaveStatus('unsaved')
	// }

	const handleDeleteTodo = (id: string) => {
		setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id))
		setSaveStatus('unsaved')
	}

	const handleLoadTodos = useCallback(async () => {
		try {
			const appDataDir = await path.appDataDir()
			const appDir = await path.join(appDataDir, 'tauri-todo')
			const filePath = await path.join(appDir, 'todos.json')

			const appDirExists = await exists(appDir)

			if (!appDirExists) {
				await mkdir(appDir, { recursive: true })
			}

			const filePathExists = await exists(filePath)

			if (filePathExists) {
				const content = await readTextFile(filePath)

				const todos = JSON.parse(content) as ITodo[]

				setTodos(todos)
			}
		} catch (error) {
			console.error(error)

			toast.error('Erro ao carregar tarefas', {
				description: error instanceof Error ? error.message : String(error),
			})
		}
	}, [])

	const handleSaveTodos = async () => {
		try {
			setSaveStatus('saving')

			const appDataDir = await path.appDataDir()
			const appDir = await path.join(appDataDir, 'tauri-todo')
			const filePath = await path.join(appDir, 'todos.json')

			const appDirExists = await exists(appDir)

			if (!appDirExists) {
				await mkdir(appDir, { recursive: true })
			}

			const content = JSON.stringify(todos)

			await writeTextFile(filePath, content)

			setSaveStatus('saved')

			toast.success('Tarefas salvas com sucesso')
		} catch (error) {
			toast.error('Erro ao salvar tarefas', {
				description: error instanceof Error ? error.message : String(error),
			})

			setSaveStatus('error')
		}
	}

	const handleSelectedDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedDate(event.target.value)
	}

	const handleEditTodo = (id: string) => {
		setEditingTodoId(id)
	}

	const onCloseEditTodo = () => {
		setEditingTodoId(null)
	}

	const onSaveEditTodo = ({ updatedTodo }: { updatedTodo: ITodo }) => {
		setTodos((prevTodos) => prevTodos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)))
		setSaveStatus('unsaved')
	}

	const onDeleteTodo = (id: string) => {
		handleDeleteTodo(id)
	}

	const onCreateNewTodo = ({ date }: { date: Date }) => {
		try {
			const newTodo: ITodo = {
				id: uuidv4(),
				title: 'Nova tarefa',
				description: '',
				completed: false,
				date: date.toISOString(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			setTodos((prevTodos) => [...prevTodos, newTodo])

			setSaveStatus('unsaved')
		} catch (error) {
			toast.error('Erro ao criar nova tarefa', {
				description: error instanceof Error ? error.message : String(error),
			})
		}
	}

	useEffect(() => {
		handleLoadTodos()
	}, [handleLoadTodos])

	useEffect(() => {
		if (todos.length > 0) {
			setFilteredTodos(todos.filter((todo) => new Date(todo.date).toISOString().split('T')[0] === selectedDate))
		}
	}, [selectedDate, todos])

	return (
		<div className="relative w-full flex-1 overflow-x-hidden">
			{editingTodo && (
				<EditTodo todo={editingTodo} onClose={onCloseEditTodo} onSave={onSaveEditTodo} onDelete={onDeleteTodo} />
			)}
			<Container className="flex flex-col overflow-y-auto">
				<div className="flex justify-between items-center gap-2">
					<div className="flex items-center gap-2">
						<BookOpenText className="w-8 h-8" />
						<h1 className="text-3xl font-black leading-none -mt-1">TODOS</h1>
					</div>
					<div className="flex items-center gap-2">
						<span
							className={clsx('text-xs font-black', {
								'text-amber-600': saveStatus === 'unsaved',
								'text-zinc-500': saveStatus === 'saving',
								'text-emerald-600': saveStatus === 'saved',
								'text-rose-600': saveStatus === 'error',
							})}
						>
							{saveStatus === 'unsaved' && 'NÃO SALVO'}
							{saveStatus === 'saving' && 'SALVANDO'}
							{saveStatus === 'saved' && 'SALVO'}
							{saveStatus === 'error' && 'ERRO AO SALVAR'}
						</span>
						<button
							type="button"
							className="bg-blue-500 hover:bg-blue-600 font-semibold text-white rounded-lg p-3 transition-all cursor-pointer"
							onClick={handleSaveTodos}
						>
							{saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
						</button>
					</div>
				</div>
				<form className="flex flex-col gap-2 mt-6" onSubmit={handleSubmit}>
					<header>
						<h2 className="text-2xl font-bold">Adicionar tarefa</h2>
					</header>
					<div className="flex gap-2">
						<div className="flex-1 flex gap-2 items-center">
							<label htmlFor={titleInputId}>Nome da tarefa</label>
							<input
								id={titleInputId}
								type="text"
								className="border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 flex-1"
								value={title}
								onChange={handleTitleChange}
							/>
						</div>
						<button
							type="submit"
							className="bg-blue-500 hover:bg-blue-600 font-semibold text-white rounded-lg py-2 px-4 transition-all cursor-pointer w-full max-w-32 flex items-center gap-2"
						>
							<Plus className="w-4 h-4" />
							Adicionar
						</button>
					</div>
				</form>
				<div className="mt-6 flex flex-col gap-2 flex-1">
					<header className="flex items-center justify-between">
						<h2 className="text-2xl font-bold">Tarefas</h2>
						<div className="flex items-center gap-2">
							<span>{filteredTodos.length} tarefas</span>
							<input
								type="date"
								className="border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 text-zinc-950 dark:text-zinc-50"
								value={selectedDate}
								onChange={handleSelectedDateChange}
							/>
						</div>
					</header>
					<Dates
						todos={todos}
						onUpdate={onSaveEditTodo}
						onEditTodo={handleEditTodo}
						onCreateNewTodo={onCreateNewTodo}
					/>
					{/* day view */}
					{/* <ul className="flex flex-col gap-2 ">
						{filteredTodos.map((todo) => (
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
					</ul> */}
				</div>
			</Container>
		</div>
	)
}

Home.displayName = 'Home'
