import { Eyebrow } from './Eyebrow'

export function PageHeader({ title, intro, eyebrow }: { title: string; intro?: string; eyebrow?: string }) {
  return (
    <div className="container-page pb-8 pt-10 md:pt-14">
      {eyebrow && <div className="mb-4"><Eyebrow>{eyebrow}</Eyebrow></div>}
      <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
      {intro && <p className="mt-3 max-w-2xl text-lg text-muted">{intro}</p>}
    </div>
  )
}
