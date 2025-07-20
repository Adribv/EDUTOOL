const mongoose = require('mongoose');

const salaryTemplateSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: [
      'Teacher', 'HOD', 'VicePrincipal', 'Principal', 
      'AdminStaff', 'ITAdmin', 'Counsellor', 'Accountant', 'ClassCoord'
    ],
    unique: true
  },
  roleDisplayName: {
    type: String,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true,
    min: 0
  },
  allowances: {
    houseRentAllowance: { type: Number, default: 0, min: 0 },
    dearnessAllowance: { type: Number, default: 0, min: 0 },
    transportAllowance: { type: Number, default: 0, min: 0 },
    medicalAllowance: { type: Number, default: 0, min: 0 },
    otherAllowances: { type: Number, default: 0, min: 0 },
    // Additional allowances
    specialAllowance: { type: Number, default: 0, min: 0 },
    performanceAllowance: { type: Number, default: 0, min: 0 },
    educationAllowance: { type: Number, default: 0, min: 0 },
    uniformAllowance: { type: Number, default: 0, min: 0 }
  },
  deductions: {
    providentFund: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    insurance: { type: Number, default: 0, min: 0 },
    otherDeductions: { type: Number, default: 0, min: 0 },
    // Additional deductions
    professionalTax: { type: Number, default: 0, min: 0 },
    loanDeduction: { type: Number, default: 0, min: 0 },
    advanceDeduction: { type: Number, default: 0, min: 0 },
    unionDues: { type: Number, default: 0, min: 0 }
  },
  // Tax calculation settings
  taxSettings: {
    taxSlab: {
      type: String,
      enum: ['0-250000', '250001-500000', '500001-1000000', '1000000+'],
      default: '0-250000'
    },
    taxPercentage: { type: Number, default: 0, min: 0, max: 100 },
    surcharge: { type: Number, default: 0, min: 0, max: 100 },
    educationCess: { type: Number, default: 4, min: 0, max: 100 }
  },
  // PF settings
  pfSettings: {
    pfPercentage: { type: Number, default: 12, min: 0, max: 100 },
    pfLimit: { type: Number, default: 15000, min: 0 },
    employerContribution: { type: Number, default: 12, min: 0, max: 100 }
  },
  // Additional benefits
  benefits: {
    gratuity: { type: Boolean, default: true },
    leaveEncashment: { type: Boolean, default: true },
    bonus: { type: Boolean, default: true },
    healthInsurance: { type: Boolean, default: true },
    lifeInsurance: { type: Boolean, default: true }
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  effectiveTo: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  version: {
    type: Number,
    default: 1
  },
  changeHistory: [{
    version: Number,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changes: {
      basicSalary: { from: Number, to: Number },
      allowances: {
        houseRentAllowance: { from: Number, to: Number },
        dearnessAllowance: { from: Number, to: Number },
        transportAllowance: { from: Number, to: Number },
        medicalAllowance: { from: Number, to: Number },
        otherAllowances: { from: Number, to: Number },
        specialAllowance: { from: Number, to: Number },
        performanceAllowance: { from: Number, to: Number },
        educationAllowance: { from: Number, to: Number },
        uniformAllowance: { from: Number, to: Number }
      },
      deductions: {
        providentFund: { from: Number, to: Number },
        tax: { from: Number, to: Number },
        insurance: { from: Number, to: Number },
        otherDeductions: { from: Number, to: Number },
        professionalTax: { from: Number, to: Number },
        loanDeduction: { from: Number, to: Number },
        advanceDeduction: { from: Number, to: Number },
        unionDues: { from: Number, to: Number }
      }
    },
    reason: String
  }]
}, {
  timestamps: true
});

// Pre-save middleware to calculate totals
salaryTemplateSchema.pre('save', function(next) {
  // Calculate total allowances
  this.totalAllowances = Object.values(this.allowances).reduce((sum, val) => sum + (val || 0), 0);
  
  // Calculate total deductions
  this.totalDeductions = Object.values(this.deductions).reduce((sum, val) => sum + (val || 0), 0);
  
  // Calculate gross and net salary
  this.grossSalary = this.basicSalary + this.totalAllowances;
  this.netSalary = this.grossSalary - this.totalDeductions;
  
  // Calculate PF based on settings
  this.calculatedPF = Math.min(this.basicSalary * (this.pfSettings.pfPercentage / 100), this.pfSettings.pfLimit);
  
  // Calculate tax based on settings
  this.calculatedTax = this.calculateTaxAmount();
  
  next();
});

// Method to calculate tax amount
salaryTemplateSchema.methods.calculateTaxAmount = function() {
  const annualSalary = this.grossSalary * 12;
  let taxAmount = 0;
  
  // Tax slabs (simplified)
  if (annualSalary <= 250000) {
    taxAmount = 0;
  } else if (annualSalary <= 500000) {
    taxAmount = (annualSalary - 250000) * 0.05;
  } else if (annualSalary <= 1000000) {
    taxAmount = 12500 + (annualSalary - 500000) * 0.2;
  } else {
    taxAmount = 112500 + (annualSalary - 1000000) * 0.3;
  }
  
  // Add surcharge if applicable
  if (annualSalary > 5000000) {
    taxAmount += taxAmount * (this.taxSettings.surcharge / 100);
  }
  
  // Add education cess
  taxAmount += taxAmount * (this.taxSettings.educationCess / 100);
  
  return Math.round(taxAmount / 12); // Monthly tax
};

// Virtual for total allowances
salaryTemplateSchema.virtual('totalAllowances').get(function() {
  return Object.values(this.allowances).reduce((sum, val) => sum + (val || 0), 0);
});

// Virtual for total deductions
salaryTemplateSchema.virtual('totalDeductions').get(function() {
  return Object.values(this.deductions).reduce((sum, val) => sum + (val || 0), 0);
});

// Virtual for gross salary
salaryTemplateSchema.virtual('grossSalary').get(function() {
  return this.basicSalary + this.totalAllowances;
});

// Virtual for net salary
salaryTemplateSchema.virtual('netSalary').get(function() {
  return this.grossSalary - this.totalDeductions;
});

// Virtual for calculated PF
salaryTemplateSchema.virtual('calculatedPF').get(function() {
  return Math.min(this.basicSalary * (this.pfSettings.pfPercentage / 100), this.pfSettings.pfLimit);
});

// Virtual for calculated tax
salaryTemplateSchema.virtual('calculatedTax').get(function() {
  return this.calculateTaxAmount();
});

// Index for efficient queries
salaryTemplateSchema.index({ role: 1, isActive: 1 });
salaryTemplateSchema.index({ effectiveFrom: 1, effectiveTo: 1 });

const SalaryTemplate = mongoose.model('SalaryTemplate', salaryTemplateSchema);

module.exports = SalaryTemplate; 