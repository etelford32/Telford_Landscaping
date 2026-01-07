// Simple in-memory user storage
// In production, this would be a database (PostgreSQL, MongoDB, etc.)

export interface User {
  id: string;
  email: string;
  password: string; // Hashed
  name: string;
  createdAt: Date;
  subscription: 'free' | 'pro';
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  subscription: 'free' | 'pro';
}

// In-memory storage (replace with database in production)
const users: User[] = [];

export const userStorage = {
  // Create a new user
  createUser: async (email: string, password: string, name: string): Promise<User> => {
    const bcrypt = require('bcryptjs');

    // Check if user exists
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      subscription: 'free',
    };

    users.push(user);
    return user;
  },

  // Find user by email
  findByEmail: async (email: string): Promise<User | null> => {
    return users.find(u => u.email === email) || null;
  },

  // Find user by ID
  findById: async (id: string): Promise<User | null> => {
    return users.find(u => u.id === id) || null;
  },

  // Verify password
  verifyPassword: async (password: string, hashedPassword: string): Promise<boolean> => {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, hashedPassword);
  },

  // Get all users (for debugging)
  getAllUsers: (): User[] => {
    return users.map(u => ({ ...u, password: '[REDACTED]' })) as any;
  },
};
