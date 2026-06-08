const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a project name'],
      trim: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    budget: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    deadline: {
      type: Date,
      required: [true, 'Please add a deadline date'],
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Testing', 'Completed', 'Delayed'],
      default: 'Not Started',
    },
    assignedTeamLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
