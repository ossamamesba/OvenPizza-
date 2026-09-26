import { PageHeader } from '../components/PageHeader'
import { PizzaGrid } from '../components/PizzaGrid'
import { restaurant } from '../config/restaurant'

export function MenuPage() {
  return (
    <>
      <title>{`Menu — ${restaurant.name}`}</title>
      <PageHeader title="Notre menu" intro="Toutes nos pizzas disponibles aujourd'hui. Prix en dirhams (DH)." />
      <div className="container-page">
        <PizzaGrid />
      </div>
    </>
  )
}
