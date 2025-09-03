import { RequestHandler } from "express";
import Society from "../models/Society";
import User from "../models/User";
import AuthUtils, { AuthenticatedRequest } from "../utils/auth";
import mongoose from "mongoose";
import MockDataService from "../services/mockData";

// Get all societies (Admin only)
export const getAllSocieties: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can view all societies" });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;
    let societies;

    if (isMongoConnected) {
      societies = await Society.find({ status: "active" })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
    } else {
      societies = await MockDataService.getAllSocieties();
    }

    res.json({ societies });
  } catch (error) {
    console.error("Get societies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get society by ID
export const getSocietyById: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { id } = req.params;
    const isMongoConnected = mongoose.connection.readyState === 1;
    let society;

    if (isMongoConnected) {
      society = await Society.findById(id).populate("createdBy", "name email");
    } else {
      society = await MockDataService.findSocietyById(id);
    }

    if (!society) {
      return res.status(404).json({ error: "Society not found" });
    }

    // Check access permissions
    if (req.user.role === "society_user" || req.user.role === "agent") {
      if (req.user.societyId?.toString() !== id) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    res.json({ society });
  } catch (error) {
    console.error("Get society error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new society (Admin only)
export const createSociety: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can create societies" });
    }

    const { name, address, registrationNumber, contactInfo } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: "Name and address are required" });
    }

    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zipCode
    ) {
      return res.status(400).json({ error: "Complete address is required" });
    }

    const societyData = {
      name,
      address: {
        ...address,
        country: address.country || "India",
      },
      registrationNumber,
      contactInfo: contactInfo || {},
      createdBy: req.user._id,
      status: "active" as const,
    };

    const isMongoConnected = mongoose.connection.readyState === 1;
    let society;

    if (isMongoConnected) {
      // Check if society name already exists
      const existingSociety = await Society.findOne({ name });
      if (existingSociety) {
        return res
          .status(409)
          .json({ error: "Society with this name already exists" });
      }

      society = new Society(societyData);
      await society.save();
      await society.populate("createdBy", "name email");
    } else {
      society = await MockDataService.createSociety(societyData);
    }

    res.status(201).json({
      message: "Society created successfully",
      society,
    });
  } catch (error) {
    console.error("Create society error:", error);
    if (error.code === 11000) {
      res.status(409).json({ error: "Society with this name already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

// Update society (Admin only)
export const updateSociety: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can update societies" });
    }

    const { id } = req.params;
    const updates = req.body;

    // Remove immutable fields
    delete updates._id;
    delete updates.createdBy;
    delete updates.createdAt;

    const isMongoConnected = mongoose.connection.readyState === 1;
    let society;

    if (isMongoConnected) {
      society = await Society.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true },
      ).populate("createdBy", "name email");
    } else {
      society = await MockDataService.findSocietyById(id);
      if (society) {
        Object.assign(society, updates, { updatedAt: new Date() });
      }
    }

    if (!society) {
      return res.status(404).json({ error: "Society not found" });
    }

    res.json({
      message: "Society updated successfully",
      society,
    });
  } catch (error) {
    console.error("Update society error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create society user (Admin only)
export const createSocietyUser: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can create society users" });
    }

    const { name, email, role, societyId, permissions } = req.body;

    if (!name || !email || !role || !societyId) {
      return res
        .status(400)
        .json({ error: "Name, email, role, and society ID are required" });
    }

    if (!["society_user", "agent"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    // Check if society exists
    let society;
    if (isMongoConnected) {
      society = await Society.findById(societyId);
    } else {
      society = await MockDataService.findSocietyById(societyId);
    }

    if (!society) {
      return res.status(400).json({ error: "Society not found" });
    }

    // Check if user with email already exists
    let existingUser;
    if (isMongoConnected) {
      existingUser = await User.findOne({ email });
    } else {
      existingUser = await MockDataService.findUserByEmail(email);
    }

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await AuthUtils.hashPassword(tempPassword);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      societyId,
      permissions: permissions || {
        canRead: true,
        canWrite: role === "society_user",
      },
      isEmailVerified: false,
    };

    let user;
    if (isMongoConnected) {
      user = new User(userData);
      await user.save();
      await user.populate("societyId", "name");
    } else {
      user = await MockDataService.createUser(userData);
    }

    // In a real application, you would send an email with the temporary password
    // For demo purposes, we'll return it in the response
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        societyId: user.societyId,
        permissions: user.permissions,
        isEmailVerified: user.isEmailVerified,
      },
      temporaryPassword: tempPassword, // Remove this in production
    });
  } catch (error) {
    console.error("Create society user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get society users (Admin and Society Managers)
export const getSocietyUsers: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { societyId } = req.params;

    // Check permissions
    if (req.user.role === "society_user" || req.user.role === "agent") {
      if (req.user.societyId?.toString() !== societyId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const isMongoConnected = mongoose.connection.readyState === 1;
    let users;

    if (isMongoConnected) {
      users = await User.find({ societyId })
        .select("-password")
        .populate("societyId", "name")
        .sort({ createdAt: -1 });
    } else {
      // Mock implementation - filter users by society
      const allUsers = await MockDataService.findUserByEmail(""); // This will trigger initialization
      users = MockDataService["users"].filter(
        (user) => user.societyId === societyId,
      );
      // Remove passwords
      users = users.map(({ password, ...user }) => user);
    }

    res.json({ users });
  } catch (error) {
    console.error("Get society users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update user permissions (Admin only)
export const updateUserPermissions: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can update user permissions" });
    }

    const { userId } = req.params;
    const { permissions } = req.body;

    if (
      !permissions ||
      typeof permissions.canRead !== "boolean" ||
      typeof permissions.canWrite !== "boolean"
    ) {
      return res
        .status(400)
        .json({ error: "Valid permissions object is required" });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;
    let user;

    if (isMongoConnected) {
      user = await User.findByIdAndUpdate(
        userId,
        { permissions, updatedAt: new Date() },
        { new: true },
      )
        .select("-password")
        .populate("societyId", "name");
    } else {
      user = await MockDataService.updateUser(userId, { permissions });
      if (user) {
        const { password, ...userWithoutPassword } = user;
        user = userWithoutPassword;
      }
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User permissions updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user permissions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
