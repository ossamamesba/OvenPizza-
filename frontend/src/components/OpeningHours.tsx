import { WEEKDAYS, restaurant } from '../config/restaurant'

/** Tableau des horaires, lundi en premier, jour actuel mis en avant. */
export function OpeningHours() {
  const today = new Date().getDay()
  const order = [1, 2, 3, 4, 5, 6, 0]

  return (
    <table className="w-full text-left">
      <caption className="sr-only">Horaires d'ouverture</caption>
      <tbody>
        {order.map((day) => {
          const isToday = day === today
          return (
            <tr key={day} className={`border-b border-border last:border-0 ${isToday ? 'font-bold text-primary' : ''}`}>
              <th scope="row" className="py-2.5 pr-4 font-semibold">
                {WEEKDAYS[day]} {isToday && <span className="text-sm font-normal">(aujourd'hui)</span>}
              </th>
              <td className="py-2.5 text-right tabular-nums">
                {restaurant.openingHours[day].length === 0
                  ? 'Fermé'
                  : restaurant.openingHours[day].map((r) => <span key={r.open} className="block">{r.open} – {r.close}</span>)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
