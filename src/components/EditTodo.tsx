import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { BackgroundOverlay } from './BackgroundOverlay'

interface IEditTodoProps {
	todo: ITodo
	onClose: () => void
	onSave: ({ updatedTodo }: { updatedTodo: ITodo }) => void
	onDelete: (id: string) => void
}

export const EditTodo: React.FC<IEditTodoProps> = ({ todo, onClose, onSave, onDelete }) => {
	const [title, setTitle] = useState(todo.title)
	const [description, setDescription] = useState(todo.description)
	const [date] = useState(todo.date)
	const [completed, setCompleted] = useState(todo.completed)

	const handleOnClose = () => {
		onClose()
	}

	const handleOnCancel = () => handleOnClose()

	const handleOnSave = () => {
		try {
			const updatedTodo: ITodo = {
				...todo,
				title,
				description,
				completed,
				updatedAt: new Date().toISOString(),
			}

			onSave({ updatedTodo })

			toast.success('Atualização salva com sucesso')
			onClose()
		} catch (error) {
			toast.error('Erro ao salvar atualização', {
				description: error instanceof Error ? error.message : String(error),
			})
		}
	}

	const handleOnDelete = () => {
		try {
			onDelete(todo.id)
		} catch (error) {
			toast.error('Erro ao apagar tarefa', {
				description: error instanceof Error ? error.message : String(error),
			})
		}
	}

	const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setTitle(event.target.value)
	}

	const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setDescription(event.target.value)
	}

	const handleCompetedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setCompleted(event.target.value === 'completed')
	}

	return (
		// @ts-expect-error - className is not defined in the props
		<BackgroundOverlay className="grid place-items-center animate-opacity-in">
			<div className="max-w-3xl w-[90%] py-4 px-6 bg-zinc-950 border-2 border-zinc-800 rounded-lg animate-delay-scale-in">
				<header className="flex items-center justify-between gap-4">
					<input
						type="text"
						className="border-2 border-zinc-300 dark:border-zinc-800 rounded-lg p-2 w-full"
						value={title}
						onChange={handleTitleChange}
					/>
					<button
						type="button"
						className="cursor-pointer border-2 rounded-lg p-2 border-zinc-300 dark:border-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-800 transition-all"
						onClick={handleOnClose}
					>
						<X className="w-4 h-4" />
					</button>
				</header>
				<div className="flex flex-col gap-2 mt-4">
					{/* TODO: Corrigir redução de 3 horas do GMT */}
					<p>Data: {format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
					<p>Última atualização: {format(new Date(todo.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
					<select
						className="border-2 border-zinc-300 dark:border-zinc-800 rounded-lg p-2 w-max"
						value={completed ? 'completed' : 'pending'}
						onChange={handleCompetedChange}
					>
						<option value="completed">Completo</option>
						<option value="pending">Pendente</option>
					</select>
					<label className="flex flex-col gap-2">
						<span>Descrição</span>
						<textarea
							className="border-2 border-zinc-300 dark:border-zinc-800 rounded-lg p-2 flex-1"
							value={description}
							onChange={handleDescriptionChange}
						/>
					</label>
				</div>
				<footer className="flex items-center justify-end gap-2 mt-4">
					<button
						type="button"
						className="border-2 border-zinc-300 hover:border-zinc-500 font-semibold text-white rounded-lg py-2 px-4 transition-all cursor-pointer"
						onClick={handleOnCancel}
					>
						Cancelar
					</button>
					<button
						type="button"
						className="bg-rose-500 hover:bg-rose-600 font-semibold text-white rounded-lg py-2 px-4 transition-all cursor-pointer"
						onClick={handleOnDelete}
					>
						Apagar
					</button>
					<button
						type="button"
						className="bg-blue-500 hover:bg-blue-600 font-semibold text-white rounded-lg py-2 px-4 transition-all cursor-pointer"
						onClick={handleOnSave}
					>
						Salvar
					</button>
				</footer>
			</div>
		</BackgroundOverlay>
	)
}
