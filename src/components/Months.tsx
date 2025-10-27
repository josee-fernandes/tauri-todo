import { MONTHS } from '@/constants/date'

interface IMonthsProps {
	updateSelectedMonth: (monthId: number) => void
}

export const Months: React.FC<IMonthsProps> = ({ updateSelectedMonth }) => {
	const handleSelectedMonth = (monthId: number) => {
		updateSelectedMonth(monthId)
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-opacity-in">
			{MONTHS.map((month) => (
				<button
					type="button"
					key={month.id}
					className="border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-800 font-semibold text-zinc-950 dark:text-zinc-50 rounded-lg p-2 h-48 grid place-items-center cursor-pointer transition-all "
					onClick={() => handleSelectedMonth(month.id)}
				>
					<h3 className="text-zinc-950 dark:text-zinc-50 text-center capitalize">{month.name}</h3>
				</button>
			))}
		</div>
	)
}

Months.displayName = 'Months'
