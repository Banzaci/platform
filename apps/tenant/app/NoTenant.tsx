export default async function NoTenant() {
  return (
    <html lang="en">
      <body className="m-0 bg-white text-gray-900">
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mb-6 text-7xl font-semibold tracking-tight text-gray-200">
              404
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Property not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              The property you&apos;re looking for doesn&apos;t exist
              or is no longer available.
            </p>
          </div>
        </main>
      </body>
    </html>
  )
}