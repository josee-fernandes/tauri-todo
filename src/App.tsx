import { useState } from 'react'

import { toast, Toaster } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

import './index.css'
import { Check, Trash, Undo } from 'lucide-react'
import clsx from 'clsx'


interface ITodo {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export const App = () => {
  const [todos, setTodos] = useState<ITodo[]>([])
  
  const [title, setTitle] = useState('')

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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setTodos((prevTodos) => [...prevTodos, newTodo])

      setTitle('')

      toast.success('Todo added successfully')
    } catch (error) {
      toast.error('Failed to add todo', {
        description: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const handleCompleteTodo = (id: string) => {
    setTodos((prevTodos) => prevTodos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo))
  }

  const handleDeleteTodo = (id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id))
  }

  return (
    <div className="w-screen h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50">
      <Toaster richColors />
      <div className="max-w-[1200px] mx-auto">
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            className="border border-zinc-300 dark:border-zinc-800 rounded-lg p-2"
            value={title}
            onChange={handleTitleChange}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 transition-all cursor-pointer"
          >
              Add
          </button>
        </form>
        <ul className="flex flex-col gap-2 mt-4">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={
                clsx(
                  'group flex items-center gap-2 justify-between px-4 py-2 rounded-lg',
                  todo.completed ? 'bg-emerald-500 opacity-70' : 'bg-zinc-900',

                )
              }
            >
              <span className={clsx('flex-1', todo.completed ? 'line-through' : '')}>{todo.title}</span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  className={
                    clsx(
                      'text-white rounded-lg p-2 transition-all cursor-pointer',
                      todo.completed ? 'bg-zinc-500 hover:bg-zinc-600' : 'bg-emerald-500 hover:bg-emerald-600'
                    )
                  }
                  onClick={() => handleCompleteTodo(todo.id)}
                >
                  {todo.completed ? <Undo className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg p-2 transition-all cursor-pointer"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

App.displayName = 'App'
