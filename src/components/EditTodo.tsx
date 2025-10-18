import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { BackgroundOverlay } from './BackgroundOverlay'

interface IEditTodoProps {
	todo: ITodo
	onClose: () => void
}

export const EditTodo: React.FC<IEditTodoProps> = ({ todo, onClose, onSave }) => {
	const [title, setTitle] = useState(todo.title)
	const [description, setDescription] = useState(todo.description)

	const handleInitialFieldValues = useCallback((todo: ITodo) => {
		setTitle(todo.title)
		setDescription(todo.description)
	}, [])

	const handleOnClose = () => {
		onClose()
	}

	const handleOnCancel = () => handleOnClose()

	const handleOnSave = () => {
		const updatedTodo: ITodo = {
			...todo,
			title,
			description,
		}

		onSave({ updatedTodo })

		onClose()
	}

	const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setDescription(event.target.value)
	}

	useEffect(() => {
		handleInitialFieldValues(todo)
	}, [todo, handleInitialFieldValues])

	return (
		<BackgroundOverlay className="grid place-items-center">
			<div className="max-w-3xl w-[90%] py-4 px-6 background-zinc-900 border border-zinc-800 rounded-lg">
				<header className="flex items-center justify-between">
					<h2>{title}</h2>
					<button type="button" className="cursor-pointer" onClick={handleOnClose}>
						<X className="w-4 h-4" />
					</button>
				</header>
				<div className="flex flex-col gap-2 mt-4">
					<textarea
						className="border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 flex-1"
						value={description}
						onChange={handleDescriptionChange}
					/>
				</div>
				<footer className="flex items-center justify-end gap-2 mt-4">
					<button
						type="button"
						className="border border-zinc-300 hover:border-zinc-500 font-semibold text-white rounded-lg py-2 px-4 transition-all cursor-pointer"
						onClick={handleOnCancel}
					>
						Cancelar
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
