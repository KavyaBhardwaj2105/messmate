const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const RefreshSession = require('../models/RefreshSession');
const store = require('../data/store');
const { isMongoDB } = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendEmail } = require('../utils/mailer');

const hashToken = (value) => crypto.createHash('sha256').update(value).digest('hex');
const randomToken = () => crypto.randomBytes(32).toString('hex');
const accessExpires = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const refreshDays = Number.parseInt(process.env.REFRESH_TOKEN_DAYS || '30', 10);
const frontendUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));

const generateAccessToken = (id) => jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, { expiresIn: accessExpires });
const sanitizeUser = (user) => ({ _id: user._id, name: user.name, email: user.email, isEmailVerified: !!user.isEmailVerified, createdAt: user.createdAt });

const getRefreshCookieOptions = () => {
  const secure = process.env.NODE_ENV === 'production';
  const sameSite = String(process.env.COOKIE_SAMESITE || (secure ? 'none' : 'lax')).toLowerCase();
  return { secure, sameSite, domain: process.env.COOKIE_DOMAIN || '' };
};
const setRefreshCookie = (res, token) => {
  const { secure, sameSite, domain } = getRefreshCookieOptions();
  const parts = [`messmate_refresh=${encodeURIComponent(token)}`, 'HttpOnly', 'Path=/api/auth', `Max-Age=${refreshDays * 24 * 60 * 60}`, `SameSite=${sameSite}`];
  if (secure) parts.push('Secure');
  if (domain) parts.push(`Domain=${domain}`);
  res.setHeader('Set-Cookie', parts.join('; '));
};
const clearRefreshCookie = (res) => {
  const { secure, sameSite, domain } = getRefreshCookieOptions();
  const parts = ['messmate_refresh=', 'HttpOnly', 'Path=/api/auth', 'Max-Age=0', `SameSite=${sameSite}`];
  if (secure) parts.push('Secure');
  if (domain) parts.push(`Domain=${domain}`);
  res.setHeader('Set-Cookie', parts.join('; '));
};
const getRefreshCookie = (req) => {
  const raw = req.headers.cookie || '';
  const found = raw.split(';').map((x) => x.trim()).find((x) => x.startsWith('messmate_refresh='));
  return found ? decodeURIComponent(found.split('=').slice(1).join('=')) : null;
};

const issueRefreshToken = async (userId, req, familyId = crypto.randomUUID()) => {
  const raw = randomToken();
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + refreshDays * 86400000);
  const payload = { user: userId, tokenHash, familyId, expiresAt, userAgent: req.get('user-agent') || '', ip: req.ip };
  if (isMongoDB()) await RefreshSession.create(payload);
  else store.createRefreshSession(payload);
  return raw;
};

const revokeRefreshToken = async (raw) => {
  if (!raw) return;
  const tokenHash = hashToken(raw);
  if (isMongoDB()) await RefreshSession.updateOne({ tokenHash, revokedAt: null }, { revokedAt: new Date() });
  else store.revokeRefreshSession(tokenHash);
};

const findRefreshSession = async (raw) => {
  if (!raw) return null;
  const tokenHash = hashToken(raw);
  if (isMongoDB()) {
    return RefreshSession.findOne({ tokenHash }).lean();
  }
  return store.findRefreshSession(tokenHash);
};

const createVerification = async (user) => {
  const raw = randomToken();
  const hash = hashToken(raw);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (isMongoDB()) {
    await User.updateOne({ _id: user._id }, { emailVerificationTokenHash: hash, emailVerificationExpiresAt: expires });
  } else store.setUserVerification(user._id, hash, expires);
  const link = `${frontendUrl}/verify-email?token=${encodeURIComponent(raw)}`;
  await sendEmail({ to: user.email, subject: 'Verify your MessMate email', html: `<p>Hi ${escapeHtml(user.name)},</p><p>Verify your MessMate account:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>` });
  return link;
};

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = name.trim();
  let user;
  if (isMongoDB()) {
    if (await User.findOne({ email: cleanEmail })) throw new AppError('Email is already registered. Please log in instead.', 409);
    user = await User.create({ name: cleanName, email: cleanEmail, password, isEmailVerified: false });
  } else {
    if (store.findUserByEmail(cleanEmail)) throw new AppError('Email is already registered. Please log in instead.', 409);
    const hashedPassword = await bcrypt.hash(password, 12);
    user = store.createUser({ name: cleanName, email: cleanEmail, password: hashedPassword, isEmailVerified: false });
  }
  const verificationLink = await createVerification(user);
  return res.status(201).json({ success: true, message: 'Account created. Check your email to verify your address.', user: sanitizeUser(user), requiresEmailVerification: true, ...(process.env.NODE_ENV !== 'production' && { verificationLink }) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email.toLowerCase().trim();
  let user;
  if (isMongoDB()) user = await User.findOne({ email: cleanEmail }).select('+password +isEmailVerified');
  else user = store.findUserByEmail(cleanEmail);
  if (!user) throw new AppError('Invalid email or password.', 401);
  const ok = isMongoDB() ? await user.matchPassword(password) : await bcrypt.compare(password, user.password);
  if (!ok) throw new AppError('Invalid email or password.', 401);
  if (!user.isEmailVerified) throw new AppError('Please verify your email before signing in. Check your inbox for the verification link.', 403);
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await issueRefreshToken(user._id, req);
  setRefreshCookie(res, refreshToken);
  return res.json({ success: true, message: 'Logged in successfully!', token: accessToken, user: sanitizeUser(user) });
});

const refresh = asyncHandler(async (req, res) => {
  const raw = getRefreshCookie(req);
  const session = await findRefreshSession(raw);
  if (!session) { clearRefreshCookie(res); throw new AppError('Refresh session expired. Please log in again.', 401); }
  if (session.revokedAt) {
    if (isMongoDB()) await RefreshSession.updateMany({ familyId: session.familyId, revokedAt: null }, { revokedAt: new Date() });
    else store.revokeRefreshFamily(session.familyId);
    clearRefreshCookie(res);
    throw new AppError('Refresh session reuse detected. Please sign in again.', 401);
  }
  if (new Date(session.expiresAt) <= new Date()) { clearRefreshCookie(res); throw new AppError('Refresh session expired. Please log in again.', 401); }
  if (isMongoDB()) {
    const result = await RefreshSession.updateOne({ _id: session._id, revokedAt: null }, { revokedAt: new Date() });
    if (!result.modifiedCount) {
      await RefreshSession.updateMany({ familyId: session.familyId, revokedAt: null }, { revokedAt: new Date() });
      clearRefreshCookie(res);
      throw new AppError('Refresh session reuse detected. Please sign in again.', 401);
    }
  } else store.revokeRefreshSession(session.tokenHash);
  const user = isMongoDB() ? await User.findById(session.user) : store.findUserById(session.user);
  if (!user) throw new AppError('User no longer exists.', 401);
  if (!user.isEmailVerified) throw new AppError('Email verification is required.', 403);
  const nextRefresh = await issueRefreshToken(user._id, req, session.familyId);
  const nextHash = hashToken(nextRefresh);
  if (isMongoDB()) await RefreshSession.updateOne({ _id: session._id }, { replacedByHash: nextHash });
  else store.setRefreshReplacement(session.tokenHash, nextHash);
  setRefreshCookie(res, nextRefresh);
  return res.json({ success: true, token: generateAccessToken(user._id), user: sanitizeUser(user) });
});

const logout = asyncHandler(async (req, res) => { await revokeRefreshToken(getRefreshCookie(req)); clearRefreshCookie(res); res.json({ success: true, message: 'Logged out successfully.' }); });

const verifyEmail = asyncHandler(async (req, res) => {
  const hash = hashToken(req.body.token || req.query.token || '');
  let user;
  if (isMongoDB()) user = await User.findOne({ emailVerificationTokenHash: hash, emailVerificationExpiresAt: { $gt: new Date() } }).select('+emailVerificationTokenHash +emailVerificationExpiresAt');
  else user = store.findUserByVerification(hash);
  if (!user) throw new AppError('Verification link is invalid or expired.', 400);
  if (isMongoDB()) await User.updateOne({ _id: user._id }, { isEmailVerified: true, $unset: { emailVerificationTokenHash: 1, emailVerificationExpiresAt: 1 } });
  else store.verifyUser(user._id);
  res.json({ success: true, message: 'Email verified. You can now sign in.' });
});

const resendVerification = asyncHandler(async (req, res) => {
  const cleanEmail = String(req.body.email || '').toLowerCase().trim();
  const user = isMongoDB() ? await User.findOne({ email: cleanEmail }) : store.findUserByEmail(cleanEmail);
  if (user && !user.isEmailVerified) await createVerification(user);
  res.json({ success: true, message: 'If the account exists and is not verified, a new verification email has been sent.' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const cleanEmail = String(req.body.email || '').toLowerCase().trim();
  const user = isMongoDB() ? await User.findOne({ email: cleanEmail }) : store.findUserByEmail(cleanEmail);
  if (user) {
    const raw = randomToken(); const hash = hashToken(raw); const expires = new Date(Date.now() + 60 * 60 * 1000);
    if (isMongoDB()) await User.updateOne({ _id: user._id }, { passwordResetTokenHash: hash, passwordResetExpiresAt: expires });
    else store.setUserReset(user._id, hash, expires);
    const link = `${frontendUrl}/reset-password?token=${encodeURIComponent(raw)}`;
    await sendEmail({ to: user.email, subject: 'Reset your MessMate password', html: `<p>Hi ${escapeHtml(user.name)},</p><p>Reset your password:</p><p><a href="${link}">${link}</a></p><p>This link expires in 60 minutes.</p>` });
  }
  res.json({ success: true, message: 'If an account exists for that email, a password reset link has been sent.' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const hash = hashToken(req.body.token || ''); const password = req.body.password;
  let user;
  if (isMongoDB()) user = await User.findOne({ passwordResetTokenHash: hash, passwordResetExpiresAt: { $gt: new Date() } }).select('+passwordResetTokenHash +passwordResetExpiresAt');
  else user = store.findUserByReset(hash);
  if (!user) throw new AppError('Reset link is invalid or expired.', 400);
  if (isMongoDB()) { user.password = password; user.passwordResetTokenHash = undefined; user.passwordResetExpiresAt = undefined; await user.save(); await RefreshSession.deleteMany({ user: user._id }); }
  else { const hashed = await bcrypt.hash(password, 12); store.resetUserPassword(user._id, hashed); store.revokeAllRefreshSessions(user._id); }
  res.json({ success: true, message: 'Password reset successfully. Please sign in again.' });
});

const getMe = asyncHandler(async (req, res) => res.json({ success: true, user: req.user }));

module.exports = { signup, login, refresh, logout, verifyEmail, resendVerification, forgotPassword, resetPassword, getMe };
