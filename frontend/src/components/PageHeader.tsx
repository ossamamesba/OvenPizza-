export function PageHeader({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="container-page pb-8 pt-10 md:pt-14">
      <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
      {intro && <p className="mt-3 max-w-2xl text-lg text-muted">{intro}</p>}
    </div>
  )
}
