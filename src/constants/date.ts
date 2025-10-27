import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MONTH_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

export const MONTHS = MONTH_NUMBERS.map((month) => ({
	id: month,
	name: format(new Date().setMonth(month), 'MMMM', { locale: ptBR }),
}))
