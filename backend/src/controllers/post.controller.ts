import type { Request, Response } from 'express';
import { PostModel } from '../models/Post';
import { GroupModel } from '../models/Group';

export async function getPosts(req: Request, res: Response) {
  try {
    const { groupId } = req.params;
    const posts = await PostModel.find({ groupId })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50);
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

export async function createPost(req: Request, res: Response) {
  try {
    const { groupId } = req.params;
    const { title, content, tags } = req.body;

    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

    // Verify user is in the group
    const group = await GroupModel.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const isTeacher = group.teacherId === req.user!.userId;
    const isStudent = group.students.some(s => s.userId === req.user!.userId);
    if (!isTeacher && !isStudent && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const post = await PostModel.create({
      groupId,
      userId: req.user!.userId,
      userName: req.user!.name || 'User',
      userRole: req.user!.role,
      title,
      content,
      tags: tags || [],
      upvotes: [],
      replies: [],
    });

    res.status(201).json({ post });
  } catch (err) {
    console.error('[post] create error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
}

export async function upvotePost(req: Request, res: Response) {
  try {
    const post = await PostModel.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user!.userId;
    const alreadyUpvoted = post.upvotes.includes(userId);

    if (alreadyUpvoted) {
      post.upvotes = post.upvotes.filter(id => id !== userId);
    } else {
      post.upvotes.push(userId);
    }

    await post.save();
    res.json({ post, upvoted: !alreadyUpvoted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upvote' });
  }
}

export async function addReply(req: Request, res: Response) {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const post = await PostModel.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.replies.push({
      userId: req.user!.userId,
      userName: req.user!.name || 'User',
      content,
      createdAt: new Date(),
    });

    await post.save();
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add reply' });
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    const post = await PostModel.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.userId !== req.user!.userId && req.user!.role !== 'admin' && req.user!.role !== 'teacher') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await PostModel.findByIdAndDelete(req.params.postId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
}

export async function togglePin(req: Request, res: Response) {
  try {
    const post = await PostModel.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.isPinned = !post.isPinned;
    await post.save();
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Failed to pin post' });
  }
}