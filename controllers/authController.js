const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Approved university email domains
const APPROVED_STUDENT_DOMAINS = [
  'kristujayanti.com',
  'edu.in',
  'ac.in',
  'iiit.ac.in',
  'nit.ac.in',
  'iit.ac.in',
  'edu'
];

const isApprovedStudentEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return APPROVED_STUDENT_DOMAINS.some(approved =>
    domain === approved || domain.endsWith('.' + approved)
  );
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, userType: user.userType },
    process.env.JWT_SECRET || 'smartlaundry_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, userType, studentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login.'
      });
    }

    // Validate student email
    if (userType === 'student') {
      if (!isApprovedStudentEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please use your university email address (e.g., yourname@college.edu.in)'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-verify if approved domain
    const autoVerified = userType === 'student' && isApprovedStudentEmail(email);
    const verStatus = userType === 'student'
      ? (autoVerified ? 'approved' : 'pending')
      : 'not_required';

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      userType: userType || 'customer',
      studentIdNumber: studentId || '',
      studentVerified: autoVerified,
      verificationStatus: verStatus
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: autoVerified
        ? 'Account created! 🎓 Student discount activated automatically!'
        : userType === 'student'
        ? 'Account created! Your student ID will be verified by admin soon.'
        : 'Account created successfully! Welcome to Smart Laundry!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          studentVerified: user.studentVerified,
          verificationStatus: user.verificationStatus
        }
      }
    });

  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          studentVerified: user.studentVerified,
          verificationStatus: user.verificationStatus
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// GET CURRENT USER
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          user_type: user.userType,
          student_verified: user.studentVerified,
          verification_status: user.verificationStatus,
          created_at: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('GetMe error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get user info'
    });
  }
};

// GET PENDING STUDENTS
exports.getPendingStudents = async (req, res) => {
  try {
    const students = await User.find({
      userType: 'student',
      verificationStatus: 'pending'
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        students: students.map(s => ({
          id: s._id,
          name: s.name,
          email: s.email,
          phone: s.phone,
          student_id_number: s.studentIdNumber,
          verification_status: s.verificationStatus,
          created_at: s.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('GetPendingStudents error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending students'
    });
  }
};

// VERIFY STUDENT
exports.verifyStudent = async (req, res) => {
  try {
    const { userId, approved } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const status = approved ? 'approved' : 'rejected';

    await User.findByIdAndUpdate(userId, {
      studentVerified: approved,
      verificationStatus: status,
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    });

    res.json({
      success: true,
      message: approved
        ? 'Student verified! Discount activated.'
        : 'Student verification rejected.'
    });

  } catch (error) {
    console.error('VerifyStudent error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.'
    });
  }
};
