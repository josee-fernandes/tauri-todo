import { Toaster } from 'sonner'
import { TitleBar } from '@/components/Window/TitleBar'

import { Home } from '@/pages/Home'

import '@/styles/index.css'

export const App = () => {
	return (
		<div className="w-full h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 flex flex-col">
			<Toaster richColors expand closeButton />
			<TitleBar />
			<Home />
		</div>
	)
}

App.displayName = 'App'
