export async function onRequestGet(ctx) {
	const path = new URL(ctx.request.url).pathname.replace("/i/", "");
	const file = await ctx.env.I.get(path);
	if (!file) return new Response(null, { status: 404 });
	return new Response(file.body, {
		headers: { "Content-Type": file.httpMetadata.contentType },
	});
}
