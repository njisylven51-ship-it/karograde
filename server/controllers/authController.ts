import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { isInMemory, memoryStore } from "../config/db";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "karograde_fallback_super_secret_key_2026";

export async function signup(req: Request, res: Response): Promise<any> {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const targetRole = role === "ADMIN" ? "ADMIN" : "STUDENT";

    // 1. Check if user already exists
    let existingUser = null;

    if (isInMemory()) {
      existingUser = memoryStore.users.find((u) => u.email === normalizedEmail);
    } else {
      existingUser = await (User as any).findOne({ email: normalizedEmail });
    }

    if (existingUser) {
      return res.status(400).json({ error: "A user with this email already exists" });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User
    let newUser: any;

    if (isInMemory()) {
      newUser = {
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: targetRole,
        createdAt: new Date(),
      };
      memoryStore.users.push(newUser);
    } else {
      newUser = await (User as any).create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: targetRole,
      });
    }

    // 4. Generate JWT
    const tokenPayload = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: tokenPayload,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "An error occurred during registration" });
  }
}

export async function login(req: Request, res: Response): Promise<any> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find User
    let user = null;

    if (isInMemory()) {
      user = memoryStore.users.find((u) => u.email === normalizedEmail);
    } else {
      user = await (User as any).findOne({ email: normalizedEmail });
    }

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 2. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 3. Generate JWT
    const tokenPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: tokenPayload,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
}
