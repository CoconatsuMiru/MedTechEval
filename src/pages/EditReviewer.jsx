import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'
import Card from '../components/Card'
import Button from '../components/Button'

function EditReviewer() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { fetchReviewerByCode, updateReviewer } = useReviewers()

  const [reviewer, setReviewer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [title, setTitle] = useState('')
  const [passingThreshold, setPassingThreshold] = useState(70)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReviewer()
  }, [code])

  async function loadReviewer() {
    setLoading(true)
    const data = await fetchReviewerByCode(code)
    if (!data) {
      setNotFound(true)
    } else {
      setReviewer(data)
      setTitle(data.title)
      setPassingThreshold(data.passing_threshold)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading reviewer...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-slate-800 mb-2">Reviewer Not Found</h1>
          <p className="text-slate-600 mb-4">No reviewer exists with code: <strong>{code}</strong></p>
          <Link to="/teacher" className="text-blue-600 hover:underline text-sm">
            ← Back to Teacher Portal
          </Link>
        </Card>
      </div>
    );
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      await updateReviewer(reviewer.id, {
        title: title.trim(),
        passing_threshold: Number(passingThreshold)
      })
      setSaved(true)
    } catch (err) {
      setError('Failed to save changes. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Edit Reviewer</h1>
        <p className="text-slate-500 mb-6 text-sm">Code: <span className="font-mono">{code}</span></p>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setSaved(false)
              }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Passing Threshold (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={passingThreshold}
              onChange={(e) => {
                setPassingThreshold(e.target.value)
                setSaved(false)
              }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {saved && (
          <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            ✅ Changes saved.
          </p>
        )}

        <Link to="/teacher" className="block mt-6 text-sm text-blue-600 hover:underline">
          ← Back to Teacher Portal
        </Link>
      </Card>
    </div>
  );
}

export default EditReviewer;