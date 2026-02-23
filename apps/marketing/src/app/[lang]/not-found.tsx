import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFFBFE] to-white px-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-[#5B297F] mb-4">404</h1>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[#5B297F] mb-2">
            ¡Ups! Parece que te has perdido
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            La página que estás buscando no existe o ha sido movida a otra ubicación.
          </p>
        </div>

        <Link
          href="/es"
          className="inline-flex items-center px-6 py-3 rounded-full
                     bg-[#5B297F] text-white font-medium
                     hover:bg-[#6934D2] transition-colors duration-300
                     shadow-lg hover:shadow-xl"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
