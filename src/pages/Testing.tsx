import { useState } from 'react'
import { MONTHS } from '@/constants/date'

export const Testing: React.FC = () => {
	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

	return (
		<div>
			<h1>Testing features</h1>

			<h2>Month view</h2>
			<p>Selected month: {MONTHS.find((month) => month.id === selectedMonth)?.name}</p>
			<div className="grid grid-cols-4 gap-4">
				{MONTHS.map((month) => (
					<button
						type="button"
						key={month.id}
						className="border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 h-48 grid place-items-center"
						onClick={() => setSelectedMonth(month.id)}
					>
						<h3 className="text-zinc-950 dark:text-zinc-50">{month.name}</h3>
					</button>
				))}
			</div>
		</div>
	)
}

Testing.displayName = 'Testing'
