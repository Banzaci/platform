// export async function GET(request: Request) {
//   const host = new URL(request.url).searchParams.get("host");

//   const res = await fetch(`${process.env.PLATFORM_API_URL}v1/tenants/resolve?host=${host}`, {
//     headers: { "X-Api-Key": process.env.PLATFORM_API_KEY! },
//     next: { revalidate: 300 },
//   });

//   if (!res.ok) {
//     return Response.json({ detail: "Not found" }, { status: res.status });
//   }

//   return Response.json(await res.json());
// }