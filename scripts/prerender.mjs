import { createServer } from 'vite'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import React from 'react'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROUTES = [
  { path: '/', module: '/src/pages/LandingPage/LandingPage.jsx', output: 'index.html' },
  { path: '/faq', module: '/src/pages/PublicFAQ/PublicFAQ.jsx', output: 'faq.html' },
  { path: '/contact', module: '/src/pages/PublicContact/PublicContact.jsx', output: 'contact.html' },
  { path: '/privacy', module: '/src/pages/PublicPrivacy/PublicPrivacy.jsx', output: 'privacy.html' },
  { path: '/terms', module: '/src/pages/PublicTerms/PublicTerms.jsx', output: 'terms.html' },
  { path: '/refund', module: '/src/pages/PublicRefund/PublicRefund.jsx', output: 'refund.html' },
  { path: '/founder', module: '/src/pages/PublicFounder/PublicFounder.jsx', output: 'founder.html' },
  { path: '/delete-account', module: '/src/pages/PublicDeleteAccount/PublicDeleteAccount.jsx', output: 'delete-account.html' },
]

async function prerender() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })

  const template = await readFile(path.resolve('dist/index.html'), 'utf-8')
  const { InstallProvider } = await vite.ssrLoadModule('/src/contexts/InstallContext.jsx')

  for (const route of ROUTES) {
    const mod = await vite.ssrLoadModule(route.module)
    const Component = mod.default

    const appHtml = renderToStaticMarkup(
      React.createElement(
        StaticRouter,
        { location: route.path },
        React.createElement(
          InstallProvider,
          null,
          React.createElement(Component)
        )
      )
    )

    const finalHtml = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`
    )

    await writeFile(path.join('dist', route.output), finalHtml)
    console.log(`Prerendered ${route.path} -> ${route.output}`)
  }

  await vite.close()
}

prerender().catch(error => {
  console.error(error)
  process.exit(1)
})
