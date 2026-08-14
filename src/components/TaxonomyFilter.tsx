import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { db } from '../db/db';
import type { SyncedProject, SyncedTag } from '../types/sync';

interface TaxonomyFilterProps {
  selectedProjectIds: Set<string> | null;
  selectedTagIds: Set<string> | null;
  onChange: (
    projectIds: Set<string> | null,
    tagIds: Set<string> | null,
  ) => void;
}

export function TaxonomyFilter({
  selectedProjectIds,
  selectedTagIds,
  onChange,
}: TaxonomyFilterProps) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<SyncedProject[]>([]);
  const [tags, setTags] = useState<SyncedTag[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    db.projects.toArray().then(setProjects);
    db.tags.toArray().then(setTags);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const projectCount = selectedProjectIds?.size ?? 0;
  const tagCount = selectedTagIds?.size ?? 0;

  const label =
    projectCount === 0 && tagCount === 0
      ? 'All projects & tags'
      : [
          projectCount > 0 &&
            `${projectCount} project${projectCount === 1 ? '' : 's'}`,
          tagCount > 0 && `${tagCount} tag${tagCount === 1 ? '' : 's'}`,
        ]
          .filter(Boolean)
          .join(', ');

  const toggleProject = (id: string) => {
    const current = selectedProjectIds
      ? new Set(selectedProjectIds)
      : new Set<string>();
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    onChange(current.size === 0 ? null : current, selectedTagIds);
  };

  const toggleTag = (id: string) => {
    const current = selectedTagIds
      ? new Set(selectedTagIds)
      : new Set<string>();
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    onChange(selectedProjectIds, current.size === 0 ? null : current);
  };

  const clearProjects = () => onChange(null, selectedTagIds);
  const clearTags = () => onChange(selectedProjectIds, null);

  const hasData = projects.length > 0 || tags.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl">
          {!hasData && (
            <p className="px-3 py-3 text-xs text-slate-500">
              No projects or tags found. Sync first to load data.
            </p>
          )}

          {hasData && (
            <>
              {projects.length > 0 && (
                <div className="border-b border-slate-700 pb-1">
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Projects
                    </span>
                    {selectedProjectIds && (
                      <button
                        type="button"
                        onClick={clearProjects}
                        className="text-xs text-sky-400 hover:text-sky-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {projects.map((project) => {
                      const checked =
                        selectedProjectIds?.has(project.id) ?? false;
                      return (
                        <label
                          key={project.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProject(project.id)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-800 [accent-color:#0ea5e9]"
                          />
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="truncate">{project.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div className="pt-1">
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Tags
                    </span>
                    {selectedTagIds && (
                      <button
                        type="button"
                        onClick={clearTags}
                        className="text-xs text-sky-400 hover:text-sky-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {tags.map((tag) => {
                      const checked = selectedTagIds?.has(tag.id) ?? false;
                      return (
                        <label
                          key={tag.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTag(tag.id)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-800 [accent-color:#0ea5e9]"
                          />
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="truncate">{tag.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default TaxonomyFilter;
