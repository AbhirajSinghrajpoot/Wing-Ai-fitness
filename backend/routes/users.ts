import express from 'express';
import db from '../database/database.js';

const router = express.Router();

// Get Current User Profile
router.get('/profile', (req: any, res) => {
  const userId = req.user.userId;

  try {
    const user = db.prepare(`
      SELECT id, name, email, age, gender, height, weight,
             activity_level, goal, sleep_hours, dietary_restrictions,
             is_verified, google_id, github_id, created_at
      FROM users WHERE id = ?
    `).get(userId) as any;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Map DB snake_case columns → camelCase shape expected by the frontend UserProfile type
    const profile = {
      ...user,
      activityLevel: user.activity_level,
      goals: user.goal,                    // Frontend uses 'goals', DB stores as 'goal'
      sleepHours: user.sleep_hours,
      dietaryRestrictions: user.dietary_restrictions,
    };
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve profile" });
  }
});

// Update Profile
router.post('/profile', (req: any, res) => {
  const userId = req.user.userId;
  // Accept both 'goals' (frontend) and 'goal' (legacy) for backward compatibility
  const { age, gender, height, weight, activityLevel, goals, goal, sleepHours, dietaryRestrictions } = req.body;
  const goalValue = goals ?? goal; // Prefer 'goals' from frontend

  try {
    const stmt = db.prepare(`
      UPDATE users
      SET age = ?, gender = ?, height = ?, weight = ?, activity_level = ?, goal = ?, sleep_hours = ?, dietary_restrictions = ?
      WHERE id = ?
    `);

    // activityLevel (camelCase from frontend) maps to activity_level column
    // goalValue uses 'goals' from frontend, stored as 'goal' in DB
    stmt.run(age, gender, height, weight, activityLevel, goalValue, sleepHours, dietaryRestrictions, userId);

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create User
router.post('/', (req, res) => {
  const { name, email, age, gender, height, weight, activityLevel, goals, sleepHours, dietaryRestrictions } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, age, gender, height, weight, activity_level, goal, sleep_hours, dietary_restrictions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(name, email, age, gender, height, weight, activityLevel, goals, sleepHours, dietaryRestrictions);

    res.status(201).json({ id: info.lastInsertRowid, message: "User created successfully" });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("User creation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get User Progress
router.get('/:id/progress', (req, res) => {
  const { id } = req.params;

  try {
    const progress = db.prepare('SELECT * FROM progress WHERE user_id = ? ORDER BY date DESC').all(id);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve progress" });
  }
});

export default router;
