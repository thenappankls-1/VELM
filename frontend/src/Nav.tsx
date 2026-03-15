import './Nav.css'

export type Page = 'create' | 'data' | 'trace' | 'coverage'

interface NavProps {
  page: Page
  onPage: (p: Page) => void
}

const PAGES: { id: Page; label: string }[] = [
  { id: 'create', label: 'Create data' },
  { id: 'data', label: 'Data view' },
  { id: 'trace', label: 'Traceability & Impact' },
  { id: 'coverage', label: 'Coverage metrics' },
]

export function Nav({ page, onPage }: NavProps) {
  return (
    <nav className="velm-nav">
      {PAGES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`velm-nav-link ${page === id ? 'velm-nav-link-active' : ''}`}
          onClick={() => onPage(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}
