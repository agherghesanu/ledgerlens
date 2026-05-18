export default async function CaseReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-text-mute cap">Case {id}</p>
    </div>
  )
}
