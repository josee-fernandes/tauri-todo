import { useEffect, useState } from 'react'

import { toast, Toaster } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { Check, Loader2, Save, Trash, Undo } from 'lucide-react'
import clsx from 'clsx'
import { open, exists, mkdir } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';

import './index.css'


interface ITodo {
  id: string
  title: string
  description: string
  completed: boolean
  date: string
  createdAt: string
  updatedAt: string
}

export const App = () => {
  const [todos, setTodos] = useState<ITodo[]>([])
  const [title, setTitle] = useState('')
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [filteredTodos, setFilteredTodos] = useState<ITodo[]>([])

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
        date: new Date(selectedDate).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setTodos((prevTodos) => [...prevTodos, newTodo])

      setTitle('')

      setSaveStatus('unsaved')
    } catch (error) {
      toast.error('Failed to add todo', {
        description: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const handleCompleteTodo = (id: string) => {
    setTodos((prevTodos) => prevTodos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    setSaveStatus('unsaved')
  }

  const handleDeleteTodo = (id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id))
    setSaveStatus('unsaved')
  }

  const handleLoadTodos = async () => {
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
        const file = await open(filePath, { read: true })
        const stat = await file.stat()
        const buffer = new Uint8Array(stat.size)
        await file.read(buffer)

        const content = new TextDecoder().decode(buffer)

        const todos = JSON.parse(content) as ITodo[]
        
        await file.close()
  
        setTodos(todos)
      }
    } catch (error) {
      toast.error('Failed to load todos', {
        description: error instanceof Error ? error.message : String(error),
      })
    }
  }

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

      const file = await open(filePath, { write: true, create: true })
      await file.write(new TextEncoder().encode(JSON.stringify(todos)))
      await file.close()

      setSaveStatus('saved')
      
      toast.success('Todos saved successfully')
    } catch (error) {
      toast.error('Failed to save todos', {
        description: error instanceof Error ? error.message : String(error),
      })

      setSaveStatus('error')
    }
  }

  const handleSelectedDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value)
  }

  useEffect(() => {
    handleLoadTodos()
  }, [])

  useEffect(() => {
    setFilteredTodos(todos.filter((todo) => new Date(todo.date).toISOString().split('T')[0] === selectedDate))
  }, [selectedDate, todos])

  return (
    <div className="w-screen h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50">
      <Toaster richColors />
      <div className="max-w-[1200px] mx-auto w-[90%] py-10">
        <div className="flex justify-end items-center gap-2">
          {saveStatus === 'unsaved' && (<span className="text-xs text-amber-600">Não salvo</span>)}
          {saveStatus === 'saving' && (<span className="text-xs">Salvando</span>)}
          {saveStatus === 'saved' && (<span className="text-xs text-emerald-600">Salvo</span>)}
          {saveStatus === 'error' && (<span className="text-xs text-rose-600">Erro ao salvar</span>)}
          <button
            className="bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-950 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 transition-all cursor-pointer"
            onClick={handleSaveTodos}
          >
            {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </button>
        </div>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <label htmlFor="title">Nome da tarefa</label>
          <input
            id="title"
            type="text"
            className="border border-zinc-300 dark:border-zinc-800 rounded-lg p-2"
            value={title}
            onChange={handleTitleChange}
          />
          <button
            type="submit"
            className="border bg-blue-500 hover:bg-blue-600 font-semibold text-white rounded-lg p-2 transition-all cursor-pointer"
          >
            Adicionar
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-2">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Tarefas</h2>
            <div className="flex items-center gap-2">
              <span>
                {filteredTodos.length} tarefas
              </span>
              <input 
                type="date"
                className="border border-zinc-300 dark:border-zinc-800 rounded-lg p-2"
                value={selectedDate}
                onChange={handleSelectedDateChange}
              />
            </div>
          </header>
          <ul className="flex flex-col gap-2 ">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className={
                  clsx(
                    'group flex items-center gap-2 justify-between px-4 py-2 rounded-lg border',
                    { 'bg-emerald-200 border-emerald-500 text-emerald-500 opacity-70': todo.completed },
                    { 'bg-zinc-100 dark:bg-zinc-900 border-zinc-600 dark:border-zinc-800 text-zinc-600 dark:text-zinc-50': !todo.completed },
                  )
                }
              >
                <span className={clsx('flex-1', todo.completed ? 'line-through' : '')}>{todo.title}</span>
                <span className="text-xs text-zinc-500">{todo.date}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 w-0 group-hover:w-[10%] scale-0 group-hover:scale-100 transition-all">
                  <button
                    className={
                      clsx(
                        'rounded-lg p-2 transition-all cursor-pointer border',
                        { 'bg-zinc-300 hover:bg-zinc-950 border-zinc-950 text-zinc-950 hover:text-zinc-300': todo.completed },
                        { 'bg-emerald-200 hover:bg-emerald-500 border-emerald-500 text-emerald-500 hover:text-emerald-200': !todo.completed },
                      )
                    }
                    onClick={() => handleCompleteTodo(todo.id)}
                  >
                    {todo.completed ? <Undo className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    className="border bg-rose-200 hover:bg-rose-500 border-rose-500 text-rose-500 hover:text-rose-200 rounded-lg p-2 transition-all cursor-pointer"
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
    </div>
  )
}

App.displayName = 'App'
