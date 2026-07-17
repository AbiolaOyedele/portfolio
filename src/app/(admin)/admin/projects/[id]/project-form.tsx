'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import ImageUrlListInput from '@/components/features/admin/ImageUrlListInput'
import Button from '@/components/ui/Button'
import { PROJECT_CATEGORIES, type Project, type ProjectCategory } from '@/types/project'
import { slugify } from '@/utils/slugify'

import { createProjectAction, updateProjectAction } from './actions'

const GRAPHICS_SUBCATEGORY_OPTIONS = ['Branding', 'Social Media', 'Decks'] as const

/**
 * Local, always-string-friendly shape the form edits. Converted to the
 * strict `CreateProjectInput`/`UpdateProjectInput` shape on submit.
 */
interface ProjectFormValues {
  title: string
  slug: string
  category: ProjectCategory
  subcategory: string
  description: string
  cover_url: string
  images: string[]
  video_url: string
  tagsInput: string
  toolsInput: string
  scopeInput: string
  visible: boolean
  sort_order: string
}

export interface ProjectFormProps {
  /** When omitted, the form is in "create" mode. */
  defaultValues?: Project
}

const EMPTY_VALUES: ProjectFormValues = {
  title: '',
  slug: '',
  category: 'graphics',
  subcategory: '',
  description: '',
  cover_url: '',
  images: [],
  video_url: '',
  tagsInput: '',
  toolsInput: '',
  scopeInput: '',
  visible: true,
  sort_order: '0',
}

function toFormValues(project: Project): ProjectFormValues {
  return {
    title: project.title,
    slug: project.slug,
    category: project.category,
    subcategory: project.subcategory ?? '',
    description: project.description ?? '',
    cover_url: project.cover_url ?? '',
    images: project.images ?? [],
    video_url: project.video_url ?? '',
    tagsInput: (project.tags ?? []).join(', '),
    toolsInput: (project.tools ?? []).join(', '),
    scopeInput: (project.scope ?? []).join(', '),
    visible: project.visible,
    sort_order: String(project.sort_order),
  }
}

/** Split a comma-separated input into a trimmed, empty-filtered string array. */
function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const FIELD_CLASSES =
  'w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-text-primary/20'

/**
 * Create/edit form for a single project. Ported from the old
 * `AdminProjectForm.jsx`: same fields, same slug auto-generation on create,
 * same conditional subcategory field, same comma-separated tags input and
 * image URL list — now backed by typed Server Actions and Zod validation
 * instead of a direct Supabase client call.
 */
export default function ProjectForm({ defaultValues }: ProjectFormProps): React.JSX.Element {
  const router = useRouter()
  const isNew = !defaultValues
  const [values, setValues] = useState<ProjectFormValues>(
    defaultValues ? toFormValues(defaultValues) : EMPTY_VALUES,
  )
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProjectFormValues, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function updateField<K extends keyof ProjectFormValues>(field: K, value: ProjectFormValues[K]): void {
    setValues((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && isNew) {
        next.slug = slugify(String(value))
      }
      if (field === 'category' && value !== 'graphics') {
        next.subcategory = ''
      }
      return next
    })
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  /**
   * Maps a raw Zod/AppError message to the specific field it applies to, so
   * we can show it inline where possible. Falls back to a form-level summary
   * when the field can't be confidently determined.
   */
  function applyErrorMessage(message: string): void {
    const fieldByKeyword: { keyword: string; field: keyof ProjectFormValues }[] = [
      { keyword: 'Title', field: 'title' },
      { keyword: 'Slug', field: 'slug' },
      { keyword: 'Subcategory', field: 'subcategory' },
      { keyword: 'Description', field: 'description' },
      { keyword: 'Cover URL', field: 'cover_url' },
      { keyword: 'image', field: 'images' },
      { keyword: 'Video URL', field: 'video_url' },
      { keyword: 'tag', field: 'tagsInput' },
      { keyword: 'tool', field: 'toolsInput' },
      { keyword: 'scope', field: 'scopeInput' },
      { keyword: 'Sort order', field: 'sort_order' },
    ]

    const match = fieldByKeyword.find((entry) => message.includes(entry.keyword))
    if (match) {
      setFieldErrors((prev) => ({ ...prev, [match.field]: message }))
    }
    setFormError(message)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    setSuccessMessage(null)
    setFieldErrors({})

    const parsedSortOrder = Number.parseInt(values.sort_order, 10)
    const payload = {
      title: values.title,
      slug: values.slug,
      category: values.category,
      subcategory: values.category === 'graphics' ? values.subcategory || null : null,
      description: values.description || null,
      cover_url: values.cover_url || null,
      images: values.images,
      video_url: values.video_url || null,
      tags: splitCsv(values.tagsInput),
      tools: splitCsv(values.toolsInput),
      scope: splitCsv(values.scopeInput),
      visible: values.visible,
      sort_order: Number.isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
    }

    const result = isNew
      ? await createProjectAction(payload)
      : await updateProjectAction(defaultValues.id, { ...payload, id: defaultValues.id })

    setSaving(false)

    if (!result.success) {
      applyErrorMessage(result.error?.message ?? 'We could not save this project. Please try again.')
      return
    }

    setSuccessMessage(isNew ? 'Project created.' : 'Changes saved.')
    if (!isNew) {
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-xl px-4 py-3 text-sm bg-red-50 border border-red-200 text-red-700"
        >
          {formError}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-xl px-4 py-3 text-sm bg-green-50 border border-green-200 text-green-700"
        >
          {successMessage}
        </div>
      )}

      <FormField label="Title" error={fieldErrors.title}>
        <input
          type="text"
          value={values.title}
          onChange={(e) => updateField('title', e.target.value)}
          required
          className={FIELD_CLASSES}
        />
      </FormField>

      <FormField label="Slug" error={fieldErrors.slug}>
        <input
          type="text"
          value={values.slug}
          onChange={(e) => updateField('slug', e.target.value)}
          required
          className={FIELD_CLASSES}
        />
      </FormField>

      <FormField label="Category" error={undefined}>
        <select
          value={values.category}
          onChange={(e) => updateField('category', e.target.value as ProjectCategory)}
          className={FIELD_CLASSES}
        >
          {PROJECT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </FormField>

      {values.category === 'graphics' && (
        <FormField label="Subcategory" error={fieldErrors.subcategory}>
          <select
            value={values.subcategory}
            onChange={(e) => updateField('subcategory', e.target.value)}
            className={FIELD_CLASSES}
          >
            <option value="">Select subcategory...</option>
            {GRAPHICS_SUBCATEGORY_OPTIONS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <FormField label="Description" error={fieldErrors.description}>
        <textarea
          rows={4}
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          className={FIELD_CLASSES}
        />
      </FormField>

      <FormField label="Cover URL" error={fieldErrors.cover_url}>
        <input
          type="url"
          value={values.cover_url}
          onChange={(e) => updateField('cover_url', e.target.value)}
          placeholder="https://res.cloudinary.com/..."
          className={FIELD_CLASSES}
        />
      </FormField>

      <div>
        <ImageUrlListInput value={values.images} onChange={(next) => updateField('images', next)} />
        {fieldErrors.images && <p className="mt-2 text-sm text-red-600">{fieldErrors.images}</p>}
      </div>

      <FormField label="Video URL (Vimeo)" error={fieldErrors.video_url}>
        <input
          type="url"
          value={values.video_url}
          onChange={(e) => updateField('video_url', e.target.value)}
          placeholder="https://player.vimeo.com/video/..."
          className={FIELD_CLASSES}
        />
      </FormField>

      <FormField label="Tags (comma-separated)" error={fieldErrors.tagsInput}>
        <input
          type="text"
          value={values.tagsInput}
          onChange={(e) => updateField('tagsInput', e.target.value)}
          placeholder="branding, logo, identity"
          className={FIELD_CLASSES}
        />
      </FormField>

      <FormField label="Tools + Tech (comma-separated)" error={fieldErrors.toolsInput}>
        <input
          type="text"
          value={values.toolsInput}
          onChange={(e) => updateField('toolsInput', e.target.value)}
          placeholder="Figma, Photoshop, GSAP"
          className={FIELD_CLASSES}
        />
      </FormField>

      <FormField label="Scope (comma-separated)" error={fieldErrors.scopeInput}>
        <input
          type="text"
          value={values.scopeInput}
          onChange={(e) => updateField('scopeInput', e.target.value)}
          placeholder="Art Direction, UI Design"
          className={FIELD_CLASSES}
        />
      </FormField>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={values.visible}
            onChange={(e) => updateField('visible', e.target.checked)}
            className="w-4 h-4"
          />
          Visible
        </label>

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="number"
            value={values.sort_order}
            onChange={(e) => updateField('sort_order', e.target.value)}
            className="w-20 border border-border rounded-xl px-3 py-2 text-sm bg-surface"
          />
          Sort order
        </label>
      </div>
      {fieldErrors.sort_order && <p className="text-sm text-red-600">{fieldErrors.sort_order}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : isNew ? 'Create project' : 'Save changes'}
      </Button>
    </form>
  )
}

interface FormFieldProps {
  label: string
  error: string | undefined
  children: React.ReactNode
}

function FormField({ label, error, children }: FormFieldProps): React.JSX.Element {
  return (
    <div>
      <label className="block text-sm text-text-secondary mb-2">{label}</label>
      {children}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
