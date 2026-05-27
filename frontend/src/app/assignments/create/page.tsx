'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import clsx from 'clsx';

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

export default function CreateAssignmentPage() {
  const router = useRouter();
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

      const res = await fetch(`${API}/api/assignments`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Failed to create assignment');

      const data = await res.json();
      setCurrentAssignment(data.assignment);
      resetForm();
      router.push(`/assignments/${data.assignment._id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalQuestions = form.questionTypes.reduce((s, qt) => s + (qt.count || 0), 0);
  const totalMarks = form.questionTypes.reduce((s, qt) => s + (qt.count || 0) * (qt.marks || 0), 0);

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      {/* Top bar */}
      <div className="bg-white border-b border-[#E8E8E8] px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[#9CA3AF] hover:text-[#1A1A1A]">←</button>
        <span className="text-sm text-[#9CA3AF]">Assignment</span>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-8">
          <h1 className="text-lg font-semibold text-[#1A1A1A] mb-1">Create Assignment</h1>
          <p className="text-xs text-[#9CA3AF] mb-6">Set up and create a new assignment for your students.</p>

          {/* File upload */}
          <div
            className={clsx(
              'border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 mb-6 cursor-pointer transition-colors',
              dragOver ? 'border-[#F5A623] bg-orange-50' : 'border-[#E8E8E8] hover:border-[#D1D5DB]'
            )}
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
            <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center text-2xl">📄</div>
            {form.file ? (
              <div className="text-center">
                <p className="text-sm font-medium text-[#1A1A1A]">{form.file.name}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setForm({ file: null }); }}
                  className="text-xs text-red-400 mt-1"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#6B7280] text-center">
                  Choose a file or drag & drop it here
                </p>
                <p className="text-xs text-[#9CA3AF]">JPEG, PNG, PDF, up to 10MB</p>
                <button className="px-4 py-1.5 border border-[#E8E8E8] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9F9F9]">
                  Browse Files
                </button>
              </>
            )}
          </div>

          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Assignment Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ title: e.target.value })}
                placeholder="e.g. Quiz on Electricity"
                className={clsx(
                  'w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors',
                  errors.title ? 'border-red-400' : 'border-[#E8E8E8] focus:border-[#F5A623]'
                )}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Subject</label>
              <input
                value={form.subject}
                onChange={(e) => setForm({ subject: e.target.value })}
                placeholder="e.g. Science"
                className={clsx(
                  'w-full px-3 py-2.5 border rounded-lg text-sm outline-none',
                  errors.subject ? 'border-red-400' : 'border-[#E8E8E8] focus:border-[#F5A623]'
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Grade / Class</label>
              <input
                value={form.grade}
                onChange={(e) => setForm({ grade: e.target.value })}
                placeholder="e.g. Grade 8 / Class 5th"
                className={clsx(
                  'w-full px-3 py-2.5 border rounded-lg text-sm outline-none',
                  errors.grade ? 'border-red-400' : 'border-[#E8E8E8] focus:border-[#F5A623]'
                )}
              />
            </div>
          </div>

          {/* Due date */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ dueDate: e.target.value })}
              className={clsx(
                'w-full px-3 py-2.5 border rounded-lg text-sm outline-none',
                errors.dueDate ? 'border-red-400' : 'border-[#E8E8E8] focus:border-[#F5A623]'
              )}
            />
          </div>

          {/* Question types */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#6B7280]">Question Type</label>
              <div className="grid grid-cols-2 gap-8 text-xs font-medium text-[#6B7280] mr-8">
                <span>No. of Questions</span>
                <span>Marks</span>
              </div>
            </div>

            <div className="space-y-3">
              {form.questionTypes.map((qt, i) => (
                <div key={qt.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <select
                      value={qt.type}
                      onChange={(e) => updateQuestionType(qt.id, { type: e.target.value })}
                      className={clsx(
                        'w-full px-3 py-2.5 border rounded-lg text-sm outline-none bg-white',
                        errors[`qt_type_${i}`] ? 'border-red-400' : 'border-[#E8E8E8]'
                      )}
                    >
                      <option value="">Select type</option>
                      {QUESTION_TYPE_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  {/* Count stepper */}
                  <div className="flex items-center border border-[#E8E8E8] rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuestionType(qt.id, { count: Math.max(1, qt.count - 1) })}
                      className="w-8 h-10 flex items-center justify-center text-[#6B7280] hover:bg-[#F9F9F9]"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{qt.count}</span>
                    <button
                      onClick={() => updateQuestionType(qt.id, { count: qt.count + 1 })}
                      className="w-8 h-10 flex items-center justify-center text-[#6B7280] hover:bg-[#F9F9F9]"
                    >
                      +
                    </button>
                  </div>
                  {/* Marks stepper */}
                  <div className="flex items-center border border-[#E8E8E8] rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuestionType(qt.id, { marks: Math.max(1, qt.marks - 1) })}
                      className="w-8 h-10 flex items-center justify-center text-[#6B7280] hover:bg-[#F9F9F9]"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{qt.marks}</span>
                    <button
                      onClick={() => updateQuestionType(qt.id, { marks: qt.marks + 1 })}
                      className="w-8 h-10 flex items-center justify-center text-[#6B7280] hover:bg-[#F9F9F9]"
                    >
                      +
                    </button>
                  </div>
                  {form.questionTypes.length > 1 && (
                    <button
                      onClick={() => removeQuestionType(qt.id)}
                      className="text-[#9CA3AF] hover:text-red-400 text-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addQuestionType}
              className="mt-3 flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1A1A1A]"
            >
              <span className="w-5 h-5 rounded-full border border-[#9CA3AF] flex items-center justify-center text-xs">+</span>
              Add Question Type
            </button>

            {totalQuestions > 0 && (
              <div className="mt-3 text-right text-xs text-[#6B7280]">
                <span>Total Questions : {totalQuestions}</span>
                <span className="ml-4">Total Marks : {totalMarks}</span>
              </div>
            )}
          </div>

          {/* Additional instructions */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">
              Additional Info <span className="font-normal">(Optional, for better output)</span>
            </label>
            <textarea
              value={form.additionalInstructions}
              onChange={(e) => setForm({ additionalInstructions: e.target.value })}
              placeholder="e.g. Cover chapters 1-3, focus on practical applications..."
              rows={3}
              className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm outline-none focus:border-[#F5A623] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#E8E8E8] rounded-full text-sm text-[#6B7280] hover:bg-[#F9F9F9]"
            >
              ← Previous
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                'Next →'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
