import * as path from '@tauri-apps/api/path'
import { exists, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import clsx from 'clsx'
import { getMonth } from 'date-fns'
import { BookOpenText, Columns, LayoutGrid, Loader2, Save } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

import { Container } from '@/components/Container'
import { EditTodo } from '@/components/EditTodo'
import { MonthDays } from '@/components/MonthDays'
import { Months } from '@/components/Months'
import { ViewButton } from '@/components/ViewButton'

export const Home: React.FC = () => {
	const [todos, setTodos] = useState<ITodo[]>([])
	const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle')
	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
	const [selectedView, setSelectedView] = useState<'year' | 'month' | 'day'>('month')
	const [editingTodoId, setEditingTodoId] = useState<string | null>(null)

	const editingTodo = useMemo(() => todos.find((todo) => todo.id === editingTodoId), [todos, editingTodoId])
	const filteredTodos = useMemo(
		() => todos.filter((todo) => getMonth(new Date(todo.date)) === selectedMonth),
		[selectedMonth, todos],
	)

	// const handleCompleteTodo = (id: string) => {
	// 	setTodos((prevTodos) => prevTodos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
	// 	setSaveStatus('unsaved')
	// }

	const handleSelectMonthView = () => {
		setSelectedView('month')
	}

	const handleSelectYearView = () => {
		setSelectedView('year')
	}

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

	const updateSelectedMonth = (monthId: number) => {
		setSelectedMonth(monthId)

		handleSelectMonthView()
	}

	useEffect(() => {
		handleLoadTodos()
	}, [handleLoadTodos])

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
				<div className="flex items-center gap-2 mt-6">
					<p>View:</p>
					<ViewButton
						className={clsx('flex items-center gap-2', {
							'!text-blue-500 !border-blue-500 hover:!bg-blue-500/10': selectedView === 'year',
						})}
						onClick={handleSelectYearView}
					>
						<LayoutGrid className="w-4 h-4" />
						Months
					</ViewButton>
					<ViewButton
						className={clsx('flex items-center gap-2', {
							'!text-blue-500 !border-blue-500 hover:!bg-blue-500/10': selectedView === 'month',
						})}
						onClick={handleSelectMonthView}
					>
						<Columns className="w-4 h-4" />
						Days
					</ViewButton>
				</div>
				<div className="mt-6 flex flex-col gap-2 flex-1">
					{selectedView === 'year' && <Months updateSelectedMonth={updateSelectedMonth} />}
					{selectedView === 'month' && (
						<div className="flex flex-col gap-10 animate-opacity-in">
							<MonthDays
								todos={filteredTodos}
								month={selectedMonth}
								onUpdate={onSaveEditTodo}
								onEditTodo={handleEditTodo}
								onCreateNewTodo={onCreateNewTodo}
							/>
						</div>
					)}
				</div>
			</Container>
		</div>
	)
}

Home.displayName = 'Home'
