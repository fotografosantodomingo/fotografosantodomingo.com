export const runtime = 'edge'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold text-gray-900">404</h1>
        <p className="mt-3 text-gray-600">
          La pagina que buscas no esta disponible.
        </p>
      </div>
    </main>
  )
}
