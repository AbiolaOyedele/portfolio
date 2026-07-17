import Image from 'next/image'
import Link from 'next/link'
import { cloudinaryUrl } from '@/lib/cloudinary'
import type { Project } from '@/types/project'
import Tag from './Tag'

export interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/project/${project.slug}`} className="group block">
      <div className="rounded-2xl overflow-hidden transition-shadow duration-200 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] group-active:shadow-[0_8px_32px_rgba(0,0,0,0.10)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-bg">
          {project.cover_url && (
            <Image
              src={cloudinaryUrl(project.cover_url, { width: 800 })}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-200 group-hover:scale-[1.03] group-active:scale-[1.03]"
            />
          )}
        </div>
        <div className="pt-3 pb-1">
          <h3 className="text-[16px] text-text-primary" style={{ fontWeight: 400 }}>
            {project.title}
          </h3>
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {project.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
