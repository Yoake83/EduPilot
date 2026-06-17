import type { Request, Response } from 'express';
import { StudyMaterialModel } from '../models/StudyMaterial';
import { GroupModel } from '../models/Group';
import { extractTextFromPDF, chunkText, findRelevantChunks, generateRAGAnswer } from '../services/rag.service';

export async function uploadMaterial(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { title, subject, groupId } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    // If groupId provided, verify access
    if (groupId) {
      const group = await GroupModel.findById(groupId);
      if (!group) return res.status(404).json({ error: 'Group not found' });

      const isTeacher = group.teacherId === req.user!.userId;
      const isStudent = group.students.some(s => s.userId === req.user!.userId);
      if (!isTeacher && !isStudent && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    console.log(`[rag] Extracting text from ${req.file.originalname}...`);
    const text = await extractTextFromPDF(req.file.path);

    if (!text.trim()) {
      return res.status(400).json({ error: 'Could not extract text from PDF. File may be image-based.' });
    }

    const chunks = chunkText(text);
    console.log(`[rag] Created ${chunks.length} chunks`);

    const material = await StudyMaterialModel.create({
      title,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      uploadedBy: req.user!.userId,
      uploaderName: req.user!.name || 'User',
      uploaderRole: req.user!.role,
      groupId: groupId || undefined,
      subject: subject || undefined,
      chunks: chunks.map((text, index) => ({ text, index })),
      totalChunks: chunks.length,
    });

    // Don't return chunks in response — too large
    const { chunks: _, ...materialData } = material.toObject();
    res.status(201).json({ material: { ...materialData, totalChunks: chunks.length } });
  } catch (err) {
    console.error('[study] upload error:', err);
    res.status(500).json({ error: 'Failed to upload material' });
  }
}

export async function getMaterials(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { groupId } = req.query;

    let query: any = {};

    if (groupId) {
      // Group materials — visible to all group members
      query.groupId = groupId;
    } else {
      // Personal materials + group materials from joined groups
      const groups = await GroupModel.find({
        $or: [
          { teacherId: userId },
          { 'students.userId': userId },
        ],
      });
      const groupIds = groups.map(g => g._id.toString());

      query = {
        $or: [
          { uploadedBy: userId }, // own materials
          { groupId: { $in: groupIds } }, // group materials
        ],
      };
    }

    const materials = await StudyMaterialModel.find(query)
      .select('-chunks') // don't send chunks
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ materials });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
}

export async function deleteMaterial(req: Request, res: Response) {
  try {
    const material = await StudyMaterialModel.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });

    if (material.uploadedBy !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await StudyMaterialModel.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete material' });
  }
}

export async function askQuestion(req: Request, res: Response) {
  try {
    const { materialId, question } = req.body;

    if (!materialId || !question) {
      return res.status(400).json({ error: 'materialId and question are required' });
    }

    const material = await StudyMaterialModel.findById(materialId);
    if (!material) return res.status(404).json({ error: 'Material not found' });

    if (material.chunks.length === 0) {
      return res.status(400).json({ error: 'Material has no processable content' });
    }

    console.log(`[rag] Question: "${question}" on "${material.title}"`);

    const relevantChunks = findRelevantChunks(question, material.chunks);
    const answer = await generateRAGAnswer(question, relevantChunks, material.title);

    res.json({ answer, material: { title: material.title, totalChunks: material.totalChunks } });
  } catch (err) {
    console.error('[study] ask error:', err);
    res.status(500).json({ error: 'Failed to generate answer' });
  }
}