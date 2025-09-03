import { RequestHandler } from 'express';
import Transaction from '../models/Transaction';
import User from '../models/User';
import AuthUtils, { AuthenticatedRequest } from '../utils/auth';
import mongoose from 'mongoose';
import MockDataService from '../services/mockData';
import NotificationService from '../services/notificationService';

// Get transactions based on user role and permissions
export const getTransactions: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { page = 1, limit = 10, status, societyId } = req.query;
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    let filters: any = {};
    
    // Apply role-based filters
    if (req.user.role === 'society_user') {
      filters.societyId = req.user.societyId?.toString();
    } else if (req.user.role === 'agent') {
      filters.assignedToAgent = req.user._id.toString();
    } else if (req.user.role === 'admin' && societyId) {
      filters.societyId = societyId;
    }
    
    if (status) {
      filters.status = status;
    }

    let transactions;
    let total = 0;

    if (isMongoConnected) {
      const skip = (Number(page) - 1) * Number(limit);
      
      transactions = await Transaction.find(filters)
        .populate('createdBy', 'name email')
        .populate('societyId', 'name')
        .populate('assignedToAgent', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
        
      total = await Transaction.countDocuments(filters);
    } else {
      // Use mock data service
      const allTransactions = await MockDataService.getTransactions(filters);
      total = allTransactions.length;
      
      const skip = (Number(page) - 1) * Number(limit);
      transactions = allTransactions.slice(skip, skip + Number(limit));
    }

    res.json({
      transactions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single transaction by ID
export const getTransactionById: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const isMongoConnected = mongoose.connection.readyState === 1;
    let transaction;

    if (isMongoConnected) {
      transaction = await Transaction.findById(id)
        .populate('createdBy', 'name email')
        .populate('societyId', 'name address')
        .populate('assignedToAgent', 'name email')
        .populate('remarks.author', 'name email');
    } else {
      transaction = await MockDataService.findTransactionById(id);
    }

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check permissions
    if (req.user.role === 'society_user' && transaction.societyId?.toString() !== req.user.societyId?.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'agent' && transaction.assignedToAgent?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new transaction
export const createTransaction: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Only society users can create transactions
    if (req.user.role !== 'society_user') {
      return res.status(403).json({ error: 'Only society users can create transactions' });
    }

    const { vendorName, nature, amount, remarks } = req.body;

    if (!vendorName || !nature) {
      return res.status(400).json({ error: 'Vendor name and nature are required' });
    }

    const transactionData = {
      vendorName,
      nature,
      amount: amount ? Number(amount) : undefined,
      createdBy: req.user._id,
      societyId: req.user.societyId,
      status: 'pending_on_society' as const,
      remarks: remarks ? [{
        text: remarks,
        author: req.user._id,
        timestamp: new Date(),
        type: 'info' as const
      }] : []
    };

    const isMongoConnected = mongoose.connection.readyState === 1;
    let transaction;

    if (isMongoConnected) {
      transaction = new Transaction(transactionData);
      await transaction.save();
      await transaction.populate('createdBy', 'name email');
      await transaction.populate('societyId', 'name');
    } else {
      transaction = await MockDataService.createTransaction(transactionData);
    }

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update transaction status
export const updateTransactionStatus: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { status, remark } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending_on_society', 'pending_on_agent', 'pending_for_clarification', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;
    let transaction;

    if (isMongoConnected) {
      transaction = await Transaction.findById(id);
    } else {
      transaction = await MockDataService.findTransactionById(id);
    }

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check permissions based on role and current status
    if (req.user.role === 'society_user') {
      if (transaction.societyId?.toString() !== req.user.societyId?.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
      // Society users can only update when status is pending_for_clarification
      if (transaction.status !== 'pending_for_clarification') {
        return res.status(403).json({ error: 'Cannot update transaction in current status' });
      }
    } else if (req.user.role === 'agent') {
      if (transaction.assignedToAgent?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Update transaction
    const updates: any = { status };
    
    if (status === 'completed') {
      updates.completedAt = new Date();
    }

    // Add remark if provided
    if (remark) {
      const newRemark = {
        text: remark,
        author: req.user._id,
        timestamp: new Date(),
        type: status === 'completed' ? 'approval' as const : 
              status === 'pending_for_clarification' ? 'clarification' as const : 'info' as const
      };

      if (isMongoConnected) {
        transaction.remarks.push(newRemark);
        transaction.status = status;
        if (updates.completedAt) transaction.completedAt = updates.completedAt;
        await transaction.save();
      } else {
        await MockDataService.updateTransaction(id, updates);
        await MockDataService.addRemarkToTransaction(id, newRemark);
        transaction = await MockDataService.findTransactionById(id);
      }
    } else {
      if (isMongoConnected) {
        Object.assign(transaction, updates);
        await transaction.save();
      } else {
        await MockDataService.updateTransaction(id, updates);
        transaction = await MockDataService.findTransactionById(id);
      }
    }

    // Send notification for status change
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.sendTransactionUpdateNotification(
        transaction,
        req.user,
        status,
        remark
      );
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the transaction update if notification fails
    }

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Assign transaction to agent (Admin only)
export const assignTransactionToAgent: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can assign transactions' });
    }

    const { id } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;
    
    // Verify agent exists and has correct role
    let agent;
    if (isMongoConnected) {
      agent = await User.findById(agentId);
    } else {
      agent = await MockDataService.findUserById(agentId);
    }

    if (!agent || agent.role !== 'agent') {
      return res.status(400).json({ error: 'Invalid agent ID' });
    }

    // Update transaction
    const updates = {
      assignedToAgent: agentId,
      status: 'pending_on_agent' as const
    };

    let transaction;
    if (isMongoConnected) {
      transaction = await Transaction.findByIdAndUpdate(id, updates, { new: true })
        .populate('assignedToAgent', 'name email');
    } else {
      await MockDataService.updateTransaction(id, updates);
      transaction = await MockDataService.findTransactionById(id);
    }

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      message: 'Transaction assigned successfully',
      transaction
    });
  } catch (error) {
    console.error('Assign transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get dashboard statistics
export const getDashboardStats: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const stats = await MockDataService.getDashboardStats(
      req.user.role,
      req.user._id.toString(),
      req.user.societyId?.toString()
    );

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
