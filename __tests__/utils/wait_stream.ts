export async function waitStream(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}
