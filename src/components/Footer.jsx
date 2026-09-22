import { Link } from 'react-router-dom'
import './Footer.css'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Live dashboard demo', to: '/demo' },
      { label: 'How the model works', to: '/#how-it-works' },
      { label: 'Explanation assistant', to: '/#assistant' },
    ],
  },
  {
    title: 'Research',
    links: [
      { label: 'Dataset & methodology', to: '/about' },
      { label: 'NEWS2 baseline comparison', to: '/about' },
      { label: 'Milestones', to: '/about' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'About this prototype', to: '/about' },
      { label: 'Caveats & scope', to: '/about' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo">Sentinel</div>
            <p className="footer__desc">
              A research and portfolio prototype for trend-based patient deterioration
              risk prediction with a grounded AI explanation layer.
            </p>
            <p className="footer__caveat">
              Not a certified clinical device. Not for diagnostic use.
            </p>
          </div>

          <div className="footer__cols">
            {columns.map((col) => (
              <div className="footer__col" key={col.title}>
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2026 Sentinel. Built by Sarthak as a research &amp; portfolio project.</span>
          <span>Simulated data only · MIMIC-derived, de-identified</span>
        </div>
      </div>
    </footer>
  )
}
