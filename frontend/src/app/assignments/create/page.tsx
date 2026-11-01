'use client';

export const dynamic = 'force-dynamic';
import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import { authHeaders } from '@/hooks/useApi';

import clsx from 'clsx';
import { Topbar } from '@/components/Topbar';
import { InteriorHero } from '@/components/InteriorHero';
import './teacher.css';

const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Long Answer Questions',
  'True/False Questions',
  'Fill in the Blanks',
  'Match the Following',
];

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ✅ Isolated into its own component so useSearchParams is inside a Suspense boundary
function CreateAssignmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');

  const { form, setForm, addQuestionType, removeQuestionType, updateQuestionType, resetForm, setCurrentAssignment } =
    useAssignmentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.grade.trim()) e.grade = 'Grade is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
    if (form.questionTypes.length === 0) e.qt = 'Add at least one question type';
    form.questionTypes.forEach((qt, i) => {
      if (!qt.type) e[`qt_type_${i}`] = 'Select type';
      if (qt.count < 1) e[`qt_count_${i}`] = 'Min 1';
      if (qt.marks < 1) e[`qt_marks_${i}`] = 'Min 1';
    });
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('subject', form.subject);
      fd.append('grade', form.grade);
      fd.append('dueDate', form.dueDate);
      fd.append('questionTypes', JSON.stringify(form.questionTypes.map(({ id: _, ...qt }) => qt)));
      if (form.additionalInstructions) fd.append('additionalInstructions', form.additionalInstructions);
      if (form.file) fd.append('file', form.file);
      if (groupId) fd.append('groupId', groupId);

      const headers = authHeaders() as Record<string, string>;
      const res = await fetch(`${API}/api/assignments`, {
        method: 'POST',
        headers,
        body: fd,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create assignment');
      }

      const data = await res.json();
      setCurrentAssignment(data.assignment);
      resetForm();
      router.push(`/assignments/${data.assignment._id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalQuestions = form.questionTypes.reduce((s, qt) => s + (qt.count || 0), 0);
  const totalMarks = form.questionTypes.reduce((s, qt) => s + (qt.count || 0) * (qt.marks || 0), 0);

  return (
    <div className="teacher-create-page min-h-full bg-[#F7F5EF]">
      <Topbar title="Create assignment"/>
      <div className="teacher-studio-content"><InteriorHero eyebrow="YOUR NEXT GREAT LESSON" title="Start with an idea." accent="Make room for discovery." description="A thoughtful question can open a whole new world. Shape your paper, bring your materials, and let’s create something worth exploring." kind="ideas"/>
      <div className="teacher-studio-layout"><aside className="assignment-plan"><span className="teacher-kicker">YOUR PAPER, AT A GLANCE</span><h2>A little structure.<br/>Endless possibility.</h2><div className="paper-preview" aria-hidden="true"><span>YOUR NEXT CHAPTER</span><strong>{form.title || 'Something inspiring.'}</strong><i/><i/><i/><div>01 <span>Let curiosity lead the way.</span></div></div><div className="plan-totals"><div><strong>{String(totalQuestions).padStart(2,'0')}</strong><span>Questions</span></div><div><strong>{String(totalMarks).padStart(2,'0')}</strong><span>Total marks</span></div></div><div className="plan-detail"><span>Subject</span><strong>{form.subject || 'A world to explore'}</strong></div><div className="plan-detail"><span>Class</span><strong>{form.grade || 'Your next learners'}</strong></div><div className="plan-detail"><span>Connection</span><strong>{groupId?'Linked to your class':'Personal paper'}</strong></div><p className="plan-note"><span>✦</span> A thoughtful first draft, ready for your expertise. Review the generated paper before sharing.</p></aside>
        <div className="teacher-form-card"><div className="teacher-form-intro"><span className="teacher-kicker">LET’S PUT IT TOGETHER</span><h2>Create your assignment</h2><p>The right details make a good starting point.</p></div>
          <div className="teacher-section-title"><span>01</span><div><h3>Bring your materials</h3><p>A syllabus or reference file can help guide the questions. This is optional.</p></div></div>
          {/* File upload */}
          <div
            className={clsx(
              'teacher-upload border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 mb-6 cursor-pointer transition-colors',
              dragOver ? 'border-[#315ED8] bg-[#315ED8]/10' : 'border-[#E2E5EC] hover:border-[#315ED8]/30'
            )}
            role="button" tabIndex={0} aria-label="Choose reference material"
            onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInputRef.current?.click();}}}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault(); setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) setForm({ file });
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) setForm({ file: e.target.files[0] }); }}
            />
            <div className="w-12 h-12 bg-[#F7F5EF] rounded-full flex items-center justify-center text-2xl">📄</div>
            {form.file ? (
              <div className="text-center">
                <p className="text-sm font-medium text-[#1A1A1A]">{form.file.name}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setForm({ file: null }); }}
                  className="text-xs text-red-400 mt-1"
                >Remove</button>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#6B7280] text-center">Choose a file or drag & drop it here</p>
                <p className="text-xs text-[#9CA3AF]">JPEG, PNG, PDF, up to 10MB</p>
                <button className="px-4 py-1.5 border border-[#E2E5EC] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9F9F9]">
                  Browse Files
                </button>
              </>
            )}
          </div>

          <div className="teacher-section-title"><span>02</span><div><h3>Set the scene</h3><p>Give your assignment a name and choose who it’s for.</p></div></div>
          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5" htmlFor="assignment-title">Assignment Title</label>
              <input
                id="assignment-title" value={form.title}
                onChange={(e) => setForm({ title: e.target.value })}
                placeholder="e.g. Quiz on Electricity"
                className={clsx(
                  'w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors',
                  errors.title ? 'border-red-400' : 'border-[#E2E5EC] focus:border-[#315ED8]'
                )}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5" htmlFor="assignment-subject">Subject</label>
              <input
                id="assignment-subject" value={form.subject}
                onChange={(e) => setForm({ subject: e.target.value })}
                placeholder="e.g. Science"
                className={clsx('w-full px-3 py-2.5 border rounded-lg text-sm outline-none', errors.subject ? 'border-red-400' : 'border-[#E2E5EC] focus:border-[#315ED8]')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5" htmlFor="assignment-grade">Grade / Class</label>
              <input
                id="assignment-grade" value={form.grade}
                onChange={(e) => setForm({ grade: e.target.value })}
                placeholder="e.g. Grade 8"
                className={clsx('w-full px-3 py-2.5 border rounded-lg text-sm outline-none', errors.grade ? 'border-red-400' : 'border-[#E2E5EC] focus:border-[#315ED8]')}
              />
            </div>
          </div>

          {/* Due date */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-[#6B7280] mb-1.5" htmlFor="assignment-dueDate">Due Date</label>
            <input
              type="date"
              id="assignment-dueDate" value={form.dueDate}
              onChange={(e) => setForm({ dueDate: e.target.value })}
              className={clsx('w-full px-3 py-2.5 border rounded-lg text-sm outline-none', errors.dueDate ? 'border-red-400' : 'border-[#E2E5EC] focus:border-[#315ED8]')}
            />
          </div>

          <div className="teacher-section-title"><span>03</span><div><h3>Find the right balance</h3><p>Mix question types and set the marks for each.</p></div></div>
          {/* Question types */}
          <div className="mb-5">
            <div className="teacher-question-labels">
              <label className="text-xs font-medium text-[#6B7280]">Question Type</label>
              <div className="grid grid-cols-2 gap-8 text-xs font-medium text-[#6B7280] mr-8">
                <span>No. of Questions</span>
                <span>Marks</span>
              </div>
            </div>
            <div className="space-y-3">
              {form.questionTypes.map((qt, i) => (
                <div key={qt.id} className="teacher-question-row">
                  <div className="teacher-question-select">
                    <select aria-label={`Question type ${i+1}`}
                      value={qt.type}
                      onChange={(e) => updateQuestionType(qt.id, { type: e.target.value })}
                      className={clsx('w-full px-3 py-2.5 border rounded-lg text-sm outline-none bg-white', errors[`qt_type_${i}`] ? 'border-red-400' : 'border-[#E2E5EC]')}
                    >
                      <option value="">Select type</option>
                      {QUESTION_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center border border-[#E2E5EC] rounded-lg overflow-hidden">
                    <button onClick={() => updateQuestionType(qt.id, { count: Math.max(1, qt.count - 1) })} className="w-8 h-10 flex items-center justify-center text-[#6B7280] hover:bg-[#F9F9F9]">−</button>
                    <span className="w-8 text-center text-sm font-medium">{qt.count}</span>
                    <button onClick={() => updateQuestionType(qt.id, { count: qt.count + 1 })} className="w-8 h-10 flex items-center justify-center text-[#6B7280] hover:bg-[#F9F9F9]">+</button>
                  </div>
                  <div className="flex items-center border border-[#E2E5EC] rounded-lg overflow-hidden">
                    <button onClick={() => updateQuestionType(qt.id, { marks: Math.max(1, qt.marks - 1) })} className="w-8 h-10 flex items-center justify-center text-[#6B7280] hover:bg-[#F9F9F9]">−</button>
                    <span className="w-8 text-center text-sm font-medium">{qt.marks}</span>
                    <button onClick={() => updateQuestionType(qt.id, { marks: qt.marks + 1 })} className="w-8 h-10 flex items-center justify-center text-[#6B7280] hover:bg-[#F9F9F9]">+</button>
                  </div>
                  {form.questionTypes.length > 1 && (
                    <button onClick={() => removeQuestionType(qt.id)} aria-label="Remove question type" className="text-[#9CA3AF] hover:text-red-400 text-lg">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addQuestionType} className="mt-3 flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1A1A1A]">
              <span className="w-5 h-5 rounded-full border border-[#9CA3AF] flex items-center justify-center text-xs">+</span>
              Add Question Type
            </button>
            {totalQuestions > 0 && (
              <div className="mt-3 text-right text-xs text-[#6B7280]">
                <span>Total Questions: {totalQuestions}</span>
                <span className="ml-4">Total Marks: {totalMarks}</span>
              </div>
            )}
          </div>

          <div className="teacher-section-title"><span>04</span><div><h3>Add your perspective</h3><p>A little context helps make this paper your own.</p></div></div>
          {/* Additional instructions */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">
              Additional Info <span className="font-normal">(Optional)</span>
            </label>
            <textarea
              aria-label="Additional instructions" value={form.additionalInstructions}
              onChange={(e) => setForm({ additionalInstructions: e.target.value })}
              placeholder="e.g. Cover chapters 1-3, focus on practical applications..."
              rows={3}
              className="w-full px-3 py-2.5 border border-[#E2E5EC] rounded-lg text-sm outline-none focus:border-[#315ED8] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="teacher-form-actions">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#E2E5EC] rounded-full text-sm text-[#6B7280] hover:bg-[#F9F9F9]"
            >
              ← Previous
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#315ED8] text-[#FFFFFF] rounded-full text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-[#FFFFFF] border-t-transparent rounded-full animate-spin" />Generating...</>
              ) : 'Generate ✦'}
            </button>
          </div>
        </div>
      </div></div>
    </div>
  );
}

// ✅ Default export wraps the form in Suspense to satisfy Next.js requirement
export default function CreateAssignmentPage() {
  return (
    <Suspense fallback={<div className="min-h-full bg-[#F7F5EF] flex items-center justify-center text-sm text-[#9CA3AF]">Loading...</div>}>
      <CreateAssignmentForm />
    </Suspense>
  );
}