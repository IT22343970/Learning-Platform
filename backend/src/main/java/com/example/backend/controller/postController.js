const Post = require('../models/Post');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, author, images, group } = req.body;
    
    if (!content || !author) {
      return res.status(400).json({ message: 'Post content and author are required' });
    }

    const newPost = new Post({
      title,
      content,
      author,
      images: images || [],
      group,
      createdAt: new Date()
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error while creating post', error: error.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error while fetching posts' });
  }
};

// Get posts by group
exports.getPostsByGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const posts = await Post.find({ group: groupId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching group posts:', error);
    res.status(500).json({ message: 'Server error while fetching group posts' });
  }
};
